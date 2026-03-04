

## Plano: Simplificar botão de exportação

### Alteração

**`src/components/controls/ExportControls.tsx`**
- Remover os dois botões separados ("Exportar Melhores Momentos" e "Exportar Jogo Completo")
- Substituir por um único botão "Exportar" que detecta automaticamente o canvas ativo (`activeCanvas`) e exporta o tipo correto
- Adicionar prop `activeCanvas` ao componente
- Atualizar `src/pages/Index.tsx` para passar `activeCanvas` ao `ExportControls`

