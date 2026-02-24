

# Corrigir tamanho das fotos nos quadrantes na exportacao

## Problema
No preview (CSS), as fotos dos quadrantes sao renderizadas com `height: 240%` do quadrante, fazendo a imagem ocupar uma area grande e mostrar mais do corpo/rosto. Na exportacao (Canvas API), o codigo usa `drawH = qH` (100% do quadrante), resultando em uma foto muito menor e cortada diferente do preview.

## Correcao

### Arquivo: `src/components/cortes/CortesControls.tsx` (linhas 843-844)

Alterar o calculo de `drawH` de:
```
const drawH = qH;
const drawW = drawH * aspect;
```

Para:
```
const drawH = qH * 2.4;
const drawW = drawH * aspect;
```

Isso alinha o fator de escala da exportacao (240%) com o CSS do preview (`height: 240%`), garantindo paridade visual entre o que o usuario ve e o que e exportado.

## Resultado esperado
A foto exportada tera o mesmo enquadramento e tamanho que aparece no preview, mostrando mais do rosto/corpo como na imagem de referencia "certo.png".

