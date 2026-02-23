

# Corrigir deformacao da foto de fundo no export

## Problema

No preview, a imagem de fundo usa `object-fit: cover` (CSS), que redimensiona a imagem mantendo a proporcao e cortando o excesso. No export, o codigo usa `ctx.drawImage(bgImg, 0, 0, 1280, 720)`, que estica a imagem para preencher exatamente 1280x720px, deformando-a se a proporcao original for diferente.

## Solucao

### Arquivo: `src/components/cortes/CortesControls.tsx`

Substituir a linha:

```
ctx.drawImage(bgImg, 0, 0, W, H);
```

Por uma logica que replica o comportamento de `object-fit: cover`:

1. Calcular a proporcao da imagem original (`bgImg.naturalWidth / bgImg.naturalHeight`)
2. Calcular a proporcao do canvas (1280/720)
3. Se a imagem for mais larga proporcionalmente, ajustar pela altura e centralizar horizontalmente (cortando os lados)
4. Se a imagem for mais alta proporcionalmente, ajustar pela largura e centralizar verticalmente (cortando topo/base)

```typescript
// object-fit: cover
const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
const canvasRatio = W / H;
let sx = 0, sy = 0, sw = bgImg.naturalWidth, sh = bgImg.naturalHeight;
if (imgRatio > canvasRatio) {
  // imagem mais larga: cortar lados
  sw = bgImg.naturalHeight * canvasRatio;
  sx = (bgImg.naturalWidth - sw) / 2;
} else {
  // imagem mais alta: cortar topo/base
  sh = bgImg.naturalWidth / canvasRatio;
  sy = (bgImg.naturalHeight - sh) / 2;
}
ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, W, H);
```

Nenhum outro arquivo precisa ser alterado.

