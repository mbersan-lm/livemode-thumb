

# Fix: Texto Cortado e Truncado no Builder de Cortes

## Causa Raiz

O loop de auto-ajuste comeca em `2500px` de font-size para um container de apenas ~274px de altura (38% de 720px). Isso causa:

1. **Texto truncado**: Em tamanhos extremos (2500px), o navegador nao consegue renderizar todos os caracteres visivelmente, fazendo o texto "parar no meio"
2. **Centenas de iteracoes**: O loop precisa rodar ~238 vezes (2500 -> 120, step 10) causando reflows massivos
3. **scrollHeight impreciso**: Em font-sizes absurdos, a medicao de `scrollHeight` pode ser imprecisa

## Solucao

### Arquivo: `src/components/cortes/CortesCanvas.tsx`

**1. Iniciar o font-size em um valor razoavel:**
- Mudar o tamanho inicial de `2500px` para `200px` (a caixa tem ~274px de altura, entao 200px e um maximo razoavel para uma linha)
- Mudar o estado inicial de `useState(2500)` para `useState(200)`

**2. Usar step menor para precisao:**
- Reduzir o step de `10px` para `2px` para ajuste mais fino
- Isso resulta em no maximo ~40 iteracoes (200 -> 120) em vez de ~238

**3. Garantir que o texto nunca e truncado:**
- Adicionar `wordBreak: 'break-word'` no estilo para evitar que palavras muito longas saiam da caixa horizontalmente
- Manter `overflow: 'hidden'` apenas como seguranca, mas o loop deve garantir que o texto cabe antes

### Mudancas especificas:

```text
Linha 26: useState(2500) -> useState(200)
Linha 31: setFontSize(500) -> setFontSize(200)
Linha 35: let size = 2500 -> let size = 200
Linha 40: size -= 10 -> size -= 2
Linha 39: size > 120 -> size > 20 (minimo menor para textos muito longos)
Estilo: adicionar wordBreak: 'break-word'
```

Isso resolve ambos os problemas: o texto sempre aparece completo (100% do conteudo) e o font-size e reduzido automaticamente ate caber na caixa sem cortes.
