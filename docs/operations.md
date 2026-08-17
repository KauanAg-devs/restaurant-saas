# Operação e portabilidade

## Variáveis

Use `.env.example` como inventário. Segredos ficam no ambiente do provedor e nunca no Git. Em produção:

- `DATABASE_URL`: conexão PostgreSQL;
- `DATABASE_SSL=true`: obrigatório para Neon;
- `JWT_SECRET`: segredo longo e exclusivo;
- `CORS_ORIGINS`: origens permitidas, separadas por vírgula;
- `BLOB_READ_WRITE_TOKEN`: necessário somente para o adaptador Vercel Blob;
- `PASSWORD_RESET_DEV_MODE=false`: nunca habilite o modo de desenvolvimento em produção.

## Migrations

```bash
cd backend
npm install
npm run migration:run
```

Execute migrations antes de promover uma versão que depende do novo schema. Faça backup ou confirme o ponto de restauração do provedor antes de migrations destrutivas. `DB_SYNC` deve permanecer falso em produção.

## Deploy e rollback

1. Rode `npm run check` localmente.
2. Gere um único commit com a mudança completa.
3. Aguarde o deployment ficar `READY`.
4. Teste login, catálogo, criação de pedido e o fluxo alterado.
5. Se houver regressão, promova novamente o último deployment `READY`; não tente corrigir diretamente em produção.

## Trocar a Vercel

- Hospede o Next.js em qualquer ambiente Node compatível.
- Inicie o NestJS com `backend/src/main.ts` e configure `NEXT_PUBLIC_API_URL` para a URL da API.
- Repita as variáveis de ambiente e CORS no novo provedor.
- A entrada `api/index.ts` pode ser descartada quando a API rodar como processo persistente.

## Trocar o armazenamento de imagens

Implemente `ObjectStorage` de `backend/src/storage/object-storage.ts`, registre o novo provider em `storage.module.ts` e remova `@vercel/blob` quando o adaptador antigo não for mais usado. O módulo administrativo não precisa mudar.

## Trocar Neon

Crie um PostgreSQL compatível, restaure os dados, execute as migrations pendentes e altere `DATABASE_URL`. A aplicação usa TypeORM e SQL/PostgreSQL padrão; não chama uma API específica do Neon.
