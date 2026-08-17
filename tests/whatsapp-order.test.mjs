import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOrderWhatsAppMessage,
  buildOrderWhatsAppUrl,
  normalizeWhatsAppNumber,
} from "../lib/whatsapp-order.mjs";

const order = {
  number: "1234",
  restaurantName: "Sabor da Casa",
  items: [
    { quantity: 2, name: "Burger", total: 59.8, addons: ["Bacon", "Queijo"] },
  ],
  subtotal: 59.8,
  deliveryFee: 5,
  total: 64.8,
  customerName: "Ana",
  customerPhone: "(11) 98888-7777",
  fulfillment: "delivery",
  address: "Rua A, 10, Centro",
  paymentLabel: "Pix",
  notes: "Sem cebola",
};

test("normalizes Brazilian WhatsApp numbers and rejects incomplete numbers", () => {
  assert.equal(normalizeWhatsAppNumber("(11) 98888-7777"), "5511988887777");
  assert.equal(normalizeWhatsAppNumber("+55 11 98888-7777"), "5511988887777");
  assert.equal(normalizeWhatsAppNumber("1234"), "");
});

test("builds an encoded wa.me link with the complete confirmed order", () => {
  const url = buildOrderWhatsAppUrl("(11) 99999-0000", order);
  assert.ok(url.startsWith("https://wa.me/5511999990000?text="));
  const message = decodeURIComponent(url.split("?text=")[1]);
  assert.match(message, /Novo pedido #1234/);
  assert.match(message, /2x Burger/);
  assert.match(message, /Bacon, Queijo/);
  assert.match(message, /Total: R\$\s64,80/);
  assert.match(message, /Endereço: Rua A, 10, Centro/);
  assert.match(message, /Observações: Sem cebola/);
});

test("omits delivery-only and optional lines for pickup", () => {
  const message = buildOrderWhatsAppMessage({
    ...order,
    fulfillment: "pickup",
    address: "",
    notes: "",
    deliveryFee: 0,
  });
  assert.doesNotMatch(message, /Entrega: R\$/);
  assert.doesNotMatch(message, /Endereço:/);
  assert.doesNotMatch(message, /Observações:/);
  assert.match(message, /Recebimento: Retirada/);
});
