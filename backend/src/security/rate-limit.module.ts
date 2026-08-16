import { HttpException, HttpStatus, Injectable, Module } from '@nestjs/common';
import { createHash } from 'crypto';
import { DataSource } from 'typeorm';

@Injectable()
export class RateLimitService {
  constructor(private readonly db: DataSource) {}

  async hit(scope: string, key: string, limit: number, windowSeconds: number) {
    const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
    const keyHash = createHash('sha256').update(key).digest('hex');
    const result = await this.db.query(
      `INSERT INTO rate_limit_buckets (scope, key_hash, bucket, hits, expires_at)
       VALUES ($1, $2, $3, 1, NOW() + ($4 || ' seconds')::interval)
       ON CONFLICT (scope, key_hash, bucket)
       DO UPDATE SET hits = rate_limit_buckets.hits + 1
       RETURNING hits`,
      [scope, keyHash, bucket, windowSeconds],
    );
    const hits = Number(result?.[0]?.hits || 0);
    if (hits > limit) throw new HttpException('Muitas tentativas. Aguarde um pouco e tente novamente.', HttpStatus.TOO_MANY_REQUESTS);
    if (Math.random() < 0.01) void this.db.query(`DELETE FROM rate_limit_buckets WHERE expires_at < NOW()`);
  }
}

@Module({ providers: [RateLimitService], exports: [RateLimitService] })
export class RateLimitModule {}
