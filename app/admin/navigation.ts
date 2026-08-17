export const ADMIN_TABS = [
  { id: "overview", label: "Visão geral" },
  { id: "orders", label: "Pedidos" },
  { id: "catalog", label: "Cardápio" },
  { id: "appearance", label: "Aparência" },
  { id: "settings", label: "Configurações" },
] as const;

export type AdminTab = (typeof ADMIN_TABS)[number]["id"];

export function parseAdminTab(value: string | null): AdminTab {
  return ADMIN_TABS.some((tab) => tab.id === value)
    ? (value as AdminTab)
    : "overview";
}

export function adminUrl(tenant: string, tab: AdminTab, productId?: string) {
  const query = new URLSearchParams({ restaurant: tenant, tab });
  if (tab === "catalog" && productId) query.set("product", productId);
  return `/admin?${query.toString()}`;
}
