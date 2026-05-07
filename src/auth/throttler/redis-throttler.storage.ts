import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';

@Injectable()
export class RedisThrottlerStorage
  implements ThrottlerStorage, OnModuleDestroy
{
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(
      this.configService.get<string>('REDIS_URL') as string,
    );
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `throttler:${throttlerName}:${key}`;
    const blockKey = `throttler:${throttlerName}:${key}:block`;

    // Check if currently blocked
    const blockTtl = await this.redis.pttl(blockKey);
    if (blockTtl > 0) {
      const totalHits = limit + 1;
      return {
        totalHits,
        timeToExpire: Math.ceil(blockTtl / 1000),
        isBlocked: true,
        timeToBlockExpire: Math.ceil(blockTtl / 1000),
      };
    }

    const pipeline = this.redis.pipeline();
    pipeline.incr(redisKey);
    pipeline.pttl(redisKey);
    const results = await pipeline.exec();

    const totalHits = results![0][1] as number;
    let timeToExpire = Math.ceil((results![1][1] as number) / 1000);

    // Set expiry on first hit
    if (totalHits === 1) {
      await this.redis.pexpire(redisKey, ttl * 1000);
      timeToExpire = ttl;
    }

    let isBlocked = false;
    let timeToBlockExpire = 0;

    if (totalHits > limit && blockDuration > 0) {
      await this.redis.set(blockKey, '1', 'PX', blockDuration * 1000);
      isBlocked = true;
      timeToBlockExpire = blockDuration;
    }

    return { totalHits, timeToExpire, isBlocked, timeToBlockExpire };
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
