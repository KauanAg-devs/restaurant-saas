"use client";

import { useEffect, useState } from "react";

function tokenEmail(token: string) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return String(payload.email || "");
  } catch {
    return "";
  }
}

export default function AccountMenu() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [tenant, setTenant] = useState("");
  useEffect(() => {
    const sync = () => {
      const isAdmin = location.pathname === "/admin";
      const token = localStorage.getItem("mesaflow-token") || "";
      setReady(isAdmin && Boolean(token));
      setEmail(tokenEmail(token));
      setTenant(new URLSearchParams(location.search).get("restaurant") || "");
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  if (!ready) return null;
  const initial = (email || "C").slice(0, 1).toUpperCase();
  function logout() {
    localStorage.removeItem("mesaflow-token");
    location.href = tenant
      ? `/admin?restaurant=${encodeURIComponent(tenant)}`
      : "/admin";
  }
  return (
    <div className="account-dock">
      <div className={`account-popover ${open ? "open" : ""}`}>
        <div className="account-popover-head">
          <span>{initial}</span>
          <div>
            <b>Minha conta</b>
            <small>{email || "Conta MesaFlow"}</small>
          </div>
        </div>
        <a
          href={`/conta${tenant ? `?restaurant=${encodeURIComponent(tenant)}` : ""}`}
        >
          ⚙ <span>Configurações da conta</span>
        </a>
        <button onClick={logout}>
          ↪ <span>Sair</span>
        </button>
      </div>
      <button
        className="account-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="account-avatar">{initial}</span>
        <span className="account-copy">
          <b>{email ? email.split("@")[0] : "Minha conta"}</b>
          <small>Conta e segurança</small>
        </span>
        <span className="account-chevron">⌃</span>
      </button>
    </div>
  );
}
