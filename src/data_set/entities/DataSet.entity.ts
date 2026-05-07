import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MicroTask } from './MicroTask.entity';
import { User } from 'src/auth/entities/User.entity';
import { RejectionReason } from './RejectionReason.entity';
import { DataSetStatus } from 'src/utils/constants/DataSetStatus.constant';
import { Dialect, Language } from 'src/base_data/entities';
import { FlagReason } from './FlagReason.entity';
import { DataSetReview } from 'src/task_distribution/enitities/DataSetReview.entity';

@Entity('data_set')
export class DataSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  text_data_set: string;

  @Column({
    type: 'enum',
    default: DataSetStatus.PENDING,
    enum: [
      DataSetStatus.PENDING,
      DataSetStatus.Flagged,
      DataSetStatus.APPROVED,
      DataSetStatus.REJECTED,
    ], //["Pending", "UnderReview" ,"Approved","Rejected" ]
  })
  status: 'Pending' | 'Flagged' | 'Approved' | 'Rejected';

  @Column({
    default: false,
  })
  is_draft: boolean;

  @Column({
    default: false,
  })
  is_flagged: boolean;

  @Column({
    default: 'completed',
  })
  queue_status: 'pending' | 'completed' | 'failed';

  @Column({
    default: false,
  })
  is_paid_for_contributor: boolean;

  @Column({ default: false })
  is_paid_for_reviewer: boolean;

  @Column({ default: false })
  is_test: boolean;

  @Column({ nullable: true, type: 'float' })
  audio_duration: number;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @Column({ nullable: true })
  file_path: string;

  @Column({ nullable: true, enum: ['audio', 'text', 'image'] })
  type: 'audio' | 'text' | 'image';

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;

  // Attempt belongs to MicroTask
  @ManyToOne(() => MicroTask, (question) => question.dataSets)
  @JoinColumn({ name: 'micro_task_id' })
  microTask: MicroTask;

  @Column({ nullable: true })
  micro_task_id: string;
  // Attempt belongs to User as Contributor
  @ManyToOne(() => User, (user) => user.contributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contributor_id' })
  contributor: User;

  @Column({})
  contributor_id: string;

  // Attempt belongs to User as Reviewer
  // @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'reviewer_id' })
  // reviewer: User;

  // Attempts may have many rejection reasons
  @OneToMany(
    () => RejectionReason,
    (rejection_reason) => rejection_reason.dataSet,
  )
  rejectionReasons: RejectionReason[];

  @OneToMany(() => FlagReason, (flagReason) => flagReason.dataSet)
  flagReason: FlagReason[];

  @Column({ nullable: true })
  dialect_id: string;

  @ManyToOne(() => Dialect, (dialect) => dialect.dataSets)
  @JoinColumn({ name: 'dialect_id' })
  dialect: Dialect;

  @Column({ nullable: true })
  language_id: string;
  @ManyToOne(() => Language, (language) => language.dataSets)
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @OneToMany(() => DataSetReview, (dataSetReview) => dataSetReview.dataSet)
  dataSetReviews: DataSetReview[];

  @Column({
    default: 'Pending',
    enum: ['Pending', 'Approved', 'Rejected'],
  })
  qa_review_status: 'Pending' | 'Approved' | 'Rejected';
}
