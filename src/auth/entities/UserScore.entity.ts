import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User.entity';
import { UserScoreDefaultPoint } from 'src/utils/constants/UserScoreAction.constant';

@Entity({ schema: 'task_distribution', name: 'user_score' })
export class UserScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'float', default: UserScoreDefaultPoint })
  score: number;

  @OneToOne(() => User, (user) => user.score, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // ✅ Owning side
  user: User;
}
