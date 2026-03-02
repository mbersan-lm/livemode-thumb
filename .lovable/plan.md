

## Plano: Restaurar suporte a quebra de linha (Enter) no texto

### Diagnóstico

O texto renderiza `\n` como texto corrido porque:
1. **Preview** (`CortesCanvas.tsx` linha 660): o split só procura `*highlights*`, ignora `\n`. Falta `whiteSpace: 'pre-wrap'` no estilo do container.
2. **Export** (`CortesControls.tsx` linha 102-103): `wrapText` faz `text.split(' ')` sem considerar `\n`.

### Correções

1. **`CortesCanvas.tsx`** — Adicionar `whiteSpace: 'pre-wrap'` ao estilo do container de texto nos Layers 5 e 5tp (linhas ~634 e ~671). Isso faz o browser respeitar `\n` automaticamente, sem precisar mudar a lógica de split/highlight.

2. **`CortesControls.tsx`** — Na função `wrapText` (linha 102), primeiro dividir por `\n` para criar linhas forçadas, depois aplicar word-wrap dentro de cada segmento:
   ```
   function wrapText(ctx, text, maxWidth) {
     const paragraphs = text.split('\n');
     const lines = [];
     for (const para of paragraphs) {
       // word-wrap dentro de cada parágrafo
       ...
     }
     return lines;
   }
   ```

### Arquivos alterados
- `src/components/cortes/CortesCanvas.tsx` — `whiteSpace: 'pre-wrap'` nos containers de texto
- `src/components/cortes/CortesControls.tsx` — `wrapText` respeitar `\n`

