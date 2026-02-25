

## Problema

A função `drawGlassPanel` no export nativo (linhas 207-216 de `AoVivo.tsx`) apenas preenche com cor semi-transparente e desenha a borda. O efeito `backdropFilter: 'blur(20px)'` do CSS não tem equivalente direto no Canvas API, então o desfoque glass não aparece na thumb exportada.

## Solução

Simular o efeito de glassmorphism no canvas nativo capturando o conteúdo atual do canvas, aplicando blur via `ctx.filter`, e redesenhando apenas na área recortada de cada painel.

### Mudança em `src/pages/AoVivo.tsx`

Reescrever a função `drawGlassPanel` (linhas 207-220) para:

1. Salvar o estado atual do canvas em um canvas temporário
2. Para cada painel: recortar (clip) a área arredondada, desenhar o canvas temporário com `ctx.filter = 'blur(20px)'`, preencher com a cor semi-transparente, e traçar a borda

```typescript
// 8. Glass panels (z:16) — semi-transparent with blur + border
// Capture current canvas for blur simulation
const tempCanvas = document.createElement('canvas');
tempCanvas.width = W;
tempCanvas.height = H;
const tempCtx = tempCanvas.getContext('2d')!;
tempCtx.drawImage(canvas, 0, 0);

const drawGlassPanel = (x: number, y: number, w: number, h: number, color: string) => {
  ctx.save();
  roundRect(ctx, x, y, w, h, 12);
  ctx.clip();
  // Draw blurred background within clipped area
  ctx.filter = 'blur(20px)';
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.filter = 'none';
  // Semi-transparent fill
  ctx.fillStyle = color + '33';
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  // Border (drawn outside clip)
  ctx.save();
  roundRect(ctx, x, y, w, h, 12);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
};
```

O resto do código permanece inalterado. Isso garante que os três painéis glass (esquerdo, direito e inferior preto) terão o efeito de desfoque na exportação, igualando o preview.

