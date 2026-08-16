import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CategoryEntity, OrderEntity, OrderItemEntity, ProductAddonEntity, ProductEntity, RestaurantEntity, RestaurantMemberEntity, UserEntity } from './entities';

export const entities=[UserEntity,RestaurantEntity,RestaurantMemberEntity,CategoryEntity,ProductEntity,ProductAddonEntity,OrderEntity,OrderItemEntity];

export default new DataSource({
  type:'postgres',
  url:process.env.DATABASE_URL,
  entities,
  migrations:['src/database/migrations/*.ts'],
  synchronize:false,
  ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:false}:false,
});
