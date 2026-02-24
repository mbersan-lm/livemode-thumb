

# Novo modelo "AO VIVO" na aba Thumbnail Ativa

## Resumo

Adicionar uma terceira aba "AO VIVO" ao seletor de Thumbnail Ativa (ao lado de "Melhores Momentos" e "Jogo Completo") na pagina principal. O layout replica fielmente a imagem de referencia enviada.

## Layout da thumbnail (1280x720)

```text
+------------------------------------------+
|                                          |
|           AO VIVO  (texto grande)        |
|                                          |
|   +----------------+ +----------------+ |
|   |                | |                |  |
|   |   Imagem 1     | |   Imagem 2     |  |
|   |   (upload)     | |   (upload)     |  |
|   |                | |                |  |
|   +----------------+ +----------------+ |
|                                          |
|  [logos-live-negativa.png]               |
+------------------------------------------+
```

- Fundo preto
- Texto "AO VIVO" centralizado no topo, branco, bold, fonte Tusker Grotesk (~160-180px)
- Dois paineis lado a lado com bordas arredondadas (16px), fundo semi-transparente (`rgba(255,255,255,0.08)`), borda sutil (`rgba(255,255,255,0.15)`)
- Cada painel recebe uma imagem via upload independente, com controles de X, Y e Zoom
- Logos usando `logos-live-negativa.png` no canto inferior

## Arquivos a criar

### `src/components/ThumbnailCanvasAoVivo.tsx`
- Componente `forwardRef` (1280x720) seguindo o padrao de `ThumbnailCanvas.tsx`
- Props: `image1`, `image2`, `image1Transform`, `image2Transform` (cada um com x, y, scale), `matchData`, `template`
- Camadas:
  1. Fundo preto
  2. Texto "AO VIVO" centralizado no topo (~y=80px), fonte Tusker Grotesk, 160px, branco, bold
  3. Dois paineis retangulares arredondados (~540x380px cada, gap de ~40px entre eles, centralizados verticalmente)
  4. Dentro de cada painel, a imagem com overflow hidden e transform do usuario
  5. Overlay com logos (`logos-live-negativa.png`) cobrindo o canvas inteiro (como nos outros modelos)
- Os escudos dos times selecionados (homeTeam/awayTeam) podem ser exibidos dentro dos paineis como fallback quando nao ha imagem

## Arquivos a modificar

### `src/components/controls/ViewControls.tsx`
- Expandir `ActiveCanvas` para `'mm' | 'jc' | 'av'`
- Mudar grid de 2 para 3 colunas
- Adicionar tab "AO VIVO" com value `'av'`

### `src/types/thumbnail.ts`
- Adicionar ao `ThumbnailState`:
  - `aoVivoImage1: string | null`
  - `aoVivoImage2: string | null`
  - `aoVivoTransform1: PhotoTransform`
  - `aoVivoTransform2: PhotoTransform`
  - `initialScaleAoVivo1: number`
  - `initialScaleAoVivo2: number`

### `src/pages/Index.tsx`
- Importar `ThumbnailCanvasAoVivo`
- Adicionar ref `canvasRefAoVivo`
- Adicionar estado para as duas imagens e transforms do AO VIVO no `ThumbnailState`
- Adicionar handlers de upload e transform para ambas as imagens
- No bloco de renderizacao do canvas, adicionar `activeCanvas === 'av'` renderizando `ThumbnailCanvasAoVivo`
- Passar `canvasRefAoVivo` para `ExportControls`

### `src/components/controls/PhotoControls.tsx`
- Quando `activeCanvas === 'av'`, exibir DUAS areas de upload ("Imagem 1" e "Imagem 2") com sliders independentes de X, Y e Zoom para cada uma
- Adicionar props para as duas imagens e transforms do AO VIVO

### `src/components/controls/ExportControls.tsx`
- Adicionar prop `canvasRefAoVivo`
- Adicionar botao "Exportar AO VIVO" que usa `html2canvas` no ref do canvas
- Nome do arquivo: `AO_VIVO_home_away.jpg`

## Detalhes visuais (fiel a referencia)

- Fundo: `#000000` (preto solido)
- Texto "AO VIVO": `color: #FFFFFF`, `font-family: 'Tusker Grotesk'`, `font-size: 160px`, `font-weight: 600`, `text-align: center`, posicao `top: 40px`
- Paineis: `width: 540px`, `height: 380px`, `border-radius: 16px`, `background: rgba(255,255,255,0.08)`, `border: 1px solid rgba(255,255,255,0.15)`, centralizados horizontalmente com gap de 40px entre eles, posicao vertical centralizada (~y: 200px)
- Imagens dentro dos paineis: `overflow: hidden`, `object-fit: cover`, com transforms do usuario
- Logos: `logos-live-negativa.png` como overlay full-canvas (posicao absoluta, inset 0, z-index alto)

