

## Plano: Novo modelo "PIP meio + 2 pessoas"

### O que será feito

Criar um novo modelo de thumbnail chamado **"PIP meio + 2 pessoas"** (`pip-meio-2pessoas`), onde o PIP fica centralizado na tela e há dois slots de fotos (pessoa esquerda e pessoa direita) nos lados. Disponível em **todos os programas**.

### Layout do modelo

```text
┌──────────────────────────────────┐
│  Pessoa     ┌─────┐     Pessoa  │
│  Esquerda   │ PIP │    Direita  │
│  (cutout)   │(centro)│  (cutout) │
│             └─────┘             │
│         [TEXTO DA THUMB]        │
│              [LOGOS]            │
└──────────────────────────────────┘
```

- PIP centralizado com moldura colorida e rotação -1.2°
- Pessoa esquerda: cutout posicionado à esquerda (usa `personCutout` + `personTransform`)
- Pessoa direita: cutout posicionado à direita (usa `person2Cutout` + `person2Transform`)
- Texto e logos: idênticos ao modelo PIP padrão

### Alterações por arquivo

1. **`CortesThumbBuilder.tsx`** — Adicionar `'pip-meio-2pessoas'` ao type `ThumbModel`

2. **`CortesCanvas.tsx`** — Adicionar renderização do novo modelo:
   - PIP centralizado (pipFrame padrão ajustado para centro, ~37% x, ~15% y, ~26% width, ~64% height)
   - Pessoa esquerda (personCutout) posicionada à esquerda
   - Pessoa direita (person2Cutout) posicionada à direita
   - Texto e gradiente padrão

3. **`CortesControls.tsx`** — Duas alterações:
   - Adicionar `<SelectItem value="pip-meio-2pessoas">PIP meio + 2 pessoas</SelectItem>` disponível para **todos os programas** (fora dos blocos condicionais)
   - Controles UI: mostrar upload PIP + controles de 2 pessoas (esquerda/direita) + texto
   - Export: replicar a lógica de renderização do canvas para o novo modelo

### Arquivos alterados

- `src/components/cortes/CortesThumbBuilder.tsx` — type union + defaults de pipFrame para este modelo
- `src/components/cortes/CortesCanvas.tsx` — preview do novo layout
- `src/components/cortes/CortesControls.tsx` — seletor de modelo + controles + export

