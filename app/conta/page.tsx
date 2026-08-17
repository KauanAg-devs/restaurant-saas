"use client";

import { useEffect, useState } from "react";

function tokenEmail(token: string) {
  try {
    const p = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return String(p.email || "");
  } catch {
    return "";
  }
}
export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [tenant, setTenant] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("mesaflow-token") || "";
    setTenant(new URLSearchParams(location.search).get("restaurant") || "");
    if (!token) {
      location.href = "/admin";
      return;
    }
    setEmail(tokenEmail(token));
    setReady(true);
  }, []);
  function logout() {
    localStorage.removeItem("mesaflow-token");
    location.href = tenant
      ? `/admin?restaurant=${encodeURIComponent(tenant)}`
      : "/admin";
  }
  if (!ready) return <main className="account-page-loading" />;
  return (
    <main className="account-page">
      <header>
        <a
          href={
            tenant
              ? `/admin?restaurant=${encodeURIComponent(tenant)}`
              : "/admin"
          }
        >
          ← Voltar ao painel
        </a>
        <div className="account-page-brand">
          <span>M</span>
          <b>MesaFlow</b>
        </div>
      </header>
      <section className="account-page-wrap">
        <div className="account-page-title">
          <span>CONTA</span>
          <h1>Configurações da conta</h1>
          <p>Gerencie seus dados de acesso e sua sessão do MesaFlow.</p>
        </div>
        <article className="account-settings-card">
          <div>
            <h2>Dados da conta</h2>
            <p>Informações usadas para acessar o painel.</p>
          </div>
          <label>
            E-mail
            <input value={email} readOnly />
            <small>
              A alteração de e-mail será disponibilizada junto da confirmação de
              identidade.
            </small>
          </label>
        </article>
        <article className="account-settings-card account-security">
          <div>
            <h2>Segurança</h2>
            <p>Controle o acesso a esta conta.</p>
          </div>
          <div className="account-security-row">
            <div>
              <b>Senha</b>
              <small>
                A redefinição de senha será adicionada pelo fluxo seguro de
                recuperação.
              </small>
            </div>
            <span>Protegida</span>
          </div>
        </article>
        <article className="account-settings-card danger-zone">
          <div>
            <h2>Sessão</h2>
            <p>Encerre sua sessão neste dispositivo.</p>
          </div>
          <button onClick={logout}>Sair da conta</button>
        </article>
      </section>
    </main>
  );
}
