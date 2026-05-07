import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_verification_codes')
export class UserVerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  code: string;

  @Column()
  expiration_date: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'verified', 'expired'],
    default: 'pending',
  })
  status: string;

  @Column({ default: 0 })
  failed_attempts: number;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
