

# Fixar template "Europa League" no modelo Ao Vivo

## O que sera feito

Quando o modelo "Ao Vivo" estiver ativo, o seletor de templates sera ocultado e o canvas usara sempre o template "Europa League" automaticamente. Ao trocar para outro modelo (MM ou JC), o seletor de templates volta a aparecer normalmente.

## Detalhes Tecnicos

**Arquivos modificados:**

1. **`src/pages/Index.tsx`**:
   - Na passagem de props para `ThumbnailCanvasAoVivo`, forcar `template="europaleague"` em vez de usar `state.template`
   - Esconder a aba "Template" do `TabsList` quando `activeCanvas === 'av'` (ajustar grid-cols de 3 para 2 no modo Ao Vivo sem foto, mantendo apenas "Times" e "Exportar")

2. **`src/components/ThumbnailCanvasAoVivo.tsx`**:
   - Nenhuma alteracao necessaria, pois ja recebe `template` como prop e o valor sera fixado no Index

