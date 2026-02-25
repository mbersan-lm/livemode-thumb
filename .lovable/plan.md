

## Problema

No modelo "Thumb Principal" do Roda de Bobo, o espaço abaixo do texto dentro do círculo central (circulado em verde na imagem de referência) está vazio. O usuário quer adicionar a possibilidade de colocar 2 escudos de times lado a lado nesse espaço, sem "x" entre eles. Os times disponíveis devem vir do Brasileirão e do Paulistão.

## Solução

Adicionar seletores de 2 times e renderizar os escudos no preview e no export, exclusivamente quando `useQuadrantGrid === true` (Roda de Bobo) e `thumbModel === 'thumb-principal'`.

### Mudanças em 4 arquivos:

---

### 1. `src/components/cortes/CortesThumbBuilder.tsx`
- Adicionar estados: `tpHomeTeamId` e `tpAwayTeamId` (string | null, default null).
- Passar esses valores para `CortesCanvas` e `CortesControls`.
- Adicionar callbacks `onTpHomeTeamChange` e `onTpAwayTeamChange`.
- Limpar os valores no `handleClear`.

---

### 2. `src/components/cortes/CortesCanvas.tsx`
- Adicionar props: `tpHomeTeamId?: string | null`, `tpAwayTeamId?: string | null`.
- Importar `teamsBrasileirao` e `teamsPaulistao`.
- No bloco "Layer 5tp" (dentro do círculo, após o texto, quando `showThumbPrincipal && useQuadrantGrid`): renderizar os 2 escudos lado a lado, centralizados horizontalmente, posicionados logo abaixo do texto. Cada escudo terá ~60px de altura, com ~10px de gap entre eles, sem "x".

Layout dentro do círculo:
```text
┌─────────────────┐
│   [LOGO RDB]    │
│  VASCOAAAAAA    │
│  AAAAAAAAA      │
│  [esc1] [esc2]  │  ← escudos aqui
└─────────────────┘
```

---

### 3. `src/components/cortes/CortesControls.tsx`
- Adicionar props: `tpHomeTeamId`, `tpAwayTeamId`, `onTpHomeTeamChange`, `onTpAwayTeamChange`.
- Dentro do bloco do thumb-principal com quadrant grid (`thumbModel === 'thumb-principal' && useQuadrantGrid`), adicionar uma seção "Escudos" com 2 `<Select>` (Time 1 e Time 2), listando times do Brasileirão + Paulistão combinados e ordenados alfabeticamente.
- **Export nativo**: Após desenhar o texto reduzido da thumb-principal, desenhar os 2 escudos no canvas. Carregar as imagens dos crests via `loadImage()` e posicioná-los centralizados abaixo do texto, com as mesmas proporções do preview.

---

### 4. Nenhum arquivo de dados precisa ser alterado.
Os dados de `teamsBrasileirao` e `teamsPaulistao` já existem e serão combinados.

---

### Detalhes técnicos

**Preview (CortesCanvas):**
- Posição: `bottom: 2%`, centralizado (`left: 50%`, `transform: translateX(-50%)`), `zIndex: 7`
- Cada escudo: `height: 60px`, `width: auto`
- Gap entre escudos: `12px`
- Flex container horizontal

**Export (CortesControls):**
- Mesma posição proporcional no canvas 1280×720
- Escudos desenhados com `ctx.drawImage()` mantendo aspect ratio
- Posição Y: logo abaixo do bloco de texto (textY + textH + 8px de margem)

**Seletores de times:**
- Combinação de `teamsBrasileirao` + `teamsPaulistao`, ordenados por nome
- Sem duplicatas (times como Corinthians, Palmeiras etc. aparecem nas duas listas com slugs diferentes — ambos aparecem, diferenciados pelo nome)
- Placeholder: "Selecionar time"

### Resultado:

| Programa | Escudos na Thumb Principal |
|---|---|
| Roda de Bobo | 2 escudos lado a lado no círculo central |
| Geral CazéTv | Sem escudos (não afetado) |
| Geral CazéTv Brasil | Sem escudos (não afetado) |

