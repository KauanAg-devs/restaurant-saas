export function normalizeWhatsAppNumber(value) {
  let digits = String(value || '').replace(/\D/g, '').replace(/^0+/, '');
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length >= 12 && digits.length <= 15 ? digits : '';
}

export function buildOrderWhatsAppMessage(order) {
  const lines = [
    `*Novo pedido #${order.number}*`,
    `*${order.restaurantName}*`,
    '',
  ];

  for (const item of order.items) {
    lines.push(`*${item.quantity}x ${item.name}* — ${formatMoney(item.total)}`);
    if (item.addons?.length) lines.push(`  + ${item.addons.join(', ')}`);
  }

  lines.push('', `Subtotal: ${formatMoney(order.subtotal)}`);
  if (order.fulfillment === 'delivery') lines.push(`Entrega: ${formatMoney(order.deliveryFee)}`);
  lines.push(`*Total: ${formatMoney(order.total)}*`, '');
  lines.push(`Cliente: ${order.customerName}`, `Telefone: ${order.customerPhone}`);
  lines.push(`Recebimento: ${order.fulfillment === 'delivery' ? 'Entrega' : 'Retirada'}`);
  if (order.fulfillment === 'delivery' && order.address) lines.push(`Endereço: ${order.address}`);
  lines.push(`Pagamento: ${order.paymentLabel}`);
  if (order.notes) lines.push(`Observações: ${order.notes}`);
  lines.push('', 'Pedido registrado pelo MesaFlow.');
  return lines.join('\n');
}

export function buildOrderWhatsAppUrl(phone, order) {
  const number = normalizeWhatsAppNumber(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(buildOrderWhatsAppMessage(order))}` : '';
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
