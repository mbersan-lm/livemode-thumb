
# Substituir emoji por imagem de abelha real

## Mudancas

### 1. Salvar a imagem
- Copiar `user-uploads://image-19.png` para `public/images/bee.png`

### 2. Atualizar `src/components/FlyingBees.tsx`
- Substituir o emoji `🐝` por uma tag `<img>` usando `/images/bee.png`
- Adicionar propriedade `flipped` (booleano) a cada abelha no array de configuracao
- Quando `flipped: true`, aplicar `transform: scaleX(-1)` na imagem para espelhar horizontalmente
- Alternar `flipped` entre as abelhas para criar variedade visual
- Usar `width` e `height` baseados no `size` ja existente em cada abelha

### 3. Detalhes tecnicos
- A propriedade `flipped` sera alternada: abelhas nos indices pares ficam normais, impares ficam espelhadas (ou vice-versa)
- O `fontSize` atual sera convertido para `width` da imagem (ex: `28px` -> `width: 28px`)
- A imagem tera `pointer-events: none` e `user-select: none` para nao interferir na interacao
