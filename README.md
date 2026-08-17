# MesaFlow

SaaS multi-tenant de cardápio e pedidos para restaurantes. O frontend público e o painel são Next.js; a API é NestJS; os dados ficam em PostgreSQL.

## Rodar localmente

Requisitos: Node.js 20+, npm e PostgreSQL.

```bash
cp .env.example .env.local
npm install
npm run dev
```

O `next dev` atende o frontend em `http://localhost:3000`. As rotas `/api/*` são executadas pelo adaptador serverless em `api/`, usando os módulos em `backend/src`. Para trabalhar no backend standalone, veja [backend/README.md](backend/README.md).

Antes de enviar uma alteração:

```bash
npm run check
```

## Onde alterar cada coisa

| Necessidade                          | Arquivo ou pasta principal                     |
| ------------------------------------ | ---------------------------------------------- |
| Painel administrativo                | `app/admin/page.tsx` e `app/admin/components/` |
| Loja pública e checkout              | `app/loja/[slug]/page.tsx`                     |
| Comunicação com a API                | `lib/api.ts`                                   |
| Login, sessão e isolamento de tenant | `backend/src/auth/`                            |
| Catálogo público                     | `backend/src/catalog/`                         |
| Criação de pedidos                   | `backend/src/orders/`                          |
| Painel, produtos e configurações     | `backend/src/admin/`                           |
| Upload de imagens                    | `backend/src/storage/`                         |
| Modelo e migrations do banco         | `backend/src/database/`                        |
| Testes de contrato e segurança       | `backend/src/*.spec.ts` e `tests/`             |

## Arquitetura e operação

- [Arquitetura e limites dos módulos](docs/architecture.md)
- [Deploy, migrations, rollback e troca de fornecedores](docs/operations.md)
- [Como implementar uma mudança com segurança](docs/development.md)

## Dependências de fornecedor

O domínio do produto não depende da Vercel. Next.js, NestJS e PostgreSQL podem ser hospedados em outros provedores. Hoje, os pontos específicos são:

- `api/index.ts`: entrada serverless usada pela Vercel;
- `backend/src/storage/vercel-blob.storage.ts`: adaptador de imagens;
- variáveis e configuração do projeto de deploy.

O banco usa PostgreSQL comum; Neon é o provedor atual, não uma API proprietária da aplicação.
