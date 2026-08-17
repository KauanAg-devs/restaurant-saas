"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type GuideCheck = {
  label: string;
  ok: boolean;
  tab: "Cardápio" | "Configurações";
  target?: string;
  openProduct?: boolean;
};

export default function AdminActivationChecklist() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [tenant, setTenant] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [notice, setNotice] = useState("");
  const [completionVisible, setCompletionVisible] = useState(false);
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!location.pathname.startsWith("/admin")) return;
      const token = localStorage.getItem("mesaflow-token");
      if (!token) return;
      const slug = new URLSearchParams(location.search).get("restaurant");
      const path = slug
        ? `admin?restaurant=${encodeURIComponent(slug)}`
        : "admin";
      try {
        const data: any = await api(path, {
          headers: { authorization: `Bearer ${token}` },
        });
        if (alive) {
          const resolvedSlug = data?.restaurant?.slug || slug || "";
          setRestaurant(data.restaurant);
          setProducts(data.products || []);
          setTenant(resolvedSlug);
          setCollapsed(
            sessionStorage.getItem(
              `mesaflow-activation-collapsed:${resolvedSlug}`,
            ) === "1",
          );
        }
      } catch {}
    }
    load();
    const refresh = () => load();
    window.addEventListener("mesaflow:settings-saved", refresh);
    const id = setInterval(load, 30000);
    return () => {
      alive = false;
      window.removeEventListener("mesaflow:settings-saved", refresh);
      clearInterval(id);
    };
  }, []);
  const checks = useMemo<GuideCheck[]>(
    () =>
      restaurant
        ? [
            {
              label: "Loja ativa",
              ok: Boolean(restaurant.active),
              tab: "Configurações",
              target: ".settings-page",
            },
            {
              label: "Cardápio com produto disponível",
              ok: products.some((p) => p.active && p.available),
              tab: "Cardápio",
              target: ".catalog-panel",
              openProduct: true,
            },
            {
              label: "Pagamento configurado",
              ok:
                Array.isArray(
                  restaurant.payment_methods || restaurant.paymentMethods,
                ) &&
                (restaurant.payment_methods || restaurant.paymentMethods)
                  .length > 0,
              tab: "Configurações",
              target: ".payment-methods-card",
            },
            {
              label: "Entrega ou retirada habilitada",
              ok: Boolean(
                restaurant.accepts_delivery ||
                  restaurant.acceptsDelivery ||
                  restaurant.accepts_pickup ||
                  restaurant.acceptsPickup,
              ),
              tab: "Configurações",
              target: ".settings-page",
            },
            {
              label: "Horário de atendimento configurado",
              ok: Boolean(
                (restaurant.opening_hours || restaurant.openingHours) &&
                  Object.keys(
                    restaurant.opening_hours || restaurant.openingHours,
                  ).length,
              ),
              tab: "Configurações",
              target: ".opening-hours-card",
            },
          ]
        : [],
    [restaurant, products],
  );
  const ready = checks.length > 0 && checks.every((c) => c.ok);
  useEffect(() => {
    if (!tenant || !checks.length) return;
    const key = `mesaflow-activation-complete:${tenant}`;
    if (!ready) {
      localStorage.removeItem(key);
      setCompletionVisible(false);
      return;
    }
    if (localStorage.getItem(key) === "1") {
      setCompletionVisible(false);
      return;
    }
    setCompletionVisible(true);
    const timer = setTimeout(() => {
      localStorage.setItem(key, "1");
      setCompletionVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [ready, tenant, checks.length]);
  if (!restaurant || !tenant) return null;
  const url = `${location.origin}/loja/${encodeURIComponent(tenant)}`;
  function collapse(value: boolean) {
    setCollapsed(value);
    if (value)
      sessionStorage.setItem(`mesaflow-activation-collapsed:${tenant}`, "1");
    else sessionStorage.removeItem(`mesaflow-activation-collapsed:${tenant}`);
  }
  function dismissCompletion() {
    localStorage.setItem(`mesaflow-activation-complete:${tenant}`, "1");
    setCompletionVisible(false);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Link copiado");
      setTimeout(() => setNotice(""), 2200);
    } catch {
      setNotice("Não foi possível copiar automaticamente.");
      setTimeout(() => setNotice(""), 3000);
    }
  }
  function guide(check: GuideCheck) {
    const button = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".admin-sidebar nav button"),
    ).find((b) => b.textContent?.trim() === check.tab);
    button?.click();
    collapse(true);
    setTimeout(() => {
      const target = check.target
        ? document.querySelector<HTMLElement>(check.target)
        : null;
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (check.openProduct) {
        setTimeout(
          () =>
            document
              .querySelector<HTMLButtonElement>(".catalog-head .button")
              ?.click(),
          250,
        );
      }
    }, 120);
  }
  if (ready && !completionVisible) return null;
  if (!ready && collapsed)
    return (
      <>
        <button className="activation-launcher" onClick={() => collapse(false)}>
          <span>•</span>Terminar configuração
        </button>
        {notice ? (
          <div className="activation-toast" role="status">
            {notice}
          </div>
        ) : null}
      </>
    );
  return (
    <>
      <aside className={`activation-card ${ready ? "ready" : ""}`}>
        <button
          className="activation-close"
          aria-label="Fechar checklist"
          onClick={() => (ready ? dismissCompletion() : collapse(true))}
        >
          ×
        </button>
        <div>
          <span className="muted-caps">ATIVAÇÃO</span>
          <h3>
            {ready
              ? "Sua loja está pronta para receber pedidos"
              : "Termine de preparar sua loja"}
          </h3>
          <p>
            {ready
              ? "Esta confirmação fechará automaticamente em alguns segundos."
              : "Clique em cada etapa pendente e eu te levo direto ao lugar certo."}
          </p>
        </div>
        <div className="activation-checks">
          {checks.map((c) => (
            <button
              key={c.label}
              className={c.ok ? "ok" : ""}
              disabled={c.ok}
              onClick={() => guide(c)}
            >
              <span>{c.ok ? "✓" : "○"}</span>
              <b>{c.label}</b>
              {!c.ok ? <small>Configurar →</small> : null}
            </button>
          ))}
        </div>
        <div className="activation-actions">
          <button onClick={copy}>Copiar link da loja</button>
          <a
            href={`/loja/${encodeURIComponent(tenant)}`}
            target="_blank"
            rel="noreferrer"
          >
            Testar como cliente ↗
          </a>
        </div>
      </aside>
      {notice ? (
        <div className="activation-toast" role="status">
          {notice}
        </div>
      ) : null}
    </>
  );
}
