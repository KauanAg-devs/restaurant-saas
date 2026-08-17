# Arquitetura

## Fluxo de uma requisição

1. O navegador renderiza a loja ou o painel em Next.js.
2. `lib/api.ts` chama uma rota `/api/*`.
3. A entrada em `api/` inicializa o NestJS e seus módulos.
4. Controllers cuidam de HTTP e autenticação; services aplicam regras de negócio.
5. TypeORM acessa PostgreSQL por `DATABASE_URL`.

Em hospedagem com processos persistentes, `backend/src/main.ts` inicia a mesma API na porta configurada. Assim, o backend não exige funções serverless.

## Multi-tenancy

O tenant é o restaurante. Rotas públicas resolvem o restaurante pelo `slug`. Rotas administrativas chamam `AuthService.tenant`, que valida o JWT e a associação em `restaurant_members` antes de retornar o restaurante. Consultas e alterações administrativas sempre incluem `restaurantId`.

Ao criar uma rota administrativa, não aceite um `restaurantId` livre do body. Resolva o tenant pela sessão e pelo slug, e use o ID retornado pela autenticação em todas as consultas.

## Responsabilidade dos módulos

- `auth`: conta, login, recuperação, JWT e autorização multi-tenant.
- `catalog`: leitura pública do restaurante, categorias e produtos.
- `orders`: rate limiting, validação do carrinho, cálculo e persistência atômica.
- `admin`: dashboard, estados do pedido, produtos, configurações e aparência.
- `storage`: interface de armazenamento e adaptadores de fornecedor.
- `database`: entidades, data source e migrations.

Controllers devem permanecer finos. Regra de negócio vai para `*.service.ts`; conversões puras vão para `*.utils.ts`; integração externa vai para um adaptador próprio.

## Frontend

`app/admin/page.tsx` controla sessão, carregamento e navegação do painel. Cada seção editável vive em `app/admin/components`. Componentes auxiliares globais só devem acessar o DOM quando necessário e devem remover listeners no cleanup do efeito.

A loja pública está em `app/loja/[slug]`. Ela consome apenas o contrato público retornado por `catalog`; nunca recebe credenciais ou IDs internos necessários ao painel.
