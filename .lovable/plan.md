

# Atualizar dimensoes dos paineis glass para 529x607

## O que muda
Os dois paineis glass no modelo "Ao Vivo" terao suas dimensoes atualizadas para **529px de largura** e **607px de altura**, mantendo a posicao centralizada no canvas.

## Detalhe tecnico

### `src/components/ThumbnailCanvasAoVivo.tsx`

Com paineis de 529px de largura, o espaco total ocupado seria 529 + 30 (gap) + 529 = 1088px. Para centralizar no canvas de 1280px: margem lateral = (1280 - 1088) / 2 = 96px.

**Painel esquerdo:**
- `left: '96px'`
- `top: '100px'`
- `width: '529px'`
- `height: '607px'`

**Painel direito:**
- `left: '655px'` (96 + 529 + 30)
- `top: '100px'`
- `width: '529px'`
- `height: '607px'`

O topo foi ajustado para ~100px para que os paineis de 607px caibam verticalmente no canvas de 720px (100 + 607 = 707px, com 13px de margem inferior).

