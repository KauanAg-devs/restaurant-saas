"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function AdminRecoveryLink() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const find = () =>
      setHost(
        location.pathname === "/admin"
          ? document.querySelector<HTMLElement>(".admin-login form")
          : null,
      );
    find();
    const obs = new MutationObserver(find);
    obs.observe(document.body, { subtree: true, childList: true });
    return () => obs.disconnect();
  }, []);
  if (!host) return null;
  return createPortal(
    <a className="admin-recovery-link" href="/recuperar-senha">
      Esqueci minha senha
    </a>,
    host,
  );
}
