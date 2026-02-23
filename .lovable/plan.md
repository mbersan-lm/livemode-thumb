
# Ajustar posicao do placar de penaltis

## Alteracao

O `marginTop` atual e `-14px`, o que deixa o placar de penaltis muito proximo (grudado) ao placar principal. A alteracao sera mudar de `-14px` para `4px`, criando um pequeno espacamento entre os dois placares sem afastar demais.

### `src/components/ThumbnailCanvas.tsx` (linha 155)

- Alterar `marginTop: '-14px'` para `marginTop: '4px'`

Isso adiciona 4px de espaco abaixo do placar principal, separando visualmente os dois sem distanciar demais.
