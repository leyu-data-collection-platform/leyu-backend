import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Task } from './Task.entity';

@Entity({ name: 'qa_task_instruction' })
export class QATaskInstruction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Task, (task) => task.reviewerInstruction)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column()
  task_id: string;

  @ManyToOne(() => Task, (task) => task.reviewerInstruction)
  reviewerTask: Task;

  @ManyToOne(() => Task, (task) => task.qaInstruction)
  qaTask: Task;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  image_instruction_url: string;

  @Column({ nullable: true })
  video_instruction_url: string;

  @Column({ nullable: true })
  audio_instruction_url: string;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
