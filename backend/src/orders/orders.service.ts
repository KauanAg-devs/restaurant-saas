import { BadRequestException, Injectable } from "@nestjs/common";
import { DataSource, In } from "typeorm";
import {
  OrderEntity,
  OrderItemEntity,
  ProductAddonEntity,
  ProductEntity,
  RestaurantEntity,
} from "../database/entities";

@Injectable()
export class OrdersService {
  constructor(private db: DataSource) {}

  async create(body: any) {
    return this.db.transaction(async (manager) => {
      const restaurant = this.validateRestaurant(
        await manager.findOne(RestaurantEntity, {
          where: { slug: String(body.restaurant_slug || "") },
        }),
        body,
      );

      const items = Array.isArray(body.items) ? body.items : [];
      if (!items.length) throw new BadRequestException("Carrinho vazio");

      const products = await manager.findBy(ProductEntity, {
        id: In(items.map((item: any) => String(item.product_id))),
        restaurantId: restaurant.id,
        active: true,
        available: true,
      });
      if (
        products.length !==
        new Set(items.map((item: any) => String(item.product_id))).size
      ) {
        throw new BadRequestException("Produto inválido ou indisponível");
      }

      const addonIds = items.flatMap((item: any) =>
        Array.isArray(item.addon_ids) ? item.addon_ids.map(String) : [],
      );
      const addons = addonIds.length
        ? await manager.findBy(ProductAddonEntity, {
            id: In(addonIds),
            active: true,
          })
        : [];

      let subtotal = 0;
      const rows: any[] = [];
      for (const item of items) {
        const product = products.find(
          (candidate) => candidate.id === String(item.product_id),
        )!;
        const chosen = addons.filter(
          (addon) =>
            (item.addon_ids || []).includes(addon.id) &&
            addon.productId === product.id,
        );
        const quantity = Math.max(1, Math.min(99, Number(item.quantity || 1)));
        const addonTotal = chosen.reduce(
          (sum, addon) => sum + Number(addon.price),
          0,
        );
        subtotal += (Number(product.price) + addonTotal) * quantity;
        rows.push({ product, chosen, quantity, addonTotal });
      }

      if (subtotal < Number(restaurant.minimumOrder)) {
        throw new BadRequestException(
          `Pedido mínimo de R$ ${Number(restaurant.minimumOrder).toFixed(2)}`,
        );
      }

      const deliveryFee =
        body.fulfillment_type === "delivery"
          ? Number(restaurant.deliveryFee)
          : 0;
      const publicNumber = await this.nextPublicNumber(manager, restaurant.id);
      const order = await manager.save(
        OrderEntity,
        manager.create(OrderEntity, {
          restaurantId: restaurant.id,
          publicNumber,
          customerName: String(body.customer_name || "").trim(),
          customerPhone: String(body.customer_phone || "").trim(),
          fulfillmentType: body.fulfillment_type,
          addressText: formatAddress(body),
          notes: String(body.notes || ""),
          paymentMethod: String(body.payment_method),
          subtotal: String(subtotal.toFixed(2)),
          deliveryFee: String(deliveryFee.toFixed(2)),
          total: String((subtotal + deliveryFee).toFixed(2)),
          status: "novo",
        }),
      );

      for (const row of rows) {
        await manager.save(
          OrderItemEntity,
          manager.create(OrderItemEntity, {
            orderId: order.id,
            productId: row.product.id,
            productName: row.product.name,
            quantity: row.quantity,
            unitPrice: row.product.price,
            addonsTotal: String(row.addonTotal.toFixed(2)),
            addonSnapshot: row.chosen.map((addon: ProductAddonEntity) => ({
              id: addon.id,
              name: addon.name,
              price: Number(addon.price),
            })),
          }),
        );
      }

      return {
        public_number: publicNumber,
        id: order.id,
        total: Number(order.total),
      };
    });
  }

  private async nextPublicNumber(manager: any, restaurantId: string) {
    // Serialize number allocation per restaurant for the lifetime of this transaction.
    // pg_advisory_xact_lock is released automatically on commit/rollback, so two
    // simultaneous checkouts for the same restaurant cannot read the same latest number.
    await manager.query(
      "SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
      ["restaurant-order-number", restaurantId],
    );

    const latest = await manager
      .createQueryBuilder(OrderEntity, "order")
      .where("order.restaurantId = :restaurantId", { restaurantId })
      .andWhere("order.publicNumber ~ '^[0-9]{4}$'")
      .orderBy("CAST(order.publicNumber AS INTEGER)", "DESC")
      .getOne();

    const current = latest ? Number(latest.publicNumber) : 1000;
    return String(current >= 9999 ? 1001 : current + 1);
  }

  private validateRestaurant(restaurant: RestaurantEntity | null, body: any) {
    if (!restaurant || !restaurant.active) {
      throw new BadRequestException("Restaurante não encontrado");
    }
    if (body.fulfillment_type === "delivery" && !restaurant.acceptsDelivery) {
      throw new BadRequestException("Entrega indisponível");
    }
    if (body.fulfillment_type === "pickup" && !restaurant.acceptsPickup) {
      throw new BadRequestException("Retirada indisponível");
    }
    if (!restaurant.paymentMethods.includes(String(body.payment_method))) {
      throw new BadRequestException("Forma de pagamento inválida");
    }
    return restaurant;
  }
}

function formatAddress(body: any) {
  return body.fulfillment_type === "delivery"
    ? [body.street, body.number, body.neighborhood].filter(Boolean).join(", ")
    : "";
}
