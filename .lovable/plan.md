

## Corrigir Layout em Tablet e Mobile

### Problema 1 - Tablet: Thumb cortada nas laterais
A escala do canvas so muda para telas menores que 768px (mobile). Em tablets (768px-1024px), a escala fixa de 0.85 resulta em um canvas de ~1088px que transborda. A solucao e usar a escala dinamica para TODAS as telas, nao apenas mobile.

### Problema 2 - Mobile: Espaco preto excessivo
O container do preview usa `flex-1` que expande para preencher todo o espaco disponivel, criando barras pretas grandes. O ideal e que o container tenha apenas a altura necessaria para o canvas escalado, sem espaco extra, para que o usuario veja preview e controles simultaneamente.

### Alteracoes em `src/pages/Index.tsx`

1. **Escala dinamica universal**: Remover a condicao `isMobile` e usar `mobileScale` para todas as telas. A formula `Math.min((window.innerWidth - 32) / 1280, 0.85)` ja funciona corretamente para tablets e desktop (retorna 0.85 em telas grandes).

2. **Ajustar para descontar a sidebar no desktop**: No desktop/tablet com sidebar, descontar os 380px da sidebar: `Math.min((window.innerWidth - 380 - 32) / 1280, 0.85)` quando a tela e >= 768px.

3. **Container do preview sem flex-1 no mobile**: Remover `flex-1` do container do preview e usar altura fixa baseada na escala (`scaledHeight + 16` em vez de +32). Manter `flex-1` apenas no desktop para centralizar.

4. **Reduzir padding do container de controles no mobile**: Trocar `p-6` por `p-4` e `p-5` por `p-3` no mobile para economizar espaco vertical.

### Detalhes Tecnicos

Arquivo: `src/pages/Index.tsx`

- Linha 109-117: Atualizar `updateScale` para considerar a largura da sidebar em telas >= 768px
- Linha 119: Remover condicao `isMobile`, usar sempre a escala dinamica
- Linha 126: Trocar `flex-1` por logica condicional - no mobile, altura fixa; no desktop, `flex-1`
- Linha 127: Reduzir padding vertical (de +32 para +8)
- Linha 154: Adicionar classes responsivas para padding menor no mobile

