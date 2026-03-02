

## Plano: Trocar fonte da Thumb Principal no Geral CazéTv para GeneralSans-Bold

### O que será feito

Adicionar a fonte **GeneralSans-Bold.otf** ao projeto e aplicá-la **exclusivamente** ao modelo "Thumb Principal" do programa "Geral CazéTv" (não afeta Roda de Bobo, outros modelos, nem outros programas).

### Etapas

1. **Copiar a fonte** `GeneralSans-Bold.otf` para `public/fonts/`

2. **Registrar a fonte** em `src/index.css` com `@font-face` para `General Sans`

3. **Adicionar prop `thumbPrincipalFontFamily`** ao `CortesThumbBuilder` — uma fonte opcional usada apenas quando o modelo ativo for `thumb-principal`

4. **Passar a prop no `CortesProgramBuilder`** apenas para o programa `Geral CazéTv`:
   - `thumbPrincipalFontFamily="'General Sans', sans-serif"`

5. **Aplicar a fonte condicional no canvas de preview** (`CortesCanvas.tsx`):
   - No Layer 5 (texto fora do quadrant grid), quando `thumbModel === 'thumb-principal'`, usar `thumbPrincipalFontFamily` em vez de `customFontFamily`

6. **Aplicar a fonte condicional no export** (`CortesControls.tsx`):
   - Na renderização do Layer 6 (texto), mesma lógica: se `showThumbPrincipal && !useQuadrantGrid`, usar a fonte alternativa

### Arquivos alterados

- `public/fonts/GeneralSans-Bold.otf` (novo)
- `src/index.css` — novo `@font-face`
- `src/components/cortes/CortesThumbBuilder.tsx` — nova prop + passagem
- `src/components/cortes/CortesCanvas.tsx` — uso condicional da fonte
- `src/components/cortes/CortesControls.tsx` — uso condicional da fonte no export
- `src/pages/CortesProgramBuilder.tsx` — passar `thumbPrincipalFontFamily` para Geral CazéTv

