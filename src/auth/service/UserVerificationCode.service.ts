import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, QueryRunner, Repository } from 'typeorm';
import { UserVerificationCode } from '../entities/UserVerificationCode.entity';
import { QueryOptions } from 'src/utils/queryOption.util';

@Injectable()
export class UserVerificationCodeService {
  constructor(
    @InjectRepository(UserVerificationCode)
    private readonly userVerificationCodeRepository: Repository<UserVerificationCode>,
  ) {}

  /**
   * Creates a new user verification code in the database.
   * If the user already has a verification code, it will be removed
   * before creating the new one.
   * @param userData The partial user verification code data to create.
   * @returns A promise resolving to the created user verification code.
   */
  async create(
    userData: Partial<UserVerificationCode>,
  ): Promise<UserVerificationCode> {
    const vBefore = await this.findOne({
      where: { username: userData.username },
    });
    if (vBefore) {
      await this.userVerificationCodeRepository.remove(vBefore);
    }
    const userVerificationCode =
      this.userVerificationCodeRepository.create(userData);
    return await this.userVerificationCodeRepository.save(userVerificationCode);
  }

  /**
   * Retrieves a single user verification code from the database.
   * @param query The query to filter user verification codes. Supports relations.
   * @returns A promise resolving to the user verification code if found, or null.
   */
  async findOne(
    query: QueryOptions<UserVerificationCode>,
  ): Promise<UserVerificationCode | null> {
    const options: any = {
      where: query.where,
      order: query.order || {},
      relations: query.relations || [],
    };
    if (query.select) {
      options.select = query.select;
    }
    return await this.userVerificationCodeRepository.findOne(options);
  }

  /**
   * Retrieves multiple user verification codes from the database.
   * Supports relations.
   * @param query The query to filter user verification codes.
   * @returns A promise resolving to an array of user verification codes matching the query.
   */
  async findMany(
    query: FindManyOptions<UserVerificationCode>,
  ): Promise<UserVerificationCode[]> {
    return await this.userVerificationCodeRepository.find(query);
  }
  /**
   * Updates a user verification code in the database.
   * @param id The id of the user verification code to update.
   * @param userVerificationCode The partial user verification code data to update.
   * @param queryRunner The query runner to use for the query.
   * @returns A promise resolving to the updated user verification code if found, or null.
   */
  async update(
    id: string,
    userVerificationCode: Partial<UserVerificationCode>,
    queryRunner?: QueryRunner,
  ): Promise<UserVerificationCode | null> {
    if (queryRunner) {
      const manager = queryRunner.manager;
      await manager.update(UserVerificationCode, id, userVerificationCode);
      return await manager.findOne(UserVerificationCode, { where: { id } });
    } else {
      const manager = this.userVerificationCodeRepository;
      await manager.update(id, userVerificationCode);
      return await manager.findOne({ where: { id } });
    }
  }

  /**
   * Finds the most recent pending verification code record for a given username.
   * @param username The username (phone number or email) to look up.
   * @returns A promise resolving to the latest pending record, or null if none exists.
   */
  async findLatestPendingByUsername(
    username: string,
  ): Promise<UserVerificationCode | null> {
    return await this.userVerificationCodeRepository.findOne({
      where: { username, status: 'pending' },
      order: { created_date: 'DESC' },
    });
  }

  /**
   * Increments the failed_attempts counter on a verification code record.
   * @param id The id of the record to update.
   * @returns A promise resolving to the updated record, or null if not found.
   */
  async incrementFailedAttempts(
    id: string,
  ): Promise<UserVerificationCode | null> {
    await this.userVerificationCodeRepository.increment(
      { id },
      'failed_attempts',
      1,
    );
    return await this.userVerificationCodeRepository.findOne({ where: { id } });
  }

  /**
   * Sets the status of a verification code record to 'expired'.
   * @param id The id of the record to expire.
   */
  async expireSession(id: string): Promise<void> {
    await this.userVerificationCodeRepository.update(id, {
      status: 'expired',
    });
  }

  /**
   * Sets the status of a verification code record to 'verified' and resets failed_attempts to 0.
   * @param id The id of the record to mark as verified.
   */
  async markVerified(id: string): Promise<void> {
    await this.userVerificationCodeRepository.update(id, {
      status: 'verified',
      failed_attempts: 0,
    });
  }
}
