

## Plano: Corrigir exportação de thumbnails com props faltando

### Problema
A exportação das thumbs de "Cortes" está incorreta porque três propriedades essenciais não são enviadas ao servidor Railway:

1. **`useQuadrantGrid`** — controla se o modelo "Thumb Principal" usa grade 2x2 (Roda de Bobo) ou cutouts livres. Sem essa prop, o servidor sempre renderiza como cutouts livres.
2. **`tpHomeTeamId`** / **`tpAwayTeamId`** — escudos dos times no círculo central da Thumb Principal.

Essas props existem no `CortesThumbBuilder` mas não são incluídas no objeto `currentCanvasProps` passado ao `CortesControls`, portanto nunca chegam ao `handleExport`.

### Solução
Incluir as 3 props faltantes em dois pontos:

**Arquivo 1: `src/components/cortes/CortesThumbBuilder.tsx`** (linhas ~547-549)

Adicionar ao objeto `currentCanvasProps`:
```ts
useQuadrantGrid,
tpHomeTeamId,
tpAwayTeamId,
```

**Arquivo 2: `src/components/cortes/CortesControls.tsx`** (linhas ~571-574)

Adicionar ao payload do `handleExport`:
```ts
useQuadrantGrid: props.useQuadrantGrid,
tpHomeTeamId: props.tpHomeTeamId,
tpAwayTeamId: props.tpAwayTeamId,
```

### Impacto
Após a correção, um novo deploy no Railway NÃO é necessário — o servidor já aceita essas props no `Render.tsx`. A mudança é apenas no frontend que agora passa os valores corretos.

