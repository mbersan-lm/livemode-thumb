
# Esconder controles de placar no modo Ao Vivo

## O que sera feito

Quando o modelo "Ao Vivo" estiver ativo, os controles de **Placar Casa**, **Placar Visitante** e **Penaltis** (incluindo os campos de penaltis expandidos) serao ocultados. Apenas os seletores de time permanecerao visiveis.

## Detalhes Tecnicos

**Arquivo modificado:** `src/components/controls/TeamControls.tsx`

**Alteracao:**
- Envolver os blocos de placar (linhas 78-101), penaltis switch (linhas 104-111) e campos de penaltis expandidos (linhas 113-138) com a condicao `{activeCanvas !== 'av' && (...)}`, escondendo tudo quando o canvas ativo for "Ao Vivo".

Nenhum outro arquivo precisa ser alterado.
