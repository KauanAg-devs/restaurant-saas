"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";

const patterns = [
  ["none", "Sem padrão"],
  ["dots", "Pontos"],
  ["grid", "Grade"],
  ["diagonal", "Diagonal"],
  ["waves", "Ondas"],
  ["crosshatch", "Trama"],
] as const;

export default function AppearancePatterns() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [tenant, setTenant] = useState("");
  const [token, setToken] = useState("");
  const [value, setValue] = useState("none");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/admin") return;
    const t =
      new URLSearchParams(location.search).get("restaurant") || "sabor-da-casa";
    const auth = localStorage.getItem("mesaflow-token") || "";
    setTenant(t);
    setToken(auth);
    if (auth) {
      api(`admin?restaurant=${encodeURIComponent(t)}`, {
        headers: { authorization: `Bearer ${auth}` },
      })
        .then((d: any) => setValue(d?.restaurant?.background_pattern || "none"))
        .catch(() => {});
    }
    const find = () => {
      const title = document
        .querySelector(".admin-content>header h1")
        ?.textContent?.trim();
      const editor = document.querySelector(
        ".appearance-editor",
      ) as HTMLElement | null;
      setHost(title === "Aparência" ? editor : null);
    };
    find();
    const obs = new MutationObserver(find);
    obs.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return () => obs.disconnect();
  }, []);

  async function choose(next: string) {
    if (!token || !tenant) return;
    setValue(next);
    setSaving(true);
    setSaved(false);
    try {
      await api(`branding?restaurant=${encodeURIComponent(tenant)}`, {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({ background_pattern: next }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!host) return null;
  return createPortal(
    <div className="appearance-card pattern-card">
      <div className="section-heading">
        <div>
          <span className="muted-caps">FUNDO</span>
          <h2>Pattern da loja</h2>
          <p>Adicione textura ao fundo sem competir com o cardápio.</p>
        </div>
      </div>
      <div className="pattern-grid">
        {patterns.map(([id, label]) => (
          <button
            key={id}
            className={`pattern-option pattern-${id} ${value === id ? "selected" : ""}`}
            onClick={() => choose(id)}
            disabled={saving}
          >
            <span className="pattern-swatch" />
            <b>{label}</b>
            {value === id ? <small>Selecionado</small> : null}
          </button>
        ))}
      </div>
      <div className="pattern-note">
        {saving
          ? "Salvando…"
          : saved
            ? "✓ Pattern salvo e aplicado à loja."
            : "A escolha é salva para este restaurante."}
      </div>
    </div>,
    host,
  );
}
