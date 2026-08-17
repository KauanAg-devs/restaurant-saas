export type StoreView = "cart" | "checkout" | "success";

export function parseStoreView(value: string | null): StoreView | null {
  return value === "cart" || value === "checkout" || value === "success"
    ? value
    : null;
}

export function storeUrl(
  slug: string,
  state: {
    category?: string;
    product?: string;
    view?: StoreView;
  } = {},
) {
  const query = new URLSearchParams();
  if (state.category && state.category !== "all") {
    query.set("category", state.category);
  }
  if (state.product) query.set("product", state.product);
  if (state.view) query.set("view", state.view);
  const suffix = query.toString();
  return `/loja/${encodeURIComponent(slug)}${suffix ? `?${suffix}` : ""}`;
}
