
# Mover placar de penaltis 15% para a esquerda

## Alteracao

Adicionar `transform: translateX(-15%)` ao container do placar de penaltis para deslocar 15% para a esquerda, mantendo tudo mais inalterado.

### `src/components/ThumbnailCanvas.tsx` (linha 149-156)

No `style` do div do placar de penaltis, adicionar `transform: 'translateX(-15%)'`.

Resultado: o bloco `(3) x (3)` sera deslocado 15% para a esquerda em relacao a sua posicao atual centralizada.
