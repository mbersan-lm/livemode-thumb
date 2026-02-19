
# Corrigir Export: PIP Esticado e Texto Cortado

## Diagnóstico Definitivo dos Dois Problemas

### Problema 1: PIP Esticado
A `<img>` do PIP usa `objectFit: 'contain'` junto com `width: 100%` e `height: 100%`. O `html2canvas` **não implementa `object-fit`** — ele simplesmente estica a imagem para preencher os 100% do container, ignorando o `contain`. Isso explica exatamente o comportamento: tudo mais funciona mas o PIP vem esticado.

### Problema 2: Texto Cortado
O `useEffect` de auto-fit dentro do `CortesCanvas` calcula `el.scrollHeight > el.clientHeight` em loop para reduzir o `fontSize`. Em um container com `visibility: hidden`, o browser pode retornar valores de layout incorretos (especialmente `scrollHeight`), fazendo o loop não rodar corretamente — resultando em fonte no tamanho máximo (200px), que fica cortada pelo `overflow: hidden`.

## Solução: Substituir html2canvas por Canvas API Nativo

Em vez de tentar capturar o DOM via `html2canvas` (que tem limitações conhecidas com `object-fit`, `transform`, `overflow: hidden` em contextos específicos), a solução é **compor o JPG diretamente via Canvas API nativa**, desenhando cada layer na ordem correta com as mesmas transformações do preview.

### Como funciona a composição:

```text
Canvas 1280x720
├── Layer 1: bgImage — drawImage(img, 0, 0, 1280, 720)
├── Layer 2: PIP frame + imagem PIP
│   ├── save() → clip() no retângulo da moldura
│   ├── Calcular posição real de "contain" com scale e translate do usuário
│   ├── drawImage(pipImg, calculadoX, calculadoY, calculadoW, calculadoH)
│   ├── restore() + borda colorida (strokeRect)
├── Layer 3: Pessoa (cutout) com transformações
│   ├── save() → translate/scale/rotate conforme personTransform
│   ├── drawImage(personImg, ...)
│   └── restore()
├── Layer 4: Gradiente inferior
├── Layer 5: logosImage — drawImage(img, 0, 0, 1280, 720)
├── Layer 6: Texto — fillText com font, cor, strokeShadow simulado via shadowBlur
│   ├── Calcular fontSize correto: medir texto via ctx.measureText
│   ├── Iterar reduzindo fonte até caber na área
│   └── Aplicar rotação e highlight via spans simulados
└── exportar via canvas.toBlob('image/jpeg', 0.95)
```

### Lógica do `objectFit: contain` no Canvas:

```typescript
function drawContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  containerX: number, containerY: number,
  containerW: number, containerH: number,
  userScale: number, userX: number, userY: number, userRotation: number
) {
  // Calcula dimensões "contain" reais
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const containerRatio = containerW / containerH;
  
  let drawW: number, drawH: number;
  if (imgRatio > containerRatio) {
    drawW = containerW;
    drawH = containerW / imgRatio;
  } else {
    drawH = containerH;
    drawW = containerH * imgRatio;
  }
  
  // Centro do container + transformações do usuário
  const cx = containerX + containerW / 2 + userX;
  const cy = containerY + containerH / 2 + userY;
  
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((userRotation * Math.PI) / 180);
  ctx.scale(userScale, userScale);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}
```

### Auto-fit de Texto no Canvas:

```typescript
function fitTextSize(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxH: number, startSize: number, fontFamily: string): number {
  let size = startSize;
  const lineHeight = 1.2;
  
  while (size > 20) {
    ctx.font = `800 ${size}px ${fontFamily}`;
    // Quebrar texto em linhas baseado em palavras
    const lines = wrapText(ctx, text.toUpperCase(), maxW);
    const totalH = lines.length * size * lineHeight;
    if (totalH <= maxH) break;
    size -= 2;
  }
  return size;
}
```

## Arquivos a Modificar

### `src/components/cortes/CortesControls.tsx`
- Substituir toda a função `handleExport` por uma nova baseada em Canvas API nativo
- Remover dependência do `html2canvas` para a exportação de cortes (manter o import apenas se usado em outro lugar)
- Adicionar funções auxiliares: `loadImage`, `drawContain`, `drawTextWithStroke`, `wrapText`, `drawPersonLayer`

### `src/components/cortes/CortesCanvas.tsx`
- Nenhuma mudança necessária — o canvas visual do preview continua igual

## Detalhes Técnicos da Implementação

### Estrutura da nova função handleExport:

```typescript
const handleExport = async () => {
  const toastId = toast.loading('Gerando JPG...');
  
  try {
    // 1. Pre-carregar todas as imagens
    const [bgImg, logosImg, pipImg, personImg, person2Img] = await Promise.all([
      loadImage(currentCanvasProps.bgImage || '/cortes/bg-corte.png'),
      loadImage(currentCanvasProps.logosImage || '/cortes/logos-corte.png'),
      currentCanvasProps.pipImage ? loadImage(currentCanvasProps.pipImage) : null,
      currentCanvasProps.personCutout ? loadImage(currentCanvasProps.personCutout) : null,
      currentCanvasProps.person2Cutout ? loadImage(currentCanvasProps.person2Cutout) : null,
    ]);

    // 2. Criar canvas 1280x720
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d')!;

    // 3. Desenhar cada layer...
    // (bg, pip frame + imagem, pessoa, gradiente, logos, texto)

    // 4. Export
    canvas.toBlob(blob => { /* download */ }, 'image/jpeg', 0.95);
  } catch (e) {
    toast.error('Falha ao exportar');
  }
};
```

### Tratamento do highlight (*asteriscos*):
O texto com `*palavra*` em cor diferente será renderizado desenhando cada segmento separadamente, calculando a posição X acumulada com `ctx.measureText`.

### Borda do PIP:
A borda colorida da moldura PIP é desenhada com `ctx.strokeRect` após o `clip()` + `drawImage`, replicando o `border: 10px solid` do CSS.

### Gradiente inferior:
Recriado com `ctx.createLinearGradient` e `addColorStop` idênticos ao CSS.

### Rotação do texto (-2deg):
Aplicada via `ctx.rotate(-2 * Math.PI / 180)` antes do `fillText`.

## Resultado Esperado
- PIP renderizado com as dimensões corretas de `objectFit: contain` + zoom/posição do usuário
- Texto auto-ajustado ao tamanho correto (medição via `ctx.measureText`, sem depender de `scrollHeight`)
- Fidelidade 100% ao preview
- Export mais rápido (sem DOM offscreen, sem timeouts de 1s)
