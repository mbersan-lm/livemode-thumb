

# Fix: Texto Cortado na Thumb "Cortes"

## Problema
O texto esta sendo cortado por dois motivos:
1. O `text-shadow` de 15px de raio extrapola os limites do elemento, mas `overflow: hidden` corta tudo que sai da caixa
2. O loop de auto-ajuste compara `scrollHeight` vs `clientHeight`, mas nao contabiliza o espaco extra necessario para o stroke (text-shadow) nem para o padding

## Solucao

### Arquivo: `src/components/cortes/CortesCanvas.tsx`

**1. Adicionar padding em todos os lados para acomodar o stroke:**
- Trocar `paddingTop: '20px'` por `padding: '20px'` em todos os lados (o shadow de 15px precisa de pelo menos 15px de folga em cada direcao)
- Isso garante que o stroke nao seja cortado pelo `overflow: hidden`

**2. Corrigir o loop de auto-ajuste:**
- O loop atual compara `scrollHeight > clientHeight`, mas o `padding` ja faz parte do `clientHeight`. O problema e que o conteudo de texto pode ultrapassar o espaco disponivel
- Adicionar uma margem de seguranca na comparacao: o texto deve caber considerando o padding
- Reduzir o step de 10px para algo mais fino quando o tamanho ja esta pequeno, para evitar reducoes excessivas

**3. Ajustar a area do texto:**
- Usar `boxSizing: 'border-box'` para que o padding seja incluido nas dimensoes do elemento
- Manter `overflow: hidden` no container do texto
- O canvas pai ja tem `overflow: hidden`, entao o texto nunca sai da thumbnail

### Mudancas especificas no estilo do Layer 5 (texto):
- `paddingTop: '20px'` mudara para `padding: '20px'` (todos os lados)
- Adicionar `boxSizing: 'border-box'`
- Manter `overflow: hidden` e `maxHeight: '38%'`

### Mudancas no useEffect de auto-ajuste:
- Manter a logica atual (scrollHeight > clientHeight), que ja funciona corretamente com padding + border-box
- Isso garante que o texto sempre caiba 100% dentro da caixa visivel, incluindo espaco para o stroke

