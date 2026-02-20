
# AI Expand — Preencher Apenas as Áreas Vazias do Canvas

## O Problema Atual

Atualmente, o botão "AI Expand" envia a **foto bruta** (como foi feita o upload) para o PhotoRoom. O PhotoRoom então tenta expandir a imagem inteira para 1280x720, sem saber onde ela está posicionada no canvas.

O resultado: a IA não tem contexto de posição — ela expande a foto de forma genérica, como se ela estivesse centralizada, sem respeitar o posicionamento que o usuário definiu com os sliders.

## O Que Vai Mudar

**Antes de enviar para o PhotoRoom**, o frontend vai:

1. Criar um canvas invisível de **1280x720 pixels** (fundo transparente)
2. Desenhar a foto do usuário nesse canvas **exatamente como ela aparece na tela** — com o mesmo X, Y, scale que o usuário ajustou nos sliders
3. Exportar esse canvas composto como base64 PNG (com transparência nas áreas vazias)
4. Enviar esse canvas composto ao PhotoRoom
5. O PhotoRoom detecta automaticamente onde a imagem está e **preenche apenas as áreas transparentes/vazias**

```text
Foto original do usuário (lado direito)
        ↓
Canvas 1280x720 invisível criado no browser
  → Foto desenhada com transform atual (x, y, scale)
  → Área esquerda = transparente
        ↓
Canvas composto enviado ao PhotoRoom
        ↓
PhotoRoom preenche APENAS a área transparente (lado esquerdo)
  → A foto original permanece intacta no lado direito
        ↓
Resultado 1280x720 retornado e aplicado ao canvas
  → Transform resetado para x:0, y:0, scale:1
```

## Arquivo que será modificado

### `src/components/controls/PhotoControls.tsx`

Adicionar a função `compositeImageOntoCanvas` que:
- Recebe `photo` (base64 da foto original), `transform` (x, y, scale, scaleX, scaleY)
- Cria um `OffscreenCanvas` de 1280x720 com fundo **transparente**
- Calcula a posição exata espelhando a lógica do CSS do `ThumbnailCanvas`:
  - `translate(-50%, -50%)` → posição base no centro do canvas (640, 360)
  - `+ transform.x` e `+ transform.y` → offset do usuário
  - `scale(transform.scale) * scaleX * scaleY` → zoom aplicado
- Desenha a imagem com `ctx.drawImage()` usando essas coordenadas
- Retorna o canvas como `data:image/png;base64,...` (com canal alpha, preservando transparência)

A função `handleAiExpand` existente é modificada apenas para chamar `compositeImageOntoCanvas` antes de invocar a edge function, trocando `photo` (foto bruta) pelo `compositeBase64` (canvas composto).

**A Edge Function não precisa de nenhuma mudança** — ela já recebe `image_base64` e já usa `referenceBox: 'originalImage'`, que instrui o PhotoRoom a detectar a imagem dentro do espaço e expandir só o que falta.

## Detalhes Técnicos da Composição

A lógica CSS atual do `ThumbnailCanvas.tsx` é:
```css
transform: translate(-50%, -50%) 
           translateX({x}px) translateY({y}px) 
           scale({scale}) scaleX({scaleX}) scaleY({scaleY})
position: left: 50%, top: 50%
```

Traduzindo para o canvas 2D:
```
centerX = 1280 / 2 = 640
centerY = 720 / 2 = 360

finalX = centerX + transform.x - (imgWidth * effectiveScale) / 2
finalY = centerY + transform.y - (imgHeight * effectiveScale) / 2

effectiveScale = transform.scale * transform.scaleX (largura)
effectiveScaleY = transform.scale * transform.scaleY (altura)

ctx.drawImage(img, finalX, finalY, imgWidth * effectiveScale, imgHeight * effectiveScaleY)
```

## O Que NÃO Muda
- Edge Function `photoroom-ai-expand` — sem alterações
- Lógica de reset do transform após o expand — continua resetando para `{x:0, y:0, scale:1}`
- UX e botões — sem alterações visuais
- Ambas as abas (Melhores Momentos e Jogo Completo) recebem a melhoria

