import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { CatalogModule } from "./catalog/catalog.module";
import { entities } from "./database/data-source";
import { OrdersModule } from "./orders/orders.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: "postgres" as const,
        url: c.getOrThrow<string>("DATABASE_URL"),
        entities,
        synchronize: c.get("DB_SYNC") === "true",
        ssl:
          c.get("DATABASE_SSL") === "true"
            ? { rejectUnauthorized: false }
            : false,
        logging: c.get("DB_LOGGING") === "true",
      }),
    }),
    AuthModule,
    CatalogModule,
    OrdersModule,
    AdminModule,
  ],
})
export class AppModule {}
