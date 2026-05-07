import { InjectRepository } from '@nestjs/typeorm';
// import { ReviewerTasks } from '../enitities/ReviewerTasks.entity';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSetReview } from '../enitities/DataSetReview.entity';
import { TaskService } from 'src/project/service/Task.service';
import { DataSetStatus } from 'src/utils/constants/DataSetStatus.constant';
import { DataSet } from 'src/data_set/entities/DataSet.entity';
import { User } from 'src/auth/entities/User.entity';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { paginate, PaginatedResult } from 'src/utils/paginate.util';
import { TaskReviewersProgressRto } from '../rto/TaskMonitoring.rto';
import { CacheService } from 'src/cache/CacheService.service';

// You can also create a DTO if you want to shape the output more strictly
interface DataSetListItemDto {
  id: string;
  code?: string;
  status: DataSetStatus;
  type: 'audio' | 'text' | 'image';
  created_date: Date;
  activeReviewCount: number;
  dataSetReviews?: Array<{
    id: number;
    reviewer: { id: string };
    status: 'pending' | 'approved' | 'rejected';
    expires_at: Date;
    assigned_at: Date; // note: was boolean in your entity — probably typo?
  }>;
}
@Injectable()
export class ReviewerTaskDistributionsService {
  constructor(
    @InjectRepository(DataSetReview)
    private readonly dataSetReviewRepository: Repository<DataSetReview>,
    private readonly dataSource: DataSource,
    private readonly taskService: TaskService,
    private readonly cacheService: CacheService,
  ) {}

  async distributeTaskDataSets(taskId: string) {
    //  Maka the request idempotent
    const key = `task_reviewer_${taskId}`;
    const cachedData = await this.cacheService.get(key);
    if (cachedData) {
      return cachedData;
    }
    await this.cacheService.set(key, 'processing', 10);
    const pendingDataSets: DataSetListItemDto[] =
      await this.findPendingSubmissionsWithReviewCount(taskId);
    const reviewersWithAssignment =
      await this.getReviewersWithAssignmentCountByTask(taskId);

    // console.log("Reviewers  with assignment:", reviewersWithAssignment);
    // return ;

    const task = await this.taskService.findOne({
      where: { id: taskId },
      relations: { taskRequirement: true },
    });
    const maxDataSetPerReviewer =
      task?.taskRequirement.max_dataset_per_reviewer || 0;
    const reviewTimeLimit = task?.reviewer_completion_time_limit || 48;
    const MAX_REVIEWER_PER_DATASET =
      task?.taskRequirement.max_reviewer_per_dataset || 1;
    const assignments = await this.assignDatasetsForReview(
      reviewTimeLimit,
      MAX_REVIEWER_PER_DATASET,
      maxDataSetPerReviewer,
      pendingDataSets,
      reviewersWithAssignment,
    );
    const dataSetReviews: any[] = assignments.map((d) => ({
      data_set_id: d.datasetId,
      task_id: task?.id,
      reviewer_id: d.reviewerId,
      status: 'pending',
      expires_at: d.expiresAt,
      assigned_at: new Date(),
    }));
    await this.dataSetReviewRepository.save(dataSetReviews);

    await this.cacheService.del(key);
    return dataSetReviews;
  }
  async findPendingSubmissionsWithReviewCount(
    taskId: string,
  ): Promise<DataSetListItemDto[]> {
    const now = new Date();
    const qb = this.dataSource
      .getRepository(DataSet)
      .createQueryBuilder('ds')
      .leftJoin('ds.microTask', 'mt')

      // Filters
      .where('mt.task_id = :taskId', { taskId })
      .andWhere('ds.status = :status', { status: 'Pending' })
      // DTO projection
      .select([
        'ds.id AS id',
        'ds.code AS code',
        'ds.status AS status',
        'ds.type AS type',
        'ds.created_date AS created_date',
      ])

      // Active review count (CORRELATED SUBQUERY)
      .addSelect(
        (subQb) =>
          subQb
            .select('COUNT(*)')
            .from('data_set_review', 'dsr')
            .where('dsr.data_set_id = ds.id')
            .andWhere(
              new Brackets((qb) => {
                qb.where('dsr.status = :pending AND dsr.expires_at > :now', {
                  pending: 'pending',
                  now: new Date(),
                }).orWhere('dsr.status IN (:...reviewed)', {
                  reviewed: ['approved', 'rejected'],
                });
              }),
            ),
        'activeReviewCount',
      )
      // Reviews as JSON
      .addSelect(
        (subQb) =>
          subQb
            .select(
              `
          COALESCE(
            json_agg(
              json_build_object(
                'id', dsr.id,
                'status', dsr.status,
                'expires_at', dsr.expires_at,
                'assigned_at', dsr.assigned_at,
                'reviewer', json_build_object('id', r.id)
              )
            ) FILTER (WHERE dsr.id IS NOT NULL),
            '[]'
          )
        `,
            )
            .from('data_set_review', 'dsr')
            .leftJoin('dsr.reviewer', 'r')
            .where('dsr.data_set_id = ds.id')
            .andWhere(
              new Brackets((qb) => {
                qb.where('dsr.status = :pending AND dsr.expires_at > :now', {
                  pending: 'pending',
                  now,
                }).orWhere('dsr.status IN (:...reviewed)', {
                  reviewed: ['approved', 'rejected'],
                });
              }),
            ),
        'dataSetReviews',
      );

    return qb.getRawMany();
  }

