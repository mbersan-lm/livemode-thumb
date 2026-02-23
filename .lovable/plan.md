

# Simplificar aba Photo — remover sub-tabs redundantes

## Problema

A aba "Photo" possui sub-tabs internas ("Melhores Momentos" / "Jogo Completo") que sao redundantes, pois ja existe o seletor "Thumbnail Ativa" acima das tabs que controla qual canvas esta visivel. O usuario quer apenas uma area de upload unica que mude automaticamente conforme a thumbnail ativa.

## Solucao

Usar o estado `activeCanvas` (ja existente no Index.tsx) para determinar qual conjunto de controles de foto mostrar, eliminando as sub-tabs internas.

## Arquivos modificados

### 1. `src/components/controls/PhotoControls.tsx`

- Adicionar prop `activeCanvas: 'mm' | 'jc'` a interface.
- Remover o componente `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` interno.
- Renderizar condicionalmente: se `activeCanvas === 'mm'`, mostra os controles de "Melhores Momentos" (upload, sliders X/Y/Zoom, AI Expand, Center, Reset). Se `activeCanvas === 'jc'`, mostra os controles de "Jogo Completo".
- O resultado e uma unica area de upload e ajustes, sem sub-tabs.

### 2. `src/pages/Index.tsx`

- Passar a prop `activeCanvas` para o componente `PhotoControls`.

## Resultado

Ao clicar na aba "Photo", o usuario vera diretamente o upload e os controles da thumbnail que esta ativa no momento, sem precisar alternar entre sub-tabs.

