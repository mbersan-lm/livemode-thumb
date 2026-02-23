

# Corrigir renderizacao de highlights (*cores*) no export

## Problema

Quando o texto e exportado, as palavras marcadas com `*` para highlight (ex: `*NEYMAR*`) estao aparecendo com o caractere `*` literal na imagem exportada, ao inves de renderizar com a cor de destaque como no preview.

## Causa raiz

A funcao `mapCleanLinesToOriginal` reconstroi as linhas com os marcadores `*`, mas quando uma quebra de linha acontece no meio de um trecho destacado, os marcadores ficam "orfaos" -- por exemplo, uma linha termina com `*PALAVRA` e a proxima comeca com `RESTO*`. A funcao `parseHighlight` espera o padrao completo `*texto*` numa unica linha e, ao nao encontra-lo, trata os `*` como texto normal, exibindo-os literalmente.

## Solucao

### Arquivo: `src/components/cortes/CortesControls.tsx`

**1. Corrigir `mapCleanLinesToOriginal`** para garantir que cada linha tenha marcadores `*` completos (pares fechados):

- Quando um highlight comeca numa linha mas nao fecha (termina sem `*` de fechamento), adicionar `*` no final da linha e abrir `*` no inicio da proxima linha
- Isso garante que cada linha individual contenha apenas padroes `*texto*` completos

**2. Alternativa mais robusta** -- mudar a estrategia de renderizacao:

Em vez de depender de `mapCleanLinesToOriginal` + `parseHighlight` por linha, processar o texto original inteiro em segmentos (highlight e normal) antes do wrap, e fazer o wrap consciente dos segmentos. Cada linha sera uma lista de segmentos ja classificados (highlight ou nao), eliminando a necessidade de re-parsear.

A abordagem escolhida sera a opcao 1 (corrigir `mapCleanLinesToOriginal`) por ser menos invasiva:

- Rastrear se estamos dentro de um highlight (`*` aberto) ao percorrer o texto original
- Ao finalizar uma linha que esta dentro de um highlight, fechar com `*` e abrir `*` na proxima linha
- Resultado: toda linha tera pares `*...*` completos, e `parseHighlight` funcionara corretamente

## Detalhes tecnicos

A funcao `mapCleanLinesToOriginal` sera atualizada para:

1. Manter um flag `insideHighlight` que rastreia se um `*` de abertura foi encontrado sem seu par de fechamento
2. Ao terminar de mapear uma linha, se `insideHighlight === true`, adicionar `*` ao final da linha mapeada
3. Ao iniciar a proxima linha, se `insideHighlight === true`, prefixar com `*`
4. Isso garante que `parseHighlight` receba linhas com padroes completos `*texto*`

Nenhum outro arquivo precisa ser alterado.

