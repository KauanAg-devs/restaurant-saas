import { MigrationInterface, QueryRunner } from 'typeorm';

export class RestaurantLogo0004 implements MigrationInterface {
  name='RestaurantLogo0004';
  async up(q:QueryRunner):Promise<void>{
    await q.query(`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS logo_url text`);
  }
  async down(q:QueryRunner):Promise<void>{
    await q.query(`ALTER TABLE restaurants DROP COLUMN IF EXISTS logo_url`);
  }
}
