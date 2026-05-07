import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('user_referrals')
export class UserReferral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'referrer_id', type: 'uuid' })
  referrer_id: string;

  // The user who shared the referral code
  @ManyToOne(() => User, (user) => user.sentReferrals)
  @JoinColumn({ name: 'referrer_id' })
  referrer: User;

  @Column({ name: 'referred_id', type: 'uuid' })
  referred_id: string;

  // The user who signed up using the code
  @ManyToOne(() => User, (user) => user.receivedReferral)
  @JoinColumn({ name: 'referred_id' })
  referred: User;

  @Column({ name: 'max_payout_count', default: 0 })
  max_payout_count: number;

  @Column({ name: 'current_count', default: 0 })
  current_count: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
