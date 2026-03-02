

## Plano: Suporte a quebra de linha (Enter) no texto da thumbnail

### O que será feito

Permitir que o Enter no campo "Texto da Thumbnail" crie uma quebra de linha real, refletida tanto no preview (canvas HTML) quanto no export (canvas 2D).

### Alterações

1. **`CortesCanvas.tsx`** — No render do texto (linhas ~586 e ~625), trocar o split simples por um que primeiro separe por `\n` e insira `<br/>` entre os blocos, mantendo o suporte a `*highlights*`.

2. **`CortesControls.tsx`** — Na função `wrapText` (linha 102), antes de dividir por espaços, primeiro dividir por `\n` e tratar cada segmento como uma linha forçada, aplicando word-wrap dentro de cada segmento.

### Arquivos alterados

- `src/components/cortes/CortesCanvas.tsx` — render do texto com suporte a `\n`
- `src/components/cortes/CortesControls.tsx` — `wrapText` respeitar `\n`

