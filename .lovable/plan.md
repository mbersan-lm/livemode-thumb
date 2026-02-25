

## Problema

Atualmente, o modelo "Thumb Principal" sempre usa o layout de quadrantes 2x2 (com escala de 211.2%, âncora em 0,0, offsets horizontais fixos) para todos os programas. Mas essa regra de quadrantes deveria ser exclusiva do **Roda de Bobo**. Para **Geral CazéTv** e **Geral CazéTv Brasil**, as fotos devem funcionar como anexos normais — cutouts livres, posicionáveis pelo usuário, sem confinamento em quadrantes.

## Solução

Adicionar uma prop `useQuadrantGrid` que controla se o layout de quadrantes é usado. Quando `false`, as 4 fotos são renderizadas como cutouts livres (posição absoluta, sem clip de quadrante, sem escala forçada de 211.2%).

### Mudanças em 4 arquivos:

---

### 1. `src/pages/CortesProgramBuilder.tsx`
Passar `useQuadrantGrid={program!.name === 'Roda de Bobo'}` ao `CortesThumbBuilder`.

---

### 2. `src/components/cortes/CortesThumbBuilder.tsx`
- Adicionar prop `useQuadrantGrid?: boolean` (default `false`).
- Repassar para `CortesCanvas` e `CortesControls`.

---

### 3. `src/components/cortes/CortesCanvas.tsx` (Preview)
- Adicionar prop `useQuadrantGrid?: boolean`.
- No bloco "Layer 3f: Thumb Principal":
  - Se `useQuadrantGrid === true` → manter layout atual (quadrantes 2x2, escala 211.2%, offsets, clip por quadrante).
  - Se `useQuadrantGrid === false` → renderizar cada cutout como imagem livre sobre o canvas inteiro (sem clip de quadrante), similar ao modelo "duas-pessoas" mas com até 4 fotos. Cada foto ocupa a altura total do canvas e é posicionável via transform.

Layout livre (sem quadrantes):
```text
┌──────────────────────────────┐
│  foto1   foto2   foto3  foto4│  ← cutouts livres, sem clipping
│  (zIndex 3-6, posição livre) │
└──────────────────────────────┘
```

---

### 4. `src/components/cortes/CortesControls.tsx`
- Adicionar prop `useQuadrantGrid?: boolean`.
- **UI dos controles**: Quando `useQuadrantGrid === false`, mostrar uploads simples de "Foto 1", "Foto 2", etc. (sem a UI de "Quadrantes" com presets e toggles de visibilidade).
- **Export nativo**: No bloco de exportação da Thumb Principal, aplicar a mesma lógica: se `useQuadrantGrid === false`, renderizar cutouts livres (sem clip de quadrante, sem escala 211.2%, sem offsets fixos).

---

### Comportamento esperado após a mudança:

| Programa | Thumb Principal | Layout |
|---|---|---|
| Roda de Bobo | Quadrantes 2x2, escala 211.2%, offsets, presets | Mantido como está |
| Geral CazéTv | Fotos livres, posicionáveis | Cutouts normais |
| Geral CazéTv Brasil | Fotos livres, posicionáveis | Cutouts normais |

