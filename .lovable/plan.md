
# Ajustar placar de penaltis conforme referencia

## O que muda

Na imagem de referencia, o formato do placar de penaltis e: **(3)  x  (3)** -- cada numero esta entre parenteses individualmente, com o "x" entre eles e um espacamento generoso. Atualmente, o codigo renderiza `( 3 x 3 )` com parenteses envolvendo tudo junto.

## Alteracoes

### `src/components/ThumbnailCanvas.tsx` (linhas 148-163)

Atualizar o bloco de renderizacao do placar menor para seguir o formato da referencia:

- Cada score fica entre parenteses: `(3)` e `(3)`
- O "x" fica entre os dois, com a mesma cor do "x" principal (`xColor`)
- Espacamento maior entre os elementos (gap maior)
- Manter o tamanho em ~50% do `scoreFontSize`
- Manter `marginTop: '-8px'` para ficar proximo ao placar principal

Formato final renderizado: `(3)  x  (3)`

## Detalhes tecnicos

A estrutura do JSX sera alterada de:
```
(  homeScore  x  awayScore  )
```

Para:
```
(homeScore)  x  (awayScore)
```

Cada grupo `(score)` sera um span unico, e o "x" central mantara a cor e fonte do template (`xColor`, `xFontFamily`). O gap sera aumentado para dar o espacamento visual similar a referencia.
