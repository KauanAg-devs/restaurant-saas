import { BadRequestException, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import {
  CategoryEntity,
  OrderEntity,
  OrderItemEntity,
  ProductEntity,
  RestaurantEntity,
} from "../database/entities";
import {
  categoryResponse,
  orderResponse,
  productResponse,
  restaurantResponse,
} from "../api-contract";
import { normalizeSetting, slugify } from "./admin.utils";

@Injectable()
export class AdminService {
  constructor(private db: DataSource) {}

  async dashboard(restaurant: RestaurantEntity, role: string) {
    const [orders, products, categories] = await Promise.all([
      this.db.getRepository(OrderEntity).find({
        where: { restaurantId: restaurant.id },
        order: { createdAt: "DESC" },
        take: 100,
      }),
      this.db.getRepository(ProductEntity).find({
        where: { restaurantId: restaurant.id },
        order: { sortOrder: "ASC" },
      }),
      this.db.getRepository(CategoryEntity).find({
        where: { restaurantId: restaurant.id },
        order: { sortOrder: "ASC" },
      }),
    ]);
    const ids = orders.map((order) => order.id);
    const items = ids.length
      ? await this.db
          .getRepository(OrderItemEntity)
          .createQueryBuilder("item")
          .where("item.order_id IN (:...ids)", { ids })
          .getMany()
      : [];

    return {
      restaurant: restaurantResponse(restaurant),
      role,
      orders: orders.map((order) =>
        orderResponse(
          order,
          items.filter((item) => item.orderId === order.id),
        ),
      ),
      products: products.map((product) => productResponse(product)),
      categories: categories.map(categoryResponse),
    };
  }

  async updateOrderStatus(restaurantId: string, body: any) {
    const allowed = [
      "novo",
      "confirmado",
      "preparando",
      "pronto",
      "saiu_para_entrega",
      "concluido",
      "cancelado",
    ];
    if (!allowed.includes(String(body.status))) {
      throw new BadRequestException("Status inválido");
    }
    const id = String(body.id || body.order_id || "");
    const result = await this.db
      .getRepository(OrderEntity)
      .update({ id, restaurantId }, { status: body.status });
    if (!result.affected) {
      throw new BadRequestException("Pedido não encontrado");
    }
    return { ok: true };
  }

  async createProduct(restaurantId: string, body: any) {
    if (!body.name || !body.category_id) {
      throw new BadRequestException("Preencha nome e categoria");
    }
    const categoryId = String(body.category_id);
    await this.requireCategory(restaurantId, categoryId);
    const repository = this.db.getRepository(ProductEntity);
    const product = repository.create({
      restaurantId,
      categoryId,
      slug: `${slugify(String(body.name))}-${Date.now().toString(36)}`,
      name: String(body.name).trim(),
      description: String(body.description || ""),
      price: String(Number(body.price || 0).toFixed(2)),
      imageUrl: body.image_url || null,
      featured: Boolean(body.featured),
      active: body.active !== false,
      available: body.available !== false,
      sortOrder: Number(body.sort_order || 0),
    });
    return { product: productResponse(await repository.save(product)) };
  }

  async updateProduct(restaurantId: string, body: any) {
    const repository = this.db.getRepository(ProductEntity);
    const product = await repository.findOne({
      where: { id: String(body.id), restaurantId },
    });
    if (!product) throw new BadRequestException("Produto não encontrado");
    if ("category_id" in body) {
      await this.requireCategory(restaurantId, String(body.category_id));
    }
    const fields: Record<string, string> = {
      name: "name",
      description: "description",
      price: "price",
      category_id: "categoryId",
      image_url: "imageUrl",
      featured: "featured",
      active: "active",
      available: "available",
      sort_order: "sortOrder",
    };
    for (const [apiKey, entityKey] of Object.entries(fields)) {
      if (apiKey in body) {
        (product as any)[entityKey] =
          apiKey === "price"
            ? String(Number(body[apiKey]).toFixed(2))
            : body[apiKey];
      }
    }
    return { product: productResponse(await repository.save(product)) };
  }

  async deleteProduct(restaurantId: string, id: string) {
    await this.db.getRepository(ProductEntity).delete({ id, restaurantId });
    return { ok: true };
  }

  async updateSettings(restaurant: RestaurantEntity, body: any) {
    const fields: Record<string, string> = {
      active: "active",
      delivery_minutes_min: "deliveryMinutesMin",
      delivery_minutes_max: "deliveryMinutesMax",
      delivery_fee: "deliveryFee",
      accepts_delivery: "acceptsDelivery",
      accepts_pickup: "acceptsPickup",
      minimum_order: "minimumOrder",
      whatsapp: "whatsapp",
      address_text: "addressText",
      opening_hours: "openingHours",
      timezone: "timezone",
      payment_methods: "paymentMethods",
    };
    for (const [apiKey, entityKey] of Object.entries(fields)) {
      if (apiKey in body) {
        (restaurant as any)[entityKey] = normalizeSetting(apiKey, body[apiKey]);
      }
    }
    return this.saveRestaurant(restaurant);
  }

  async updateBranding(restaurant: RestaurantEntity, body: any) {
    const fields: Record<string, string> = {
      name: "name",
      tagline: "tagline",
      logo_url: "logoUrl",
      primary_color: "primaryColor",
      secondary_color: "secondaryColor",
      background_color: "backgroundColor",
      surface_color: "surfaceColor",
      text_color: "textColor",
      muted_text_color: "mutedTextColor",
      background_pattern: "backgroundPattern",
    };
    for (const [apiKey, entityKey] of Object.entries(fields)) {
      if (apiKey in body) {
        (restaurant as any)[entityKey] =
          apiKey === "logo_url" ? body[apiKey] || null : body[apiKey];
      }
    }
    return this.saveRestaurant(restaurant);
  }

  private async requireCategory(restaurantId: string, categoryId: string) {
    const category = await this.db.getRepository(CategoryEntity).findOne({
      where: { id: categoryId, restaurantId },
    });
    if (!category) {
      throw new BadRequestException("Categoria inválida para este restaurante");
    }
  }

  private async saveRestaurant(restaurant: RestaurantEntity) {
    return {
      restaurant: restaurantResponse(
        await this.db.getRepository(RestaurantEntity).save(restaurant),
      ),
    };
  }
}
