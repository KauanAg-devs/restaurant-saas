import { MigrationInterface, QueryRunner } from "typeorm";

export class StoreDesign0005 implements MigrationInterface {
  name = "StoreDesign0005";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "store_preset" varchar NOT NULL DEFAULT 'minimal'`);
    await queryRunner.query(`ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "store_header_style" varchar NOT NULL DEFAULT 'compact'`);
    await queryRunner.query(`ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "store_hero_style" varchar NOT NULL DEFAULT 'compact'`);
    await queryRunner.query(`ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "store_card_style" varchar NOT NULL DEFAULT 'horizontal'`);
    await queryRunner.query(`ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "store_radius" varchar NOT NULL DEFAULT 'soft'`);
    await queryRunner.query(`ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "store_density" varchar NOT NULL DEFAULT 'comfortable'`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const column of ["store_density","store_radius","store_card_style","store_hero_style","store_header_style","store_preset"]) await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN IF EXISTS "${column}"`);
  }
}
