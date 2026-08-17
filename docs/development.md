# Desenvolvimento seguro

## Antes de editar

1. Localize a rota e o componente com `rg`.
2. Leia o fluxo completo do navegador até o banco.
3. Confirme o contrato existente nos testes e em `backend/src/api-contract.ts`.
4. Evite adicionar comportamento a arquivos globais quando ele pertence a uma página.

## Ao implementar

- Preserve o filtro por `restaurantId` em toda operação autenticada.
- Nunca confie em preço, taxa, disponibilidade ou total enviados pelo navegador; recalcule na API.
- Crie migrations para mudanças de schema. Não use `DB_SYNC=true` em produção.
- Coloque APIs de terceiros atrás de interfaces/adaptadores.
- Reaproveite os componentes em `app/admin/components` em vez de crescer `page.tsx` novamente.
- Não acrescente um novo CSS de correção se a regra pode ser corrigida no stylesheet proprietário do componente.

## Validar

```bash
npm run format
npm run typecheck
npm test
npm run test:backend
npm run build
git diff --check
```

`npm run check` também executa `format:check` e rejeita código-fonte fora do padrão. Arquivos em `backend/dist` são gerados pelo build: faça manutenção nos equivalentes em `backend/src`, nunca no JavaScript compilado.

Também faça um teste manual do fluxo afetado. Para pedidos: abrir loja, adicionar item, finalizar, conferir o pedido no painel e mudar o status. Para configurações: salvar, recarregar e conferir a loja pública.

Para executar os smoke tests contra um ambiente já publicado, informe a API explicitamente:

```bash
API_URL=https://seu-dominio/api npm test
```

Sem `API_URL`, esses dois testes externos são ignorados; os testes locais continuam sendo executados.

## Publicar

Agrupe alterações relacionadas em um commit. O projeto está no Vercel Hobby e não deve gastar deployments com commits intermediários. Só publique depois de todos os checks locais passarem.
