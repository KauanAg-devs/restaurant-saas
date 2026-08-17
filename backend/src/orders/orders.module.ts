import { Body, Controller, Module, Post, Req } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  OrderEntity,
  OrderItemEntity,
  ProductAddonEntity,
  ProductEntity,
  RestaurantEntity,
} from "../database/entities";
import { clientIp } from "../security/client-ip";
import {
  RateLimitModule,
  RateLimitService,
} from "../security/rate-limit.module";
import { OrdersService } from "./orders.service";

@Controller("order")
class OrdersController {
  constructor(
    private orders: OrdersService,
    private limits: RateLimitService,
  ) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const restaurantSlug = String(body.restaurant_slug || "");
    const ip = clientIp(req);
    const key = `${ip}:${restaurantSlug}`;
    await this.limits.hit("order-1m", key, 5, 60);
    await this.limits.hit("order-15m", key, 25, 900);

    const phone = String(body.customer_phone || "").replace(/\D/g, "");
    if (phone) {
      await this.limits.hit(
        "order-phone-15m",
        `${restaurantSlug}:${phone}`,
        8,
        900,
      );
    }

    return this.orders.create(body);
  }
}

@Module({
  imports: [
    RateLimitModule,
    TypeOrmModule.forFeature([
      RestaurantEntity,
      ProductEntity,
      ProductAddonEntity,
      OrderEntity,
      OrderItemEntity,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
