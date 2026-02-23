
# Diminuir placar de penaltis em 30%

## Alteracao

Apenas o tamanho da fonte do placar de penaltis sera reduzido em 30%, sem mover o placar principal.

### `src/components/ThumbnailCanvas.tsx`

- Linha 153: Alterar o fator de `0.35` para `0.245` (reducao de 30%)
- Linha 159: Alterar o fator do "x" de `0.3` para `0.21` (reducao de 30%)

Nenhuma outra alteracao sera feita -- o placar principal permanece exatamente na mesma posicao e tamanho.
