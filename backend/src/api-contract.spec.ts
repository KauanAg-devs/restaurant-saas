import {
  categoryResponse,
  orderResponse,
  productResponse,
  restaurantResponse,
} from "./api-contract";

describe("legacy HTTP contract", () => {
  it("serializes restaurant and catalog fields as snake_case", () => {
    const restaurant: any = {
      id: "r1",
      slug: "loja",
      name: "Loja",
      tagline: "",
      active: true,
      whatsapp: "",
      addressText: "Rua A",
      acceptsDelivery: true,
      acceptsPickup: false,
      deliveryFee: "7.00",
      minimumOrder: "20.00",
      paymentMethods: ["pix"],
      openingHours: {},
      timezone: "America/Sao_Paulo",
      deliveryMinutesMin: 30,
      deliveryMinutesMax: 45,
      primaryColor: "#111111",
      secondaryColor: "#eeeeee",
      backgroundColor: "#ffffff",
      surfaceColor: "#ffffff",
      textColor: "#111111",
      mutedTextColor: "#777777",
      backgroundPattern: "none",
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    const category: any = {
      id: "c1",
      restaurantId: "r1",
      slug: "lanches",
      name: "Lanches",
      active: true,
      sortOrder: 2,
    };
    const product: any = {
      id: "p1",
      restaurantId: "r1",
      categoryId: "c1",
      slug: "x",
      name: "X",
      description: "",
      price: "10.00",
      imageUrl: "https://example.com/x.jpg",
      featured: false,
      active: true,
      available: true,
      sortOrder: 3,
    };
    const r = restaurantResponse(restaurant),
      c = categoryResponse(category),
      p = productResponse(product, []);
    expect(r).toMatchObject({
      address_text: "Rua A",
      accepts_delivery: true,
      delivery_fee: "7.00",
      payment_methods: ["pix"],
      delivery_minutes_min: 30,
      primary_color: "#111111",
    });
    expect(c).toMatchObject({ restaurant_id: "r1", sort_order: 2 });
    expect(p).toMatchObject({
      restaurant_id: "r1",
      category_id: "c1",
      image_url: "https://example.com/x.jpg",
      sort_order: 3,
      addons: [],
    });
    expect((r as any).paymentMethods).toBeUndefined();
    expect((p as any).categoryId).toBeUndefined();
  });

  it("keeps the admin fulfillment label compatible with the UI", () => {
    const order: any = {
      id: "o1",
      restaurantId: "r1",
      publicNumber: "1001",
      customerName: "Ana",
      customerPhone: "11999999999",
      fulfillmentType: "delivery",
      addressText: "Rua A, 1",
      notes: "",
      paymentMethod: "pix",
      paymentStatus: "pendente",
      status: "novo",
      subtotal: "10.00",
      deliveryFee: "2.00",
      total: "12.00",
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    expect(orderResponse(order)).toMatchObject({
      restaurant_id: "r1",
      public_number: "1001",
      customer_name: "Ana",
      fulfillment_type: "delivery",
      fulfillment: "entrega",
      delivery_fee: "2.00",
      order_items: [],
    });
  });
});
