
# Posicionar Escudos Dentro dos Paineis Glass

## O que sera feito

Cada escudo sera posicionado individualmente no centro do seu respectivo painel glass, em vez de ficarem juntos no centro do canvas.

## Detalhes Tecnicos

**Arquivo:** `src/components/ThumbnailCanvasAoVivo.tsx`

Os paineis glass possuem estas coordenadas:
- **Painel esquerdo:** left 291px, top 319px, 334x437px (centro: 458px, 537px)
- **Painel direito:** left 655px, top 319px, 334x437px (centro: 822px, 537px)

Alteracoes no container `MATCH_ROW_AV` (linhas 224-244):

1. **Separar os escudos** em dois elementos independentes, cada um posicionado no centro do seu painel glass
2. **Escudo home:** posicao absoluta centralizada no painel esquerdo (left: 458px, top: 537px, transform translate -50% -50%)
3. **Escudo away:** posicao absoluta centralizada no painel direito (left: 822px, top: 537px, transform translate -50% -50%)
4. **zIndex 50** mantido para ambos, acima de todos os elementos
5. **Tamanho maximo** dos escudos ajustado para caber dentro dos paineis (max 250px)
