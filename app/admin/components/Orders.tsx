"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatMoney } from "../format";

const statusLabels: any = {
  novo: "Novo",
  confirmado: "Aceito",
  preparando: "Em preparo",
  pronto: "Pronto",
  saiu_para_entrega: "Saiu para entrega",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
export default function Orders({
  orders,
  token,
  tenant,
  reload,
}: {
  orders: any[];
  token: string;
  tenant: string;
  reload: () => void;
}) {
  const [busy, setBusy] = useState("");
  async function change(id: string, status: string) {
    try {
      setBusy(id);
      await api(`status?restaurant=${tenant}`, {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, status }),
      });
      await reload();
    } finally {
      setBusy("");
    }
  }
  function actions(o: any) {
    if (o.status === "novo")
      return [
        ["confirmado", "Aceitar"],
        ["cancelado", "Cancelar"],
      ];
    if (o.status === "confirmado")
      return [
        ["preparando", "Iniciar preparo"],
        ["cancelado", "Cancelar"],
      ];
    if (o.status === "preparando")
      return o.fulfillment === "entrega"
        ? [
            ["saiu_para_entrega", "Saiu para entrega"],
            ["cancelado", "Cancelar"],
          ]
        : [
            ["pronto", "Pronto para retirada"],
            ["cancelado", "Cancelar"],
          ];
    if (o.status === "pronto") return [["concluido", "Concluir"]];
    if (o.status === "saiu_para_entrega")
      return [["concluido", "Concluir entrega"]];
    return [];
  }
  return (
    <section className="admin-panel">
      <div className="panel-title">
        <h2>Pedidos recentes</h2>
      </div>
      <div className="order-table">
        {orders.slice(0, 20).map((o) => (
          <div className="order-row operational-order" key={o.id}>
            <b>#{o.public_number}</b>
            <span>{o.customer_name}</span>
            <span>{statusLabels[o.status] || o.status}</span>
            <strong>{formatMoney(o.total)}</strong>
            <div className="order-actions">
              {actions(o).map(([status, label]: any) => (
                <button
                  key={status}
                  disabled={busy === o.id}
                  className={
                    status === "cancelado" ? "order-cancel" : "order-next"
                  }
                  onClick={() => change(o.id, status)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {!orders.length ? (
          <div className="menu-empty">Nenhum pedido recebido ainda.</div>
        ) : null}
      </div>
    </section>
  );
}
