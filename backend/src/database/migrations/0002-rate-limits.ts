import { MigrationInterface, QueryRunner } from 'typeorm';

export class RateLimits0002 implements MigrationInterface {
  name = 'RateLimits0002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS rate_limit_buckets (
        scope varchar(64) NOT NULL,
        key_hash varchar(64) NOT NULL,
        bucket bigint NOT NULL,
        hits integer NOT NULL DEFAULT 0,
        expires_at timestamptz NOT NULL,
        PRIMARY KEY (scope, key_hash, bucket)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_expires_at ON rate_limit_buckets (expires_at)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS rate_limit_buckets`);
  }
}
