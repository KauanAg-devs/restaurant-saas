"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";

const palettes = [
  {
    id: "bistro",
    name: "Bistrô",
    primary: "#b93822",
    secondary: "#e7854f",
    background: "#fff9f1",
    surface: "#ffffff",
    text: "#171717",
    muted: "#777777",
  },
  {
    id: "premium",
    name: "Premium",
    primary: "#171717",
    secondary: "#b99155",
    background: "#f5f1e8",
    surface: "#ffffff",
    text: "#171717",
    muted: "#746b60",
  },
  {
    id: "verde",
    name: "Verde",
    primary: "#166534",
    secondary: "#84cc16",
    background: "#f0fdf4",
    surface: "#ffffff",
    text: "#163020",
    muted: "#5d7162",
  },
  {
    id: "oceano",
    name: "Oceano",
    primary: "#075985",
    secondary: "#06b6d4",
    background: "#ecfeff",
    surface: "#ffffff",
    text: "#0c2533",
    muted: "#60727b",
  },
  {
    id: "doce",
    name: "Doce",
    primary: "#be185d",
    secondary: "#f472b6",
    background: "#fdf2f8",
    surface: "#ffffff",
    text: "#3b1728",
    muted: "#806273",
  },
  {
    id: "noturno",
    name: "Noturno",
    primary: "#7c3aed",
    secondary: "#ec4899",
    background: "#111827",
    surface: "#1f2937",
    text: "#f9fafb",
    muted: "#9ca3af",
  },
];

export default function AppearancePalettes() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [tenant, setTenant] = useState("");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState("");

  useEffect(() => {
    if (location.pathname !== "/admin") return;
    setTenant(
      new URLSearchParams(location.search).get("restaurant") || "sabor-da-casa",
    );
    setToken(localStorage.getItem("mesaflow-token") || "");
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

  async function apply(p: any) {
    if (!token || !tenant || saving) return;
    setSaving(p.id);
    try {
      await api(`branding?restaurant=${encodeURIComponent(tenant)}`, {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({
          primary_color: p.primary,
          secondary_color: p.secondary,
          background_color: p.background,
          surface_color: p.surface,
          text_color: p.text,
          muted_text_color: p.muted,
          button_background_color: p.primary,
          button_text_color: "#ffffff",
          price_color: p.primary,
          category_active_background_color: p.primary,
          category_active_text_color: "#ffffff",
        }),
      });
      location.reload();
    } finally {
      setSaving("");
    }
  }

  if (!host) return null;
  return createPortal(
    <div className="appearance-card palette-card">
      <div className="section-heading">
        <div>
          <span className="muted-caps">PALETAS</span>
          <h2>Escolha um ponto de partida</h2>
          <p>
            Use uma combinação pronta e ajuste as cores individualmente depois.
          </p>
        </div>
      </div>
      <div className="palette-grid">
        {palettes.map((p) => (
          <button
            key={p.id}
            className="palette-option"
            onClick={() => apply(p)}
            disabled={Boolean(saving)}
          >
            <div
              className="palette-preview"
              style={{ background: p.background }}
            >
              <span style={{ background: p.primary }} />
              <span style={{ background: p.secondary }} />
              <span style={{ background: p.surface }} />
              <span style={{ background: p.text }} />
            </div>
            <div>
              <b>{p.name}</b>
              <small>{saving === p.id ? "Aplicando…" : "Aplicar paleta"}</small>
            </div>
          </button>
        ))}
      </div>
    </div>,
    host,
  );
}
