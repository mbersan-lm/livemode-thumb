

# Corrigir discrepancia entre preview e export do lettering

## Problema raiz

As funcoes de export (`wrapText`, `fitFontSize`, `drawAutoFitText`) medem o texto bruto incluindo os marcadores `*` de highlight (ex: `*NEYMAR*`), mas esses caracteres sao removidos na hora de desenhar. Isso causa:

1. **Tamanho de fonte errado** -- `fitFontSize` calcula a largura das linhas com os `*` incluidos, achando que o texto e mais largo do que realmente e, resultando em fonte menor que no preview
2. **Quebras de linha em posicoes erradas** -- `wrapText` quebra linhas contando a largura dos `*`, gerando linhas mais curtas que o necessario
3. **Word-break** -- O preview usa `wordBreak: 'break-word'` (CSS), que permite quebrar palavras longas; o export so quebra em espacos

## Solucao

### Arquivo: `src/components/cortes/CortesControls.tsx`

**1. Criar funcao `stripHighlightMarkers`** para remover os `*` antes de medir:

```typescript
function stripHighlightMarkers(text: string): string {
  return text.replace(/\*/g, '');
}
```

**2. Corrigir `fitFontSize`** -- medir o texto sem os marcadores:

Trocar `wrapText(ctx, text.toUpperCase(), maxW)` por `wrapText(ctx, stripHighlightMarkers(text.toUpperCase()), maxW)`.

**3. Corrigir `wrapText` nas chamadas dentro de `drawAutoFitText`** -- usar texto limpo para calcular as quebras de linha, e depois re-aplicar os marcadores nos segmentos correspondentes.

A abordagem mais simples e robusta: dentro de `drawAutoFitText`, antes de fazer o wrap, remover os `*` do texto para calcular o layout (fontSize e quebras de linha), e depois ao desenhar cada linha, usar o texto original com marcadores para o `parseHighlight` funcionar corretamente. Isso requer:

- Calcular `fontSize` e `lines` usando texto limpo (sem `*`)
- Mapear cada linha limpa de volta ao texto original para manter os highlights
- Manter o restante do fluxo de desenho inalterado

**4. Melhorar `wrapText` com suporte a break-word** -- adicionar logica para quebrar palavras longas que excedam `maxWidth` sozinhas, replicando o comportamento CSS `word-break: break-word`.

## Detalhes tecnicos

A funcao `drawAutoFitText` sera atualizada para:

1. Criar versao limpa do texto: `cleanText = stripHighlightMarkers(text)`
2. Usar `cleanText` em `fitFontSize` e `wrapText` para layout
3. Reconstruir as linhas com os marcadores originais para preservar os highlights na renderizacao
4. Adicionar fallback de quebra por caractere em `wrapText` para palavras que sozinhas excedam a largura

Nenhum outro arquivo precisa ser alterado -- o preview (CortesCanvas) ja funciona corretamente.

