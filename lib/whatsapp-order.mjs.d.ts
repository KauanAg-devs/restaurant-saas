declare module "@/lib/whatsapp-order.mjs" {
  export type WhatsAppOrder = {
    number: string | number;
    restaurantName: string;
    items: Array<{
      quantity: number;
      name: string;
      total: number;
      addons: string[];
    }>;
    subtotal: number;
    deliveryFee: number;
    total: number;
    customerName: string;
    customerPhone: string;
    fulfillment: "delivery" | "pickup";
    address: string;
    paymentLabel: string;
    notes: string;
  };

  export function normalizeWhatsAppNumber(value: unknown): string;
  export function buildOrderWhatsAppMessage(order: WhatsAppOrder): string;
  export function buildOrderWhatsAppUrl(
    phone: unknown,
    order: WhatsAppOrder,
  ): string;
}
