

## Melhorar Visualizacao Mobile

### Problema
O layout atual usa `flex` horizontal fixo: o canvas (1280x720px com scale 0.85) fica ao lado de uma sidebar de 380px. No mobile, o canvas transborda e fica impossivel de visualizar.

### Solucao

Transformar o layout em responsivo: no mobile, empilhar verticalmente (preview em cima, controles embaixo) e escalar o canvas dinamicamente para caber na tela.

### Alteracoes em `src/pages/Index.tsx`

1. **Layout responsivo**: Trocar `flex` horizontal fixo por `flex-col` no mobile e `md:flex-row` no desktop
2. **Sidebar responsiva**: Largura `w-full` no mobile, `md:w-[380px]` no desktop
3. **Escala dinamica do canvas no mobile**: Usar um wrapper com CSS `transform: scale()` calculado para que o canvas de 1280px caiba na largura da tela. Usar um hook `useIsMobile` ja existente ou calcular via `window.innerWidth`
4. **Preview compacto no mobile**: O canvas fica no topo com altura controlada, e os controles ficam abaixo com scroll

### Detalhes Tecnicos

**`src/pages/Index.tsx`**:
- Importar `useIsMobile` de `@/hooks/use-mobile`
- Calcular escala mobile: `Math.min(window.innerWidth / 1280, 0.85)` (aprox. 0.3 em telas de 390px)
- Container do canvas no mobile: altura fixa proporcional (ex: `h-[220px]`) com overflow hidden
- Layout principal: `flex flex-col md:flex-row`
- Sidebar: `w-full md:w-[380px]`, com `max-h-[60vh] md:max-h-none overflow-y-auto` no mobile
- Canvas wrapper: usar `useState` com `useEffect` para recalcular escala no resize

Resultado: no mobile o preview aparece compacto no topo e os controles rolam abaixo. No desktop, tudo continua igual.

