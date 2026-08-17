import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Module,
} from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { createHash } from "crypto";
import { DataSource } from "typeorm";

export class RateLimitExceededException extends HttpException {
  constructor(public readonly retryAfter: number) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: "Muitas tentativas. Aguarde um pouco e tente novamente.",
        retry_after: retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

@Catch(RateLimitExceededException)
class RateLimitExceptionFilter implements ExceptionFilter {
  catch(exception: RateLimitExceededException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.setHeader("Retry-After", String(exception.retryAfter));
    response.status(HttpStatus.TOO_MANY_REQUESTS).json(exception.getResponse());
  }
}

@Injectable()
export class RateLimitService {
  constructor(private readonly db: DataSource) {}

  async hit(scope: string, key: string, limit: number, windowSeconds: number) {
    const now = Date.now();
    const bucket = Math.floor(now / (windowSeconds * 1000));
    const keyHash = createHash("sha256").update(key).digest("hex");
    const result = await this.db.query(
      `INSERT INTO rate_limit_buckets (scope, key_hash, bucket, hits, expires_at)
       VALUES ($1, $2, $3, 1, NOW() + ($4 || ' seconds')::interval)
       ON CONFLICT (scope, key_hash, bucket)
       DO UPDATE SET hits = rate_limit_buckets.hits + 1
       RETURNING hits`,
      [scope, keyHash, bucket, windowSeconds],
    );
    const hits = Number(result?.[0]?.hits || 0);
    if (hits > limit) {
      const retryAfter = Math.max(
        1,
        Math.ceil(((bucket + 1) * windowSeconds * 1000 - now) / 1000),
      );
      throw new RateLimitExceededException(retryAfter);
    }
    if (Math.random() < 0.01)
      void this.db.query(
        `DELETE FROM rate_limit_buckets WHERE expires_at < NOW()`,
      );
  }
}

@Module({
  providers: [
    RateLimitService,
    { provide: APP_FILTER, useClass: RateLimitExceptionFilter },
  ],
  exports: [RateLimitService],
})
export class RateLimitModule {}
