

# Reduzir fotos dos quadrantes em 20% mantendo proporcao

## Problema
As imagens dos quadrantes da Thumb Principal (Roda de Bobo) estao muito grandes apos o aumento de 3x.

## Correcao

### Arquivo: `src/components/cortes/CortesCanvas.tsx`

Na linha 463, mudar `height: '300%'` para `height: '240%'` (reducao de 20%).

A propriedade `width: 'auto'` ja esta correta e garante que a proporcao original da imagem seja mantida. Se a distorcao que o usuario viu foi causada por outro motivo (cache ou estado anterior), essa configuracao resolve.

## Resultado
Fotos 20% menores, sem distorcao, mantendo a proporcao original.

