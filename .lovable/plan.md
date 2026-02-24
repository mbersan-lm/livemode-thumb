

# Ajustar tamanho e posicao das fotos nos quadrantes (Thumb Principal - Roda de Bobo)

## Resumo
Diminuir todas as 4 fotos dos quadrantes em 20% e deslocar horizontalmente: quadrantes 1 e 3 (esquerda) movem 20px para a esquerda, quadrantes 2 e 4 (direita) movem 20px para a direita.

## Alteracoes

### 1. Preview CSS — `src/components/cortes/CortesCanvas.tsx` (linhas 459-466)

Alterar o `height` de `240%` para `192%` (240 * 0.8 = 192) para reduzir 20%.

Adicionar offset horizontal por quadrante: quadrantes 0 e 2 (esquerda) recebem `left: -20px`, quadrantes 1 e 3 (direita) recebem `left: 20px`.

```text
// Antes:
left: 0,
top: 0,
height: '240%',
width: 'auto',
transform: `translate(${c.t.x}px, ${c.t.y}px) scale(${c.t.scale}) rotate(${c.t.rotation}deg)`,

// Depois:
const horizontalOffset = (i === 0 || i === 2) ? -20 : 20;
...
left: horizontalOffset,
top: 0,
height: '192%',
width: 'auto',
transform: `translate(${c.t.x}px, ${c.t.y}px) scale(${c.t.scale}) rotate(${c.t.rotation}deg)`,
```

### 2. Export Canvas — `src/components/cortes/CortesControls.tsx` (linhas 842-846)

Alterar o multiplicador de `2.4` para `1.92` (2.4 * 0.8) e adicionar offset horizontal proporcional ao canvas (20px no preview corresponde a 20 * (1280/canvasPreviewWidth) no export, mas como o canvas e 1280px e o preview renderiza a 50% de 1280 = 640px por quadrante, o offset de 20px no preview equivale a ~40px no canvas de 1280).

```text
// Antes:
const drawH = qH * 2.4;
const drawW = drawH * (c.img.naturalWidth / c.img.naturalHeight);
const dx = q.x + c.t.x;
const dy = q.y + c.t.y;

// Depois:
const drawH = qH * 1.92;
const drawW = drawH * (c.img.naturalWidth / c.img.naturalHeight);
const hOffset = (i === 0 || i === 2) ? -40 : 40;
const dx = q.x + c.t.x + hOffset;
const dy = q.y + c.t.y;
```

## Secao tecnica

- O fator de escala muda de 2.4x para 1.92x (reducao de 20%)
- O offset horizontal no export e 40px (dobro do preview) porque o canvas de export tem 1280px de largura enquanto cada quadrante no preview ocupa ~640px equivalente, porem como o preview usa CSS com 50% width, a proporcao e 1:2
- `transformOrigin: '0 0'` permanece inalterado, ancorando no canto superior esquerdo
- A visibilidade e transforms do usuario continuam funcionando normalmente

