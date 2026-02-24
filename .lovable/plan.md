

# Limitar texto ao meio inferior da thumbnail -- Todos os modelos

## Problema
O texto da thumbnail pode subir acima do meio vertical (360px de 720px total). O usuario quer que essa regra se aplique a **todos os modelos** que possuem caixa de texto, nao apenas ao Thumb Principal.

## Modelos afetados
- Corte com PIP
- Lettering simples (so-lettering)
- Duas pessoas
- Jogo v1 / 3 fotos + PIP duplo
- Thumb Principal (Roda de Bobo)
- Meio a meio (textos esquerdo e direito)

## O que sera feito

### Arquivo 1: `src/components/cortes/CortesCanvas.tsx` (preview)

Adicionar `top: '50%'` em todos os blocos de texto:

1. **Layer 5 (texto unico)** -- linha ~522: adicionar `top: '50%'` ao estilo do div. Isso impede o texto de ultrapassar o meio, pois o CSS respeita tanto `top` quanto `bottom` simultaneamente, limitando a area disponivel.

2. **Layer 5tp (thumb-principal)** -- linha ~557: adicionar `top: '50%'` ao estilo.

3. **Layer 5b (meio-a-meio esquerdo)** -- linha ~597: adicionar `top: '50%'`.

4. **Layer 5c (meio-a-meio direito)** -- linha ~632: adicionar `top: '50%'`.

Em todos os casos, remover o `maxHeight` fixo, pois o `top: 50%` + `bottom: X%` ja define a altura maxima automaticamente.

### Arquivo 2: `src/components/cortes/CortesControls.tsx` (export)

No `handleExport`, clampar o `areaY` para nunca ser menor que `H / 2` (360px) em todos os blocos de texto:

1. **Texto unico** (linha ~875): `areaY = Math.max(H / 2, H - H * bottomFrac - areaH)`
2. **Thumb Principal** (linha ~891): `textY = Math.max(H / 2, H - H * bottomFrac - textH)`
3. **Meio a meio esquerdo** (linha ~905): `areaY = Math.max(H / 2, H - H * bottomFrac - areaH)`
4. **Meio a meio direito** (linha ~918): `areaY = Math.max(H / 2, H - H * bottomFrac - areaH)`

Alem disso, recalcular a altura disponivel quando o clamp for ativado: se `areaY` foi clampado para `H/2`, a altura real passa a ser `H - H * bottomFrac - H/2` (espaco entre o meio e o bottom).

## Resultado
Em todos os modelos com texto, o conteudo ficara sempre na metade inferior da thumbnail, independentemente do slider de Posicao Y ou do tamanho do texto.
