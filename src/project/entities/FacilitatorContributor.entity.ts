import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './Task.entity';
import { User } from 'src/auth/entities/User.entity';

@Entity('facilitator_contributor')
export class FacilitatorContributor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  facilitator_id: string;

  @ManyToOne(() => User, (user) => user.facilitatorContributors)
  @JoinColumn({ name: 'facilitator_id' })
  facilitator: User;

  @Column({ type: 'uuid' })
  contributor_id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contributor_id' })
  contributor: User;

  @ManyToOne(() => Task, (task) => task.facilitatorContributors)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
