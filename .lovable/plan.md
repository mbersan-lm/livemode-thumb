

# Destaque Parcial de Texto em Cor Diferente

## Abordagem

O usuario quer selecionar uma parte do texto para ficar em vermelho (#D02046) enquanto o resto permanece bege (#F1E8D5). A forma mais simples e pratica: usar um marcador de sintaxe no proprio textarea. O usuario envolve a parte desejada com asteriscos (ex: `*GOL DECISIVO*`) e o sistema renderiza essa parte em vermelho.

## Mudancas

### 1. CortesControls.tsx -- Instrucao no campo de texto
- Adicionar uma dica abaixo do textarea explicando: "Use *asteriscos* para destacar em vermelho"

### 2. CortesCanvas.tsx -- Renderizacao com cores
- Criar uma funcao `renderColoredText(text)` que faz parse do texto buscando trechos entre `*...*`
- Trechos normais: renderizados em `<span>` com cor `#F1E8D5`
- Trechos entre asteriscos: renderizados em `<span style={{ color: '#D02046' }}>` (sem os asteriscos)
- O `textShadow` (stroke) continua sendo herdado do container pai, entao o tracado permanece identico
- Substituir `{thumbText}` por `{renderColoredText(thumbText)}`

### 3. Auto-fit -- Sem mudancas
- O loop de auto-ajuste de font-size continua funcionando normalmente, pois os `<span>` internos nao afetam `scrollHeight` vs `clientHeight`

## Detalhes tecnicos

Funcao de parse:

```text
function renderColoredText(text: string):
  split text by regex /(\*[^*]+\*)/g
  for each part:
    if starts and ends with *:
      return <span style={{ color: '#D02046' }}>{part without asterisks}</span>
    else:
      return part as-is
```

Exemplo de uso:
- Input: `NEYMAR FAZ *GOL DECISIVO* NA FINAL`
- Resultado: "NEYMAR FAZ " em bege, "GOL DECISIVO" em vermelho, " NA FINAL" em bege

### Arquivos modificados:
- `src/components/cortes/CortesCanvas.tsx` -- adicionar funcao de parse e renderizacao colorida
- `src/components/cortes/CortesControls.tsx` -- adicionar dica visual abaixo do textarea

