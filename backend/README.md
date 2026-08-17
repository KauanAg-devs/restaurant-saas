# MesaFlow API

Backend standalone do MesaFlow em NestJS + PostgreSQL. Ele pode rodar como processo Node ou pela entrada serverless do projeto principal.

## Local

```bash
cd backend
cp .env.example .env
docker compose up -d
npm install
DB_SYNC=true npm run start:dev
```

`DB_SYNC=true` é apenas para desenvolvimento local. Em produção use `DB_SYNC=false` e rode migrations.

## Contrato atual

A API mantém os caminhos usados pelo frontend existente, sob `/api`:

- `POST /api/onboarding`
- `POST /api/login`
- `GET /api/catalog?restaurant={slug}`
- `POST /api/order`
- `GET /api/admin?restaurant={slug}`
- `PATCH /api/status?restaurant={slug}`
- `POST|PATCH|DELETE /api/product`
- `PATCH /api/settings`
- `PATCH /api/branding`
- `POST /api/product-image`
- `POST /api/logo-image`

## Segurança

O navegador nunca acessa PostgreSQL diretamente. Autorização multi-tenant acontece na API através de `restaurant_members`. Senhas são armazenadas somente como bcrypt hash e sessões são JWT Bearer tokens. Rate limits sensíveis são persistidos no PostgreSQL.

## Estrutura

- Controllers recebem HTTP, autenticam e delegam.
- `admin/admin.service.ts` e `orders/orders.service.ts` contêm regras e persistência.
- `storage/object-storage.ts` é a interface para imagens; o adaptador atual usa Vercel Blob.
- `database/migrations` é a fonte de verdade do schema em produção.

Veja também `../docs/architecture.md` e `../docs/operations.md`.
