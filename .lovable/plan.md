
# Adicionar placar menor (entre parenteses) nas thumbs de Melhores Momentos

## O que sera feito

Adicionar um segundo placar menor, exibido entre parenteses, logo abaixo do placar principal em todas as thumbnails de "Melhores Momentos" (todos os templates). Tambem sera criado um switch on/off para controlar a visibilidade desse placar menor.

## Alteracoes

### 1. Tipo `MatchData` — `src/types/thumbnail.ts`

Adicionar campos para o placar menor:
- `homeScoreSmall: number` (default 0)
- `awayScoreSmall: number` (default 0)
- `showSmallScore: boolean` (default false)

### 2. Estado inicial — `src/pages/Index.tsx`

Atualizar o estado inicial de `matchData` com os novos campos:
- `homeScoreSmall: 0`
- `awayScoreSmall: 0`
- `showSmallScore: false`

### 3. Controles — `src/components/controls/TeamControls.tsx`

- Adicionar um componente `Switch` (on/off) com label "Placar menor" abaixo dos inputs de score existentes
- Quando ativado, exibir dois inputs numericos lado a lado para `homeScoreSmall` e `awayScoreSmall`
- Os inputs ficam ocultos quando o switch esta desligado

### 4. Canvas — `src/components/ThumbnailCanvas.tsx`

- Quando `matchData.showSmallScore` for `true`, renderizar abaixo do bloco de scores principal um texto centralizado no formato `(homeScoreSmall x awayScoreSmall)`
- O texto usara a mesma fontFamily do template, porem com tamanho reduzido (cerca de 50-60% do `scoreFontSize`)
- Cor branca, centralizado horizontalmente em relacao ao bloco de scores

### 5. Nenhuma alteracao no `ThumbnailCanvasJogoCompleto`

O canvas de "Jogo Completo" nao exibe placar, portanto nao precisa de alteracao.

## Detalhes tecnicos

- O `Switch` sera importado de `@/components/ui/switch` (ja existe no projeto)
- O placar menor sera renderizado como um `div` adicional posicionado logo abaixo do flex de scores, usando `flex-col` para empilhar os dois blocos
- O tamanho da fonte sera calculado a partir do `scoreFontSize` do template (ex: `140px` -> ~`70px` para o placar menor)
- O "x" do placar menor usara a mesma cor do "x" principal (`xColor`)
