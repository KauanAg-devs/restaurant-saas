"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const paymentOptions = [
  ["pix", "Pix"],
  ["credit_card", "Cartão de crédito"],
  ["debit_card", "Cartão de débito"],
  ["cash", "Dinheiro"],
  ["alelo", "Alelo"],
  ["ticket", "Ticket"],
  ["vr", "VR Benefícios"],
  ["pluxee", "Pluxee"],
  ["ben", "Ben"],
  ["verocard", "Verocard"],
  ["sodexo", "Sodexo"],
  ["other_voucher", "Outro voucher"],
];
export default function StoreSettings({
  restaurant,
  token,
  tenant,
  reload,
}: {
  restaurant: any;
  token: string;
  tenant: string;
  reload: () => void;
}) {
  const [form, setForm] = useState<any>({
    ...restaurant,
    payment_methods: Array.isArray(restaurant.payment_methods)
      ? restaurant.payment_methods
      : [],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const patch = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const togglePayment = (id: string) =>
    setForm((f: any) => ({
      ...f,
      payment_methods: f.payment_methods.includes(id)
        ? f.payment_methods.filter((x: string) => x !== id)
        : [...f.payment_methods, id],
    }));
  useEffect(() => {
    const sync = (event: Event) => {
      const detail = (
        event as CustomEvent<{ tenant: string; methods: string[] }>
      ).detail;
      if (detail?.tenant === tenant && Array.isArray(detail.methods))
        setForm((current: any) => ({
          ...current,
          payment_methods: detail.methods,
        }));
    };
    window.addEventListener("mesaflow:payment-methods-changed", sync);
    return () =>
      window.removeEventListener("mesaflow:payment-methods-changed", sync);
  }, [tenant]);
  async function save() {
    if (!form.payment_methods.length) {
      setMessage("Selecione pelo menos um meio de pagamento.");
      return;
    }
    try {
      setSaving(true);
      await api(`settings?restaurant=${tenant}`, {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({
          active: Boolean(form.active),
          delivery_minutes_min: Number(form.delivery_minutes_min || 0),
          delivery_minutes_max: Number(form.delivery_minutes_max || 0),
          delivery_fee: Number(form.delivery_fee || 0),
          accepts_delivery: Boolean(form.accepts_delivery),
          accepts_pickup: Boolean(form.accepts_pickup),
          minimum_order: Number(form.minimum_order || 0),
          whatsapp: String(form.whatsapp ?? "").trim(),
          address_text: String(form.address_text ?? "").trim(),
          opening_hours: form.opening_hours || {},
          payment_methods: form.payment_methods,
        }),
      });
      await reload();
      setMessage("✓ Configurações salvas.");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="settings-page">
      <div className="settings-grid">
        <div className="settings-card">
          <h2>Status da loja</h2>
          <label className="switch-line">
            <input
              type="checkbox"
              checked={Boolean(form.active)}
              onChange={(e) => patch("active", e.target.checked)}
            />
            <span>{form.active ? "Loja ativa" : "Loja pausada"}</span>
          </label>
        </div>
        <div className="settings-card">
          <h2>Entrega e retirada</h2>
          <div className="settings-options">
            <label className="switch-line">
              <input
                type="checkbox"
                checked={Boolean(form.accepts_delivery)}
                onChange={(e) => patch("accepts_delivery", e.target.checked)}
              />
              <span>Aceitar entrega</span>
            </label>
            <label className="switch-line">
              <input
                type="checkbox"
                checked={Boolean(form.accepts_pickup)}
                onChange={(e) => patch("accepts_pickup", e.target.checked)}
              />
              <span>Permitir retirada</span>
            </label>
          </div>
          <div className="settings-fields">
            <label>
              Tempo mínimo
              <input
                type="number"
                value={form.delivery_minutes_min ?? 30}
                onChange={(e) => patch("delivery_minutes_min", e.target.value)}
              />
            </label>
            <label>
              Tempo máximo
              <input
                type="number"
                value={form.delivery_minutes_max ?? 45}
                onChange={(e) => patch("delivery_minutes_max", e.target.value)}
              />
            </label>
            <label>
              Taxa de entrega
              <input
                type="number"
                value={form.delivery_fee ?? 0}
                onChange={(e) => patch("delivery_fee", e.target.value)}
              />
            </label>
            <label>
              Pedido mínimo
              <input
                type="number"
                value={form.minimum_order ?? 0}
                onChange={(e) => patch("minimum_order", e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="settings-card settings-payments">
          <h2>Meios de pagamento</h2>
          <p>Selecione exatamente o que seu restaurante aceita.</p>
          <div className="payment-method-grid">
            {paymentOptions.map(([id, label]) => (
              <label
                className={`payment-method-option ${form.payment_methods.includes(id) ? "selected" : ""}`}
                key={id}
              >
                <input
                  type="checkbox"
                  checked={form.payment_methods.includes(id)}
                  onChange={() => togglePayment(id)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="settings-card">
          <h2>Contato</h2>
          <div className="settings-fields single">
            <label>
              WhatsApp
              <input
                value={form.whatsapp || ""}
                onChange={(e) => patch("whatsapp", e.target.value)}
              />
            </label>
            <label>
              Endereço
              <input
                value={form.address_text || ""}
                onChange={(e) => patch("address_text", e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="settings-save">
        <div>{message || "As alterações afetam a operação da loja."}</div>
        <button className="button button-dark" onClick={save} disabled={saving}>
          {saving ? "Salvando…" : "Salvar configurações"}
        </button>
      </div>
    </section>
  );
}
