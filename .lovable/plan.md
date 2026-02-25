

## Plano: Reduzir distância entre escudos na Thumb Principal do Roda de Bobo

Baseado na imagem de referência, os escudos ainda estão muito separados. Vou reduzir o gap de `-38px` para `-58px` (20px a mais de sobreposição).

### Alterações (2 arquivos):

**1. `src/components/cortes/CortesCanvas.tsx`** (linha 643)
- `gap: -38` → `gap: -58`

**2. `src/components/cortes/CortesControls.tsx`** (linha 951)
- `const gap = -38` → `const gap = -58`

Isso aumenta a sobreposição entre os escudos em 20px adicionais, tanto no preview quanto no export JPG.

