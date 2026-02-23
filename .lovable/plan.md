

# Corrigir Posicao Y do Texto no Modelo Thumb Principal

## Problema
O slider de "Posicao Y" do texto nao tem efeito no modelo **Thumb Principal** (Roda de Bobo). Isso acontece porque o texto esta posicionado com valores fixos (`top: 50%`, `transform: translate(-50%, 10%)`) em vez de usar a variavel `textBoxHeight` que o slider controla.

## Correcao

### Arquivo 1: `src/components/cortes/CortesCanvas.tsx` (preview)

Na secao "Layer 5tp" (linha ~554-590), o texto do thumb-principal sera ajustado para usar `textBoxHeight` no posicionamento vertical:

- Trocar `top: '50%'` e `transform: 'translate(-50%, 10%)'` por um posicionamento baseado em `bottom` + `textBoxHeight`, similar ao que os outros modelos ja fazem
- O texto continuara centralizado horizontalmente, mas a posicao vertical sera controlada pelo slider

### Arquivo 2: `src/components/cortes/CortesControls.tsx` (export)

Na secao "Thumb Principal -- text inside circle" (linha ~886-899), o calculo de `textY` sera atualizado para usar `bottomFrac` (derivado de `textBoxHeight`) em vez do valor fixo `H / 2 - 20`.

## Resultado
O slider de Posicao Y passara a mover o texto verticalmente no modelo Thumb Principal, tanto no preview quanto no JPG exportado.
