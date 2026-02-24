
# Remover Placar do Modelo Ao Vivo

## O que sera feito

Remover os numeros do placar (score, "x", e small score) do modelo Ao Vivo, mantendo apenas os dois escudos dos times centralizados.

## Detalhes Tecnicos

**Arquivo:** `src/components/ThumbnailCanvasAoVivo.tsx`

Alteracoes no container `MATCH_ROW_AV` (linhas 238-266):

1. **Remover** toda a `div` central que contem:
   - O placar principal (homeScore, "x", awayScore)
   - O placar secundario (small score)

2. **Ajustar** as margens dos escudos:
   - Remover `-mr-[42px]` do escudo da esquerda
   - Remover `-ml-[42px]` do escudo da direita
   - O `gap-[34px]` do container ja garante o espacamento entre os dois escudos

O resultado sera apenas os dois escudos lado a lado, centralizados no canvas, sem nenhum numero ou texto entre eles.
