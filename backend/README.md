# MesaFlow API

Backend standalone do MesaFlow em NestJS + PostgreSQL. Não depende de Supabase em runtime.

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

## Segurança

O navegador nunca acessa PostgreSQL diretamente. Autorização multi-tenant acontece na API através de `restaurant_members`. Senhas são armazenadas somente como bcrypt hash e sessões são JWT Bearer tokens.

## Antes do cutover

1. Provisionar um PostgreSQL novo.
2. Executar a migration inicial.
3. Adicionar storage S3/R2 e `/api/product-image`.
4. Adicionar recuperação de senha + SMTP.
5. Adicionar rate limiting persistente.
6. Migrar dados do banco atual.
7. Executar testes de paridade e isolamento.
8. Apontar `NEXT_PUBLIC_API_URL` para o novo backend.

O Supabase não deve ser necessário depois do passo 8; ele permanece apenas como origem temporária durante a migração de dados.
