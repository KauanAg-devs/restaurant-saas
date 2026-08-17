"use client";

import { useState } from "react";
import { API, api } from "@/lib/api";

export default function BrandEditor({
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
  const [form, setForm] = useState({ ...restaurant });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const patch = (key: string, value: any) => {
    setSaved(false);
    setForm((f: any) => ({ ...f, [key]: value }));
  };
  async function uploadLogo(file?: File) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setMessage("A logo deve ter no máximo 4 MB.");
      return;
    }
    try {
      setMessage("");
      setUploading(true);
      const response = await fetch(
        `${API}/logo-image?restaurant=${encodeURIComponent(tenant)}`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": file.type,
          },
          body: file,
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || result.message || "Falha no envio da logo.",
        );
      patch("logo_url", result.url);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setUploading(false);
    }
  }
  async function save() {
    try {
      setSaving(true);
      setMessage("");
      await api(`branding?restaurant=${encodeURIComponent(tenant)}`, {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      await reload();
      setSaved(true);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="appearance-shell">
      <section className="appearance-editor">
        <div className="appearance-card">
          <div className="section-heading">
            <div>
              <span className="muted-caps">IDENTIDADE</span>
              <h2>Marca do restaurante</h2>
            </div>
          </div>
          <div className="logo-editor">
            <div className="logo-preview">
              {form.logo_url ? (
                <img src={form.logo_url} alt="Prévia da logo do restaurante" />
              ) : (
                <span>{form.name?.[0] || "M"}</span>
              )}
            </div>
            <div className="logo-editor-copy">
              <b>Logo do restaurante</b>
              <p>
                Use uma imagem quadrada em PNG, JPEG, WebP ou GIF, com até 4 MB.
              </p>
              <div className="logo-editor-actions">
                <label className="button button-light">
                  {uploading
                    ? "Enviando…"
                    : form.logo_url
                      ? "Trocar logo"
                      : "Enviar logo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={uploading}
                    onChange={(e) => uploadLogo(e.target.files?.[0])}
                  />
                </label>
                {form.logo_url ? (
                  <button
                    type="button"
                    className="logo-remove"
                    onClick={() => patch("logo_url", null)}
                  >
                    Remover
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <div className="simple-grid">
            <label>
              Nome
              <input
                value={form.name || ""}
                onChange={(e) => patch("name", e.target.value)}
              />
            </label>
            <label>
              Slogan
              <input
                value={form.tagline || ""}
                onChange={(e) => patch("tagline", e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="appearance-card">
          <div className="section-heading">
            <h2>Paleta principal</h2>
          </div>
          <div className="essential-colors">
            {[
              "primary_color",
              "secondary_color",
              "background_color",
              "surface_color",
              "text_color",
              "muted_text_color",
            ].map((k) => (
              <Color
                key={k}
                label={k.replace("_color", "").replace("_", " ")}
                value={form[k] || "#ffffff"}
                onChange={(v) => patch(k, v)}
              />
            ))}
          </div>
        </div>
        {message ? (
          <p className="appearance-error" role="alert">
            {message}
          </p>
        ) : null}
        <div className="appearance-actions">
          <button
            className="button button-dark"
            disabled={saving || uploading}
            onClick={save}
          >
            {saving ? "Salvando…" : "Salvar aparência"}
          </button>
          {saved ? <span>✓ Salvo</span> : null}
        </div>
      </section>
    </div>
  );
}

function Color({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="compact-color">
      <span>{label}</span>
      <div>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </label>
  );
}
