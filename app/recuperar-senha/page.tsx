"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PasswordRecoveryPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
    const access = hash.get("token") || "";
    if (access) setToken(access);
  }, []);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const redirectTo = `${location.origin}/recuperar-senha`;
      const r: any = await api("password-reset", {
        method: "POST",
        body: JSON.stringify({ email, redirect_to: redirectTo }),
      });
      setMessage(
        r.message ||
          "Verifique sua caixa de entrada. Se houver uma conta vinculada a este e-mail, você receberá um link para redefinir sua senha.",
      );
      if (r.reset_url) location.href = r.reset_url;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8)
      return setError("A senha deve ter pelo menos 8 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    try {
      setBusy(true);
      await api("password-update", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setMessage("Senha atualizada. Você já pode entrar no painel.");
      history.replaceState(null, "", location.pathname);
      setToken("");
      setPassword("");
      setConfirm("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const feedback = message || error;

  return (
    <main className="admin-login">
      <section>
        <span className="eyebrow">MESAFLOW · CONTA</span>
        <h1>Recupere seu acesso.</h1>
        <p>
          Use o e-mail da sua conta para receber um link seguro de redefinição.
        </p>
      </section>
      {token ? (
        <form className="recovery-form" onSubmit={updatePassword}>
          <div className="admin-mark">M</div>
          <span className="muted-caps">NOVA SENHA</span>
          <h2>Defina uma nova senha</h2>
          <label>
            Nova senha
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Confirmar senha
            <input
              type="password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>
          <button className="button button-dark" disabled={busy}>
            {busy ? "Salvando…" : "Salvar nova senha"}
          </button>
          {feedback ? (
            <div
              className={`recovery-feedback ${error ? "is-error" : "is-success"}`}
              role={error ? "alert" : "status"}
            >
              {feedback}
            </div>
          ) : null}
          <a className="recovery-back" href="/admin">
            <span aria-hidden="true">←</span> Voltar ao login
          </a>
        </form>
      ) : (
        <form className="recovery-form" onSubmit={requestReset}>
          <div className="admin-mark">M</div>
          <span className="muted-caps">RECUPERAÇÃO</span>
          <h2>Esqueceu a senha?</h2>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button className="button button-dark" disabled={busy}>
            {busy ? "Enviando…" : "Enviar link de recuperação"}
          </button>
          {feedback ? (
            <div
              className={`recovery-feedback ${error ? "is-error" : "is-success"}`}
              role={error ? "alert" : "status"}
            >
              {feedback}
            </div>
          ) : null}
          <a className="recovery-back" href="/admin">
            <span aria-hidden="true">←</span> Voltar ao login
          </a>
        </form>
      )}
    </main>
  );
}
