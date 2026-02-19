
# Fix: Texto Subido e Sem Traçado no Export

## Diagnóstico dos Dois Problemas

### Problema 1: Texto Subido (posicionamento errado)

No CSS do preview (`CortesCanvas.tsx`), o div de texto tem:
```css
bottom: 6%
maxHeight: 38%
overflow: hidden
```

O CSS posiciona pelo **bottom** — o texto fica sempre colado na parte inferior da área, crescendo para cima conforme necessário. O `overflow: hidden` corta o que passar do topo.

Na função `drawAutoFitText` (CortesControls.tsx, linha 172):
```typescript
const centerY = areaY + areaH / 2;
// lineY = -totalH / 2 + fontSize * 0.8
```

O código **centraliza verticalmente** o bloco de texto dentro da área. Isso está errado: se o texto tem 1 linha, ele fica no meio da área de 38% de altura — visualmente acima de onde o CSS o colocaria (colado no fundo).

**Correção:** Ancorar o texto pelo **bottom** da área, não pelo centro. O bloco de texto deve começar em `areaY + areaH - padding - totalH` (canto inferior).

```typescript
// ANTES (centralizado — errado):
let lineY = -totalH / 2 + fontSize * 0.8;

// DEPOIS (ancorado no bottom — correto):
// Sem ctx.translate ao centro, posicionar diretamente
const startY = areaY + areaH - paddingPx - (totalH - fontSize * 0.8);
```

### Problema 2: Sem Traçado (shadowBlur ≠ text-shadow circular)

O preview usa 32 `text-shadow`s circulares de 15px radius, criando um stroke denso e arredondado:
```typescript
// Preview: generateStrokeShadow(15, strokeColor, 32)
// → 32 text-shadows dispostos em círculo a 15px de distância
```

O export usa `ctx.shadowBlur = strokeRadius` que é um blur gaussiano difuso — completamente diferente visualmente.

**Correção:** Replicar o stroke circular desenhando o texto 32 vezes em posições circulares de 15px antes de desenhar o texto final:

```typescript
// Stroke circular idêntico ao preview
const steps = 32;
const radius = 15;
ctx.fillStyle = strokeColor;
for (let i = 0; i < steps; i++) {
  const angle = (2 * Math.PI * i) / steps;
  const ox = Math.cos(angle) * radius;
  const oy = Math.sin(angle) * radius;
  ctx.fillText(seg.text, segX + ox, lineY + oy);
}
// Texto principal por cima
ctx.fillStyle = seg.highlight ? highlightColor : textColor;
ctx.fillText(seg.text, segX, lineY);
```

## Arquivo a Modificar

**`src/components/cortes/CortesControls.tsx`** — apenas a função `drawAutoFitText` (linhas 144-217).

### Mudanças na função `drawAutoFitText`:

1. **Remover o `ctx.translate` ao centro** — posicionar diretamente pelas coordenadas absolutas
2. **Ancorar pelo bottom** — `startY = areaY + areaH - paddingPx - totalH + fontSize * 0.8`  
3. **Substituir `shadowBlur`** por loop de 32 draws circulares com `strokeColor`

### Lógica final do posicionamento:

```text
areaY ─────────────────────────── top da área (y=403px para single text)
         [espaço vazio para 1 linha curta]
         [texto linha 1]
         [texto linha 2]
areaY + areaH - padding ────────── bottom da área (y=657px, bottom 6%)
```

O texto ocupa do fundo para cima, exatamente como o CSS com `bottom` faz.

## Resultado Esperado
- Texto ancorado na parte inferior, idêntico ao preview
- Stroke circular denso (32 passos, 15px) idêntico ao efeito de text-shadow do preview
- Zero alteração no layout do preview (CortesCanvas.tsx não muda)
