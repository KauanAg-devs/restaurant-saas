import {
  CategoryEntity,
  OrderEntity,
  OrderItemEntity,
  ProductAddonEntity,
  ProductEntity,
  RestaurantEntity,
} from "./database/entities";

export function restaurantResponse(r: RestaurantEntity) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    logo_url: r.logoUrl ?? null,
    active: r.active,
    whatsapp: r.whatsapp,
    address_text: r.addressText,
    accepts_delivery: r.acceptsDelivery,
    accepts_pickup: r.acceptsPickup,
    delivery_fee: r.deliveryFee,
    minimum_order: r.minimumOrder,
    payment_methods: r.paymentMethods,
    opening_hours: r.openingHours,
    timezone: r.timezone,
    delivery_minutes_min: r.deliveryMinutesMin,
    delivery_minutes_max: r.deliveryMinutesMax,
    primary_color: r.primaryColor,
    secondary_color: r.secondaryColor,
    background_color: r.backgroundColor,
    surface_color: r.surfaceColor,
    text_color: r.textColor,
    muted_text_color: r.mutedTextColor,
    background_pattern: r.backgroundPattern,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export function categoryResponse(c: CategoryEntity) {
  return {
    id: c.id,
    restaurant_id: c.restaurantId,
    slug: c.slug,
    name: c.name,
    active: c.active,
    sort_order: c.sortOrder,
  };
}

export function addonResponse(a: ProductAddonEntity) {
  return {
    id: a.id,
    product_id: a.productId,
    name: a.name,
    price: a.price,
    active: a.active,
    sort_order: a.sortOrder,
  };
}

export function productResponse(
  p: ProductEntity,
  addons?: ProductAddonEntity[],
) {
  return {
    id: p.id,
    restaurant_id: p.restaurantId,
    category_id: p.categoryId,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    image_url: p.imageUrl ?? null,
    featured: p.featured,
    active: p.active,
    available: p.available,
    sort_order: p.sortOrder,
    ...(addons ? { addons: addons.map(addonResponse) } : {}),
  };
}

export function orderItemResponse(i: OrderItemEntity) {
  return {
    id: i.id,
    order_id: i.orderId,
    product_id: i.productId,
    product_name: i.productName,
    quantity: i.quantity,
    unit_price: i.unitPrice,
    addons_total: i.addonsTotal,
    addon_snapshot: i.addonSnapshot,
  };
}

export function orderResponse(o: OrderEntity, items: OrderItemEntity[] = []) {
  return {
    id: o.id,
    restaurant_id: o.restaurantId,
    public_number: o.publicNumber,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    fulfillment_type: o.fulfillmentType,
    fulfillment: o.fulfillmentType === "delivery" ? "entrega" : "retirada",
    address_text: o.addressText,
    notes: o.notes,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    status: o.status,
    subtotal: o.subtotal,
    delivery_fee: o.deliveryFee,
    total: o.total,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
    order_items: items.map(orderItemResponse),
  };
}