  private async getReviewersWithAssignmentCountByTask(taskId: string): Promise<
    {
      reviewerId: string;
      assignmentCount: number;
      score: number;
    }[]
  > {
    const data = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('r')

      // reviewer is a member of the task
      .innerJoin(
        'r.userToTasks',
        'ut',
        'ut.task_id = :taskId AND ut.role = :role',
        { taskId, role: 'Reviewer' },
      )
      // include user score
      .leftJoin('r.score', 's')

      // include all dataset reviews of this reviewer
      .leftJoin('r.dataSetReviews', 'dr', 'dr.reviewer_id = r.id')
      .leftJoin('dr.dataSet', 'd')
      .leftJoin('d.microTask', 'mt', 'mt.task_id = :taskId', { taskId })

      // select reviewer id
      .select('r.id', 'reviewerId')
      // select average score
      .addSelect('s.score', 'score')

      // count only pending/unexpired OR approved/rejected reviews for this task
      .addSelect(
        `
    COUNT(DISTINCT CASE
      WHEN mt.task_id = :taskId
        AND (
          (dr.status = 'pending' AND dr.expires_at > CURRENT_TIMESTAMP)
          OR dr.status IN ('approved', 'rejected')
        )
      THEN dr.id
      ELSE NULL
    END)
  `,
        'assignmentCount',
      )

      /*************  ✨ Windsurf Command 🌟  *************/
      .groupBy('r.id')
      .addGroupBy('s.score')
      .setParameter('taskId', taskId)
      .getRawMany();

    return data.map((d) => ({
      reviewerId: d.reviewerId,
      assignmentCount: Number(d.assignmentCount),
      score: Number(d.score),
    }));
  }
  private async assignDatasetsForReview(
    expireTime: number,
    MAX_REVIEWER_PER_DATASET: number,
    MAX_DATASET_PER_REVIEWER: number,
    pendingDataSets: DataSetListItemDto[],
    reviewersWithAssignment: {
      reviewerId: string;
      assignmentCount: number;
      score: number;
    }[],
  ): Promise<
    {
      datasetId: string;
      reviewerId: string;
      status: 'PENDING';
      assignedAt: Date;
      expiresAt: Date;
    }[]
  > {
    const reviewerLoad = new Map<string, number>();
    reviewersWithAssignment.forEach((r) =>
      reviewerLoad.set(r.reviewerId, r.assignmentCount),
    );

    // Sort reviewers by current load ascending to balance assignments
    const sortedReviewers = [...reviewersWithAssignment].sort(
      (a, b) => a.assignmentCount - b.assignmentCount,
    );

    // Change the order of reviewers randomly
    shuffle(sortedReviewers);
    // sort by score descending
    sortedReviewers.sort((a, b) => b.score - a.score);

    // Exit function early if there are no pending datasets
    const newAssignments: Array<{
      datasetId: string;
      reviewerId: string;
      status: 'PENDING';
      assignedAt: Date;
      expiresAt: Date;
    }> = [];

    for (const dataset of pendingDataSets) {
      // Active reviewers already assigned
      const assignedReviewers = new Set(
        dataset.dataSetReviews?.map((r) => r.reviewer.id) || [],
      );

      // Calculate how many more reviewers needed
      let needed = MAX_REVIEWER_PER_DATASET - assignedReviewers.size;
      if (needed <= 0) continue;

      for (const reviewer of sortedReviewers) {
        if (needed === 0) break;

        const currentLoad = reviewerLoad.get(reviewer.reviewerId) ?? 0;

        // Skip if reviewer reached max capacity
        if (currentLoad >= MAX_DATASET_PER_REVIEWER) continue;

        // Skip if reviewer already assigned to this dataset
        if (assignedReviewers.has(reviewer.reviewerId)) continue;

        // Assign
        newAssignments.push({
          datasetId: dataset.id,
          reviewerId: reviewer.reviewerId,
          status: 'PENDING',
          assignedAt: new Date(),
          expiresAt: this.getExpiry(expireTime),
        });
        // Update in-memory trackers
        assignedReviewers.add(reviewer.reviewerId);
        reviewerLoad.set(reviewer.reviewerId, currentLoad + 1);
        needed--;
      }
    }
    return newAssignments;
  }

  private getExpiry(time: number): Date {
    return new Date(Date.now() + time * 60 * 60 * 1000); // 48h expiry
  }
  async getTaskReviewerStats(
    task_id: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<TaskReviewersProgressRto>> {
    const reviewerStat = await this.dataSource.query(
      `
    SELECT 
      u.id AS reviewer_id,
      u.first_name,
      u.middle_name,
      u.last_name,
      u.phone_number,
      u.email,

      COALESCE(SUM(
        CASE 
          WHEN dsr.status = 'pending'
          AND dsr.expires_at > NOW()
          THEN 1 
          ELSE 0 
        END
      ), 0) AS pending_count,

      COALESCE(SUM(
        CASE 
          WHEN dsr.status IN ('approved', 'rejected')
          THEN 1 
          ELSE 0 
        END
      ), 0) AS reviewed_count

    FROM users u
    INNER JOIN data_set_review dsr
      ON dsr.reviewer_id = u.id
     AND dsr.task_id = $1

    GROUP BY 
      u.id,
      u.first_name,
      u.middle_name,
      u.last_name,
      u.phone_number,
      u.email
  `,
      [task_id],
    );

    return paginate(
      reviewerStat,
      reviewerStat.length,
      paginationDto.page || 1,
      paginationDto.limit || 10,
    );
  }
}
function shuffle(
  sortedReviewers: {
    reviewerId: string;
    assignmentCount: number;
    score: number;
  }[],
) {
  for (let i = sortedReviewers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sortedReviewers[i], sortedReviewers[j]] = [
      sortedReviewers[j],
      sortedReviewers[i],
    ];
  }
}
