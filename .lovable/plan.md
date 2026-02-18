
# Fix: Auto-zoom do PIP usando dimensoes reais em pixels

## Problema

O calculo do auto-zoom usa os valores percentuais do frame diretamente como ratio:
- `containerRatio = 56.6 / 64.3 = 0.88` (ERRADO)

Mas os percentuais sao relativos a dimensoes diferentes (1280 x 720), entao o ratio real em pixels e:
- `(56.6% * 1280) / (64.3% * 720) = 724.48 / 462.96 = 1.565` (CORRETO)

Isso faz com que o zoom calculado seja muito menor do que o necessario para preencher o frame.

## Mudanca

### Arquivo: `src/components/cortes/CortesThumbBuilder.tsx`

Alterar o calculo do `containerRatio` na funcao `handlePipUpload` (linhas 49-54) para converter percentuais em pixels reais antes de calcular o ratio:

```
// DE:
const containerRatio = pipFrame.width / pipFrame.height;

// PARA:
const containerPixelW = (pipFrame.width / 100) * 1280;
const containerPixelH = (pipFrame.height / 100) * 720;
const containerRatio = containerPixelW / containerPixelH;
```

O resto da logica permanece identico. Isso garante que o ratio reflete as dimensoes reais do frame PIP em pixels, resultando num zoom que preenche corretamente o frame.
