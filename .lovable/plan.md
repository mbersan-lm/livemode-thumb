

# Corrigir gradientes invisíveis no canvas Ao Vivo

## Problema
Os dois gradientes (esquerdo e direito) estao com `zIndex: 5`, mas a imagem KV de fundo esta com `zIndex: 10`. O KV cobre totalmente os gradientes, tornando-os invisíveis.

## Correcao

### Arquivo: `src/components/ThumbnailCanvasAoVivo.tsx`

Alterar o `zIndex` dos dois gradientes de `5` para `15`, colocando-os acima do KV (zIndex 10) mas abaixo do Match Info (zIndex 20).

Camadas finais:
- Foto do jogador: zIndex 0
- KV Ao Vivo: zIndex 10
- Gradiente esquerdo: zIndex 15
- Gradiente direito: zIndex 15
- Escudos e placar: zIndex 20

## Resultado
Os gradientes ficam visíveis sobre o KV, e os escudos/placar continuam por cima de tudo.

