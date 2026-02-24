

# Substituir overlay por dois paineis glass com cor configuravel

## O que muda
A imagem fixa `overlay-ao-vivo.png` sera substituida por dois paineis retangulares renderizados via CSS, com:
- Cor configuravel independente (esquerdo e direito)
- Efeito de desfoque (backdrop-filter: blur) estilo glassmorphism
- Borda branca de 1px
- Cantos arredondados (como na referencia)

## Detalhes tecnicos

### 1. `src/pages/Index.tsx`
- Adicionar dois novos estados: `panelLeftColor` (default `'#c0c0c0'`) e `panelRightColor` (default `'#c0c0c0'`)
- Passar como props para `ThumbnailCanvasAoVivo` e `AoVivoGradientControls`

### 2. `src/components/controls/AoVivoGradientControls.tsx`
- Adicionar props para `panelLeftColor`, `panelRightColor` e seus callbacks
- Adicionar dois color pickers com label "Painel Esquerdo" e "Painel Direito" (mesmo estilo dos gradientes)

### 3. `src/components/ThumbnailCanvasAoVivo.tsx`
- Remover a tag `<img>` do overlay-ao-vivo.png
- Adicionar duas `<div>` posicionadas lado a lado na metade inferior do canvas (baseado na referencia)
- Cada div tera:
  - `backgroundColor` com opacidade (rgba) usando a cor escolhida
  - `backdropFilter: 'blur(20px)'` para efeito glass
  - `border: '1px solid white'`
  - `borderRadius: '12px'`
  - `zIndex: 16` (acima dos gradientes, abaixo do match info)
- Posicionamento aproximado baseado na imagem de referencia: dois blocos centralizados, lado a lado, ocupando a metade inferior do canvas

### Camadas (atualizado)
- Foto do jogador: zIndex 0
- KV Ao Vivo: zIndex 10
- Gradiente esquerdo: zIndex 15 (overlay)
- Gradiente direito: zIndex 15 (overlay)
- Painel glass esquerdo: zIndex 16
- Painel glass direito: zIndex 16
- Escudos e placar: zIndex 20

