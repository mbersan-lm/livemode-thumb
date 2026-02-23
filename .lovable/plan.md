

# Adicionar Switch on/off nas caixas de ajuste de imagem

## Problema

Atualmente, quando uma imagem e adicionada ao PIP ou a qualquer slot de foto, a caixa "Ajuste da imagem" abre automaticamente e fica sempre visivel. O usuario quer que essas caixas comecem fechadas e tenham um botao Switch (on/off) para controlar a visibilidade.

## Solucao

### Arquivo: `src/components/cortes/CortesControls.tsx`

1. **Adicionar estados de visibilidade** — criar estados `useState<boolean>(false)` para cada caixa de ajuste:
   - `showPipAdjust` — ajuste imagem PIP (modelo pip)
   - `showPipLeftAdjust` — ajuste foto esquerda (modelo pip-dividido)
   - `showPipRightAdjust` — ajuste foto direita (modelo pip-dividido)
   - `showPersonAdjust` — ajuste da pessoa
   - `showPerson2Adjust` — ajuste da pessoa 2
   - `showPerson3Adjust` — ajuste da pessoa 3
   - `showPipDuploLeftAdjust` — ajuste PIP esquerdo (jogo-pip-duplo)
   - `showPipDuploRightAdjust` — ajuste PIP direito (jogo-pip-duplo)
   - E os equivalentes para o modelo jogo-v1

2. **Substituir a renderizacao condicional** — em cada bloco de ajuste (ex: `{pipImage && (<div>...Ajuste da imagem PIP...</div>)}`), trocar para `{pipImage && (<div>...header com Switch...{showPipAdjust && sliders}...</div>)}`:
   - O container `<div>` com borda continua aparecendo quando ha imagem
   - O header com o label "Ajuste da imagem PIP" e o botao Reset continua visivel
   - Adicionar um componente `Switch` ao lado do label/reset
   - Os sliders (X, Y, Zoom, Rotacao) so aparecem quando o Switch esta "on"

3. **Layout do header** — cada caixa de ajuste tera:
   - Label do ajuste (esquerda)
   - Switch on/off (centro-direita)
   - Botao Reset (direita)

4. **Import do Switch** — adicionar import do componente `Switch` de `@/components/ui/switch`

## Resultado

Ao fazer upload de uma imagem, aparece a caixa de ajuste com o titulo e um Switch "off". O usuario clica no Switch para ver os sliders e clica novamente para esconde-los. Isso aplica-se a todas as caixas de ajuste em todos os modelos.
