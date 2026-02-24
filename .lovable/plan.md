
# Centralizar Escudos e Placar no Modelo Ao Vivo

## O que sera feito

Mover os escudos dos times e o placar para o centro do canvas (entre os dois paineis glass) e coloca-los no primeiro plano, acima de todos os elementos.

## Detalhes Tecnicos

**Arquivo:** `src/components/ThumbnailCanvasAoVivo.tsx`

Alteracoes no container `MATCH_ROW_AV` (linha 228):

1. **Posicionamento central:**
   - Remover `left-[22px] top-[360px]`
   - Usar `left-1/2 top-1/2` com `transform: translate(-50%, -50%)` para centralizar no canvas
   - Adicionar `justify-center` para alinhar os elementos internamente

2. **Primeiro plano:**
   - Alterar `zIndex` de `25` para `50`, garantindo que fique acima de todos os outros elementos (overlay em zIndex 17, panels em 16, KV em 10)

O resultado sera os escudos e placar centralizados horizontalmente e verticalmente no canvas, visualmente posicionados entre os dois paineis glass e acima de todas as camadas.
