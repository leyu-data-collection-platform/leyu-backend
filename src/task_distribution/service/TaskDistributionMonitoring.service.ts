import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MicroTaskStatisticsService } from './MicroTaskStatistics.service';
import { ContributorMicroTaskService } from './ContributorMicroTask.service';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { DataSetService } from 'src/data_set/service/DataSet.service';
import { ReviewerTaskService } from './ReviewerTasks.service';
import { UserTaskService } from 'src/project/service/UserTask.service';
import { TaskDataSetReviewerDistributionRto } from '../rto/TaskMonitoring.rto';
import { ContributorTaskProgressRto } from '../rto/Task.rto';
import { ContributorMicroTasksConstantStatus } from 'src/utils/constants/ContributorMicroTasks.constant';
import { Task } from 'src/project/entities/Task.entity';

@Injectable()
export class TaskDistributionMonitoringService {
  constructor(
    private readonly microTaskStatisticsService: MicroTaskStatisticsService,
    private readonly contributorMicroTaskService: ContributorMicroTaskService,
    private readonly dataSetService: DataSetService,
    private readonly userTaskService: UserTaskService,
    private readonly reviewerTaskService: ReviewerTaskService,
    private readonly dataSource: DataSource,
  ) {}
  async getTaskDistributionStatistics(task_id: string) {
    // get total contributor microtask grouped by their status
    const contributorMicroTasksGroupedByStatus =
      await this.contributorMicroTaskService.getTotalContributorsGroupedByStatus(
        task_id,
      );

    // get language statistics and dialect statistics
    const languageStatistics =
      await this.contributorMicroTaskService.getContributorLanguageAndDialectDistributionStatistics(
        task_id,
      );
    // get gender statistics
    const genderStatistics =
      await this.contributorMicroTaskService.getContributorGenderDistributionStatistics(
        task_id,
      );
    // get total distributed and undestributed microtasks
    const microTaskGroupedStatistics =
      await this.microTaskStatisticsService.getGroupedMicroTaskStatisticsByNumberOfContributors(
        task_id,
      );
    return {
      total_contributor_micro_tasks: contributorMicroTasksGroupedByStatus,
      total_micro_tasks: microTaskGroupedStatistics,
      language_statistics: languageStatistics,
      gender_statistics: genderStatistics,
    };
  }
  async getTaskAssignedContributors(
    task_id: string,
    paginationDto: PaginationDto,
  ) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const offset = (page - 1) * limit;
    return this.contributorMicroTaskService.getTaskContributors(
      task_id,
      paginationDto,
    );
  }
  async getMicroTaskStatisticsByTaskId(
    task_id: string,
    paginationDto: PaginationDto,
  ) {
    return this.microTaskStatisticsService.getMicroTaskStatisticsByTaskId(
      task_id,
      paginationDto,
    );
  }
  /**
   * Retrieves the distribution status of a task's data sets for reviewers.
   * This method returns the total number of data sets assigned to reviewers,
   * the total number of data sets reviewed by reviewers, and the total number
   * of data sets remaining to be assigned to reviewers.
   * @param {string} task_id - Unique identifier of the task.
   * @returns {Promise<TaskDataSetReviewerDistributionRto>} - Task data set distribution status for reviewers.
   */
  async getTaskDataSetDistributionStatusForReviewers(
    task_id: string,
  ): Promise<TaskDataSetReviewerDistributionRto> {
    return this.reviewerTaskService.getTaskDataSetReviewStats(task_id);
  }

  async getContributorTaskProgress(
    task_id: string,
    contributor_id: string,
  ): Promise<ContributorTaskProgressRto> {
    const contributorMicroTasks =
      await this.contributorMicroTaskService.findAll({
        contributor_id,
        task_id,
      });
    const totalAssignedMicroTasks = contributorMicroTasks
      .map((cmt) => cmt.micro_task_ids.length)
      .reduce((a, b) => a + b, 0);
    let completedMicroTasks = contributorMicroTasks
      .filter(
        (cmt) => cmt.status === ContributorMicroTasksConstantStatus.COMPLETED,
      )
      .map((cmt) => cmt.micro_task_ids.length)
      .reduce((a, b) => a + b, 0);
    let pendingMicroTasks = contributorMicroTasks
      .filter((cmt) => cmt.status === ContributorMicroTasksConstantStatus.NEW)
      .map((cmt) => cmt.micro_task_ids.length)
      .reduce((a, b) => a + b, 0);
    const undoneInProgressMicroTasks = contributorMicroTasks
      .filter(
        (cmt) => cmt.status === ContributorMicroTasksConstantStatus.IN_PROGRESS,
      )
      .map((cmt) => cmt.micro_task_ids.length - cmt.current_batch)
      .reduce((a, b) => a + b, 0);
    pendingMicroTasks += undoneInProgressMicroTasks;
    const totalExpiredMicroTasks = contributorMicroTasks
      .filter(
        (cmt) => cmt.status === ContributorMicroTasksConstantStatus.EXPIRED,
      )
      .map((cmt) => cmt.micro_task_ids.length - cmt.current_batch)
      .reduce((a, b) => a + b, 0);
    const rejectedDataSets = await this.dataSetService.findAll({
      where: {
        microTask: {
          task_id,
        },
        status: 'Rejected',
        contributor_id,
      },
    });
    const doneAssignments = contributorMicroTasks
      .filter(
        (cmt) => cmt.status === ContributorMicroTasksConstantStatus.IN_PROGRESS,
      )
      .map((cmt) => cmt.current_batch)
      .reduce((a, b) => a + b, 0);
    console.log('doneAssignments', doneAssignments);
    completedMicroTasks += doneAssignments;
    const totalRejectedDataSets = rejectedDataSets.length;
    const task = await this.dataSource.getRepository(Task).findOne({
      where: {
        id: task_id,
      },
      relations: {
        taskType: true,
      },
    });
    const dataSets = await this.dataSetService.findAll({
      where: {
        microTask: {
          task_id,
        },
        contributor_id,
      },
    });
    let totalSubmittedHrs = 0;
    if (
      task &&
      ['text-audio', 'image-audio'].includes(task.taskType.task_type)
    ) {
      totalSubmittedHrs = dataSets.reduce((total, dataSet) => {
        dataSet.audio_duration && (total += dataSet.audio_duration);
        return total;
      }, 0);
    }
    const underReviewDataSets = dataSets.filter(
      (dataSet) => dataSet.status === 'Pending',
    ).length;
    return {
      pending_micro_tasks: pendingMicroTasks,
      completed_micro_tasks: completedMicroTasks,
      rejected_datasets: totalRejectedDataSets,
      under_review_datasets: underReviewDataSets,
      total_submitted_hrs: totalSubmittedHrs,
      total_expired_micro_tasks: totalExpiredMicroTasks,
    };
  }
}
