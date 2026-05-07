import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, QueryRunner, Repository } from 'typeorm';
import { PaginationService } from 'src/common/service/pagination.service';
import { QueryOptions } from 'src/utils/queryOption.util';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { TaskInstruction } from '../entities/TaskInstruction.entity';
import { PaginatedResult } from 'src/utils/paginate.util';
import { ReviewerTaskInstruction } from '../entities/ReviewerTaskInstruction.entity';
import { QATaskInstruction } from '../entities/QATaskInstruction.entity';

@Injectable()
export class taskInstructionervice {
  constructor(
    @InjectRepository(TaskInstruction)
    private readonly taskInstructionRepository: Repository<TaskInstruction>,

    @InjectRepository(ReviewerTaskInstruction)
    private readonly reviewerInstructionRepository: Repository<ReviewerTaskInstruction>,

    @InjectRepository(QATaskInstruction)
    private readonly qaInstructionRepository: Repository<QATaskInstruction>,

    private readonly paginateService: PaginationService<TaskInstruction>,
  ) {
    this.paginateService = new PaginationService<TaskInstruction>(
      this.taskInstructionRepository,
    );
  }

  async create(
    taskInstructionData: Partial<TaskInstruction>,
    queryRunner?: QueryRunner,
  ): Promise<TaskInstruction> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      const taskInstruction = manager.create(
        TaskInstruction,
        taskInstructionData,
      );
      return await manager.save(TaskInstruction, taskInstruction);
    } else {
      const manager = this.taskInstructionRepository;
      const taskInstruction = manager.create(taskInstructionData);
      return await manager.save(taskInstruction);
    }
  }
  async createReviewerInstruction(
    taskInstructionData: Partial<TaskInstruction>,
  ): Promise<TaskInstruction> {
    const taskInstruction =
      this.reviewerInstructionRepository.create(taskInstructionData);
    return await this.reviewerInstructionRepository.save(taskInstruction);
  }
  async createQAInstruction(
    taskInstructionData: Partial<TaskInstruction>,
  ): Promise<TaskInstruction> {
    const taskInstruction =
      this.qaInstructionRepository.create(taskInstructionData);
    return await this.qaInstructionRepository.save(taskInstruction);
  }

  async findAll(
    queryOption: QueryOptions<TaskInstruction>,
    queryRunner?: QueryRunner,
  ): Promise<TaskInstruction[]> {
    return await this.taskInstructionRepository.find(queryOption);
  }

  async findPaginate(
    queryOption: QueryOptions<TaskInstruction>,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<TaskInstruction>> {
    return await this.paginateService.paginateWithOptionQuery(
      paginationDto,
      'task_instruction',
      queryOption,
    );
  }

  async findOne(
    queryOption: QueryOptions<TaskInstruction>,
    // queryRunner?: QueryRunner,
  ): Promise<TaskInstruction | null> {
    return await this.taskInstructionRepository.findOne(queryOption);
  }

  async update(
    id: string,
    type: 'qa' | 'reviewer' | 'contributor',
    taskInstructionData: Partial<TaskInstruction>,
  ): Promise<
    TaskInstruction | ReviewerTaskInstruction | QATaskInstruction | null
  > {
    if (type == 'contributor') {
      const manager = this.taskInstructionRepository;
      await manager.update(id, taskInstructionData);
      return await manager.findOne({ where: { id } });
    } else if (type == 'reviewer') {
      const manager = this.reviewerInstructionRepository;
      await manager.update(id, taskInstructionData);
      return await manager.findOne({ where: { id } });
    } else {
      const manager = this.qaInstructionRepository;
      await manager.update(id, taskInstructionData);
      return await manager.findOne({ where: { id } });
    }
  }

  async remove(
    id: string,
    type: 'qa' | 'reviewer' | 'contributor',
  ): Promise<DeleteResult> {
    if (type == 'contributor') {
      return await this.taskInstructionRepository.delete(id);
    } else if (type == 'reviewer') {
      return await this.reviewerInstructionRepository.delete(id);
    } else {
      return await this.qaInstructionRepository.delete(id);
    }
  }
}
