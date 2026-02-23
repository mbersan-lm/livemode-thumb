

# Corrigir modelo "Com PIP dividido" — UMA moldura com DUAS fotos dentro

## Problema atual

O modelo atual renderiza **duas molduras PIP separadas** (cada uma com sua borda). O correto e ter **uma unica moldura PIP** (como o modelo "Com PIP") e dentro dela encaixar **duas fotos lado a lado**.

## Mudancas

### 1. `src/components/cortes/CortesCanvas.tsx` (preview)

Substituir os dois blocos `showPipDividido` (linhas 167-210) por uma unica moldura PIP com duas imagens dentro:

- Uma unica `<div>` com borda, posicao e rotacao identicas ao PIP normal
- Dentro: dois containers lado a lado (cada um com 50% da largura), cada um com `overflow: hidden`
- Foto esquerda (`pipImage`) no container da esquerda com seus controles de transform
- Foto direita (`pip2Image`) no container da direita com seus controles de transform

### 2. `src/components/cortes/CortesControls.tsx` (export)

Substituir a logica de export do `showPipDividido` (linhas 466-513) que desenha dois frames separados por:

- Um unico clip retangular (moldura PIP)
- Dentro: desenhar a foto esquerda clippada na metade esquerda do frame
- Depois: desenhar a foto direita clippada na metade direita do frame
- Uma unica borda ao redor de todo o frame
- Adicionar uma linha divisoria vertical no centro (mesma cor da borda)

### 3. `src/components/cortes/CortesControls.tsx` (controles UI)

Atualizar os labels e remover os controles de "Moldura dos PIPs (proporcional)" que sincronizavam dois frames separados. Manter apenas:

- Upload foto esquerda + ajustes (X, Y, Zoom)
- Upload foto direita + ajustes (X, Y, Zoom)  
- Controles de moldura unica (posicao, tamanho) — reutilizar os mesmos controles de frame do PIP normal

### 4. `src/components/cortes/CortesThumbBuilder.tsx`

Remover `pip-dividido` da condicao de sincronizacao de frames (linha 365), ja que agora usa apenas `pipFrame` como moldura unica (nao precisa mais de `pip2Frame`).

## Resultado visual

- Uma unica moldura PIP com borda colorida e rotacao -1.2deg
- Dentro da moldura: duas fotos divididas ao meio por uma linha vertical
- Pessoa recortada no lado direito (igual ao modelo "Com PIP")
- Texto, gradiente, logos — identico ao "Com PIP"

