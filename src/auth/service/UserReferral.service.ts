import { UserReferral } from '../entities/UserReferral.entity';
import { QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PaginationService } from 'src/common/service/pagination.service';
@Injectable()
export class UserReferralService {
  private paginationService: PaginationService<UserReferral>;
  constructor(
    @InjectRepository(UserReferral)
    private userReferralRepository: Repository<UserReferral>,
  ) {
    this.paginationService = new PaginationService<UserReferral>(
      this.userReferralRepository,
    );
  }
  async createReferral(
    referrer_id: string,
    referred_id: string,
    queryRunner?: QueryRunner,
  ): Promise<UserReferral> {
    const referral = this.userReferralRepository.create({
      referrer_id,
      referred_id,
    });
    return await this.userReferralRepository.save(referral);
  }
  async getReferralsByUserId(user_id: string, page: number, limit: number) {
    const queryBuilder = this.userReferralRepository
      .createQueryBuilder('referral')
      .where('referral.referrer_id = :user_id', { user_id })
      .orderBy('referral.createdAt', 'DESC');

    const paginationDto = { page, limit };
    return await this.paginationService.paginate(
      paginationDto,
      'referral',
      queryBuilder,
    );
  }
  async calculateFacilitatorScore(facilitatorId: string): Promise<number> {
    const result = await this.userReferralRepository
      .createQueryBuilder('referral')
      .innerJoin('referral.referred', 'referredUser')
      .innerJoin('referredUser.score', 'userScore')
      .where('referral.referrer_id = :facilitatorId', { facilitatorId })
      .select('AVG(userScore.score)', 'average')
      .getRawOne();

    return result?.average ? parseFloat(result.average) : 0;
  }
}
