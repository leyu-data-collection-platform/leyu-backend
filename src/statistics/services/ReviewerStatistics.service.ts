import { Injectable } from '@nestjs/common';
import { MicroTaskService } from 'src/data_set/service/MicroTask.service';
import { ReviewerTaskService } from 'src/task_distribution/service/ReviewerTasks.service';
import { DataSetType } from 'src/utils/constants/Task.constant';

@Injectable()
export class ReviewerStatistics {
  constructor(
    private readonly reviewerTaskService: ReviewerTaskService,
    private readonly microTaskService: MicroTaskService,
  ) {}
  async getReviewStatistics(reviewerId: string) {
    const textDataSet = await this.reviewerTaskService.countByOptions({
      reviewer_id: reviewerId,
      dataSet: { type: DataSetType.TEXT },
    });
    const audioDataSet = await this.reviewerTaskService.countByOptions({
      reviewer_id: reviewerId,
      dataSet: { type: DataSetType.AUDIO },
    });
    const totalDataSet = textDataSet + audioDataSet;
    return { textDataSet, audioDataSet, totalDataSet };
  }
}
