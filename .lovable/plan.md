
# Ajuste do offset de zoom do PIP: 0.5 para 0.05

## Mudanca

### Arquivo: `src/components/cortes/CortesThumbBuilder.tsx` (linha 57)

Trocar `+ 0.5` por `+ 0.05` no calculo do `autoScale`:

```
// DE:
) + 0.5;

// PARA:
) + 0.05;
```

Apenas essa linha muda. O resto da logica (pipBaseScale, reset, etc.) continua funcionando igual.
