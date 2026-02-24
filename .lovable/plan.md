

# Adicionar Modo de Mesclagem (Blend Mode) nos Gradientes do Ao Vivo

## O que muda
Adicionar um seletor de **blend mode** (modo de mesclagem) para cada gradiente (esquerdo e direito) no painel de Configuracoes Avancadas do modelo Ao Vivo. Isso permite controlar como o gradiente interage visualmente com a foto/fundo.

## Opcoes de blend mode disponíveis
- Normal (padrao)
- Multiply
- Screen
- Overlay
- Darken
- Lighten
- Color Dodge
- Color Burn
- Hard Light
- Soft Light
- Difference
- Hue
- Saturation
- Color
- Luminosity

---

## Detalhes tecnicos

### 1. `src/pages/Index.tsx`
- Adicionar dois novos estados: `gradientLeftBlend` e `gradientRightBlend` (default: `'normal'`)
- Passar esses estados como props para `ThumbnailCanvasAoVivo` e `AoVivoGradientControls`

### 2. `src/components/controls/AoVivoGradientControls.tsx`
- Adicionar props `gradientLeftBlend`, `gradientRightBlend`, `onGradientLeftBlendChange`, `onGradientRightBlendChange`
- Abaixo de cada color picker, adicionar um `<Select>` com as opcoes de blend mode
- Label: "Modo de Mesclagem"

### 3. `src/components/ThumbnailCanvasAoVivo.tsx`
- Adicionar props `gradientLeftBlend` e `gradientRightBlend`
- Aplicar `mixBlendMode` no style de cada div de gradiente (esquerdo e direito)

### Fluxo de camadas (sem alteracao)
- Foto do jogador: zIndex 0
- KV Ao Vivo: zIndex 10
- Gradiente esquerdo: zIndex 15 + blend mode configuravel
- Gradiente direito: zIndex 15 + blend mode configuravel
- Escudos e placar: zIndex 20
