import { PayloadTooLargeException } from "@nestjs/common";

export function slugify(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "produto"
  );
}

export function imageExtension(mime: string) {
  return (
    {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    }[mime] || ""
  );
}

export function normalizeSetting(key: string, value: unknown) {
  if (["whatsapp", "address_text"].includes(key)) {
    return String(value ?? "").trim();
  }
  if (["delivery_fee", "minimum_order"].includes(key)) {
    return String(Number(value).toFixed(2));
  }
  return value;
}

export async function readBody(req: any, maxBytes: number) {
  const declared = Number(req.headers?.["content-length"] || 0);
  if (declared > maxBytes) throw imageTooLarge();

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += value.length;
    if (size > maxBytes) throw imageTooLarge();
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

function imageTooLarge() {
  return new PayloadTooLargeException("A imagem deve ter no máximo 4 MB.");
}
