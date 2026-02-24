

# Corrigir distorção das fotos no preview do Thumb Principal

## Problema
A correção anterior alterou os offsets horizontais das fotos no preview de `-20px`/`40px` para `-40px`/`80px`, tentando igualar aos valores do export. Porém, o preview já estava funcionando corretamente com os valores originais. O export continua correto com seus próprios valores.

## Alteração

### `src/components/cortes/CortesCanvas.tsx` (linha 461)

Reverter os offsets do preview para os valores originais:

```text
// Antes (atual - distorcido):
left: (i === 0 || i === 2) ? -40 : 80,

// Depois (corrigido):
left: (i === 0 || i === 2) ? -20 : 40,
```

## Detalhes
- O export em `CortesControls.tsx` permanece inalterado com `-40`/`80` (funcionando corretamente)
- Apenas o preview em `CortesCanvas.tsx` é revertido para `-20`/`40`
- Nenhuma outra alteração necessária
