

## Problema

O modelo "Thumb Principal" usa um bloco de texto reduzido (380×200px, centralizado, sem rotação) para **todos** os programas. Essa regra deveria ser exclusiva do **Roda de Bobo**. Para **Geral CazéTv** e **Geral CazéTv Brasil**, o texto deve funcionar como nos outros modelos (largura 96%, maxHeight 38%, rotação -2°, tamanho normal).

## Solução

Condicionar o bloco de texto da Thumb Principal ao `useQuadrantGrid`. Quando `useQuadrantGrid === false`, usar o bloco de texto padrão (Layer 5) em vez do bloco reduzido (Layer 5tp).

### Mudanças em 2 arquivos:

---

### 1. `src/components/cortes/CortesCanvas.tsx`

**Layer 5 (linha 550):** Alterar a condição para incluir thumb-principal sem quadrantes:
```
{!showMeioAMeio && !showThumbPrincipal && thumbText && (
```
→
```
{!showMeioAMeio && !(showThumbPrincipal && useQuadrantGrid) && thumbText && (
```

**Layer 5tp (linha 585):** Restringir ao quadrant grid:
```
{showThumbPrincipal && thumbText && (
```
→
```
{showThumbPrincipal && useQuadrantGrid && thumbText && (
```

---

### 2. `src/components/cortes/CortesControls.tsx` (Export nativo)

**Linha 903:** Alterar condição do texto padrão:
```
if (!showMeioAMeio && !showThumbPrincipal && props.thumbText) {
```
→
```
if (!showMeioAMeio && !(showThumbPrincipal && useQuadrantGrid) && props.thumbText) {
```

**Linha 918:** Restringir texto reduzido ao quadrant grid:
```
if (showThumbPrincipal && props.thumbText) {
```
→
```
if (showThumbPrincipal && useQuadrantGrid && props.thumbText) {
```

---

### Resultado:

| Programa | Thumb Principal — Texto |
|---|---|
| Roda de Bobo | Reduzido (380×200, centralizado, sem rotação) — mantido |
| Geral CazéTv | Normal (96% largura, 38% altura, rotação -2°) |
| Geral CazéTv Brasil | Normal (96% largura, 38% altura, rotação -2°) |

Nenhum outro modelo ou programa é afetado.

