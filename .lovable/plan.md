

## Plano: Adicionar switch "PIP dividido" no modelo PIP meio + 2 pessoas

### O que será feito

Adicionar um toggle (Switch on/off) dentro dos controles do modelo `pip-meio-2pessoas` que, quando ativado, transforma o PIP central em um PIP dividido (duas fotos lado a lado com divisória vertical), reutilizando o `pip2Image` e `pip2Transform` já existentes.

### Alterações

1. **`CortesThumbBuilder.tsx`** — Adicionar estado `pipMeioDividido` (boolean, default false) e passá-lo como prop para `CortesCanvas` e `CortesControls`.

2. **`CortesCanvas.tsx`** — Nova prop `pipMeioDividido`. No bloco `showPipMeio2Pessoas`, quando `pipMeioDividido` é true, renderizar o PIP central com layout dividido (duas metades + divisória vertical, igual ao `pip-dividido`), usando `pipImage`/`pipTransform` na esquerda e `pip2Image`/`pip2Transform` na direita.

3. **`CortesControls.tsx`** — Três alterações:
   - Nova prop `pipMeioDividido` + `onPipMeioDivididoChange`.
   - No bloco de controles `pip-meio-2pessoas`, adicionar um Switch "PIP dividido" logo após o upload do PIP. Quando ativo, mostrar também o upload do "PIP direito" (pip2) com controles de transformação.
   - No export (Canvas 2D), quando `pip-meio-2pessoas` + `pipMeioDividido`, usar a lógica de renderização dividida (clip em duas metades + divisória) em vez do PIP simples.

### Arquivos alterados
- `src/components/cortes/CortesThumbBuilder.tsx`
- `src/components/cortes/CortesCanvas.tsx`
- `src/components/cortes/CortesControls.tsx`

