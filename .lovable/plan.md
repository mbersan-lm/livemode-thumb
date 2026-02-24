

# Corrigir exportacao das fotos nos quadrantes da Thumb Principal

## Problema
As fotos dos quadrantes na exportacao estao aparecendo muito "zoomed in" (apenas texturas de fundo visiveis, pessoas quase invisiveis). O multiplicador `2.4x` faz a imagem ficar grande demais no Canvas, mostrando apenas uma pequena porcao central.

## Causa raiz
As fotos dos presets sao imagens pre-compostas (ja com fundo + pessoa posicionada) que devem preencher o quadrante por completo. O CSS `height: 240%` funciona no preview porque o browser renderiza a imagem mantendo a proporcao com `width: auto`, mas no Canvas API o calculo `drawH = qH * 2.4` com `drawW = drawH * aspect` gera dimensoes excessivas.

## Correcao

### Arquivo: `src/components/cortes/CortesControls.tsx` (linhas ~842-850)

Substituir o calculo atual por logica de **object-fit: cover** que preenche completamente o quadrante, mantendo a proporcao da imagem:

```text
// Antes (incorreto):
const drawH = qH * 2.4;
const drawW = drawH * aspect;

// Depois (object-fit cover):
const imgAspect = c.img.naturalWidth / c.img.naturalHeight;
const qAspect = qW / qH;
let drawW, drawH;
if (imgAspect > qAspect) {
  // Imagem mais larga que o quadrante: ajustar pela altura
  drawH = qH;
  drawW = qH * imgAspect;
} else {
  // Imagem mais alta que o quadrante: ajustar pela largura
  drawW = qW;
  drawH = qW / imgAspect;
}
```

### Tambem atualizar o CSS do preview: `src/components/cortes/CortesCanvas.tsx` (linhas ~460-464)

Trocar `height: 240%` e `width: auto` por logica equivalente de object-fit cover:

```text
// Antes:
height: '240%',
width: 'auto',

// Depois:
width: '100%',
height: '100%',
objectFit: 'cover' as const,
```

## Resultado esperado
As fotos dos presets preencherao completamente o quadrante tanto no preview quanto na exportacao, mostrando a pessoa posicionada exatamente como na imagem original fornecida ("certo.png"), funcionando como uma "logo atras da logo".

