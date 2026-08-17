"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { API, api } from "@/lib/api";
import { formatMoney } from "../format";

const blankProduct = {
  id: "",
  name: "",
  description: "",
  price: "",
  category_id: "",
  image_url: "",
  featured: false,
  available: true,
  active: true,
  sort_order: 0,
};
export default function Catalog({
  products,
  categories,
  token,
  tenant,
  reload,
  productId,
  onProductChange,
}: {
  products: any[];
  categories: any[];
  token: string;
  tenant: string;
  reload: () => void;
  productId: string | null;
  onProductChange: (id: string | null) => void;
}) {
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(blankProduct);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setMessage("");
    if (!productId) {
      setEditing(null);
      return;
    }
    if (productId === "new") {
      setForm({ ...blankProduct, category_id: categories[0]?.id || "" });
      setEditing({ new: true });
      return;
    }
    const product = products.find((item) => item.id === productId);
    if (product) {
      setForm({ ...product, price: String(product.price ?? "") });
      setEditing(product);
    }
  }, [productId, products, categories]);

  function open(product?: any) {
    onProductChange(product?.id || "new");
  }
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setMessage("A imagem deve ter no máximo 4 MB.");
      return;
    }
    try {
      setUploading(true);
      const r = await fetch(
        `${API}/product-image?restaurant=${encodeURIComponent(tenant)}`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": file.type,
          },
          body: file,
        },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Falha no upload");
      setForm((f: any) => ({ ...f, image_url: d.url }));
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setUploading(false);
    }
  }
  async function save() {
    if (!form.name.trim() || !form.category_id || form.price === "") {
      setMessage("Preencha nome, categoria e preço.");
      return;
    }
    try {
      setBusy(true);
      const isNew = !form.id;
      await api(`product?restaurant=${tenant}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      await reload();
      onProductChange(null);
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!form.id) return;
    try {
      setBusy(true);
      await api(`product?restaurant=${tenant}&id=${form.id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      await reload();
      onProductChange(null);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="admin-panel catalog-panel">
        <div className="catalog-head">
          <div>
            <span className="muted-caps">GESTÃO DO CARDÁPIO</span>
            <h2>Produtos</h2>
            <p>
              {products.length} cadastrados ·{" "}
              {products.filter((p) => p.available && p.active).length}{" "}
              disponíveis
            </p>
          </div>
          <button className="button button-dark" onClick={() => open()}>
            + Novo produto
          </button>
        </div>
        <div className="catalog-list">
          {products.map((p) => (
            <button className="catalog-row" key={p.id} onClick={() => open(p)}>
              <div className="catalog-thumb">
                {p.image_url ? (
                  <img src={p.image_url} alt="" />
                ) : (
                  <span>Sem foto</span>
                )}
              </div>
              <div className="catalog-main">
                <b>{p.name}</b>
                <small>
                  {categories.find((c) => c.id === p.category_id)?.name ||
                    "Sem categoria"}{" "}
                  · {p.available ? "Disponível" : "Indisponível"}
                </small>
              </div>
              <strong>{formatMoney(p.price)}</strong>
              <span
                className={`catalog-state ${p.available && p.active ? "on" : "off"}`}
              >
                {p.available && p.active ? "Ativo" : "Pausado"}
              </span>
              <span className="catalog-edit">Editar</span>
            </button>
          ))}
        </div>
      </section>
      {editing
        ? createPortal(
            <div className="product-editor-back">
              <section className="product-editor">
                <div className="product-editor-head">
                  <h2>{form.id ? "Editar produto" : "Novo produto"}</h2>
                  <button onClick={() => onProductChange(null)}>×</button>
                </div>
                <div className="image-upload">
                  <div>
                    {form.image_url ? (
                      <img src={form.image_url} alt="" />
                    ) : (
                      <span>Imagem do produto</span>
                    )}
                  </div>
                  <label className="image-upload-button">
                    {uploading ? "Enviando…" : "Enviar foto"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => upload(e.target.files?.[0])}
                    />
                  </label>
                </div>
                <div className="product-form">
                  <label>
                    Nome
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Preço
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                    />
                  </label>
                  <label className="wide">
                    Descrição
                    <textarea
                      value={form.description || ""}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Categoria
                    <select
                      value={form.category_id}
                      onChange={(e) =>
                        setForm({ ...form, category_id: e.target.value })
                      }
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) =>
                        setForm({ ...form, available: e.target.checked })
                      }
                    />
                    Disponível
                  </label>
                </div>
                <div className="product-editor-actions">
                  {form.id ? (
                    <button className="danger-button" onClick={remove}>
                      Excluir
                    </button>
                  ) : (
                    <span />
                  )}
                  <button className="button button-dark" onClick={save}>
                    Salvar produto
                  </button>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
