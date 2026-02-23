

# Reestilizacao da Interface (cores, fonte, textos)

## Escopo
Apenas a interface (controles, headers, cards, dialogs). **Nenhuma alteracao** no preview das thumbs, no canvas, no download, nem em modelos/logica.

## O que muda

### 1. Adicionar fonte Google Sans ao projeto
- Copiar os dois arquivos `.ttf` enviados para `public/fonts/`
  - `GoogleSans-VariableFont_GRAD_opsz_wght.ttf`
  - `GoogleSans-Italic-VariableFont_GRAD_opsz_wght.ttf`
- Registrar as `@font-face` no `src/index.css`

### 2. Atualizar variaveis de cor no `src/index.css`
Substituir as cores do design system (CSS variables) para usar a nova paleta:

| Token | Atual (HSL) | Novo (HSL) |
|---|---|---|
| `--background` | 240 10% 8% | 0 0% 0% (#000000) |
| `--foreground` | 0 0% 98% | 0 0% 100% (branco puro) |
| `--card` | 240 8% 12% | 0 0% 7% (preto levemente mais claro) |
| `--card-foreground` | 0 0% 98% | 0 0% 100% |
| `--muted` | 240 6% 18% | 0 0% 15% |
| `--muted-foreground` | 240 5% 64% | 0 1% 45% (~#585455 cinza) |
| `--border` | 240 6% 20% | 0 0% 18% |
| `--input` | 240 6% 20% | 0 0% 18% |
| `--primary` | 85 100% 60% | 101 61% 44% (#65B32E verde) |
| `--primary-foreground` | 240 10% 8% | 0 0% 100% |
| `--accent` | 85 100% 60% | 101 61% 44% |
| `--accent-foreground` | 240 10% 8% | 0 0% 100% |
| `--ring` | 85 100% 60% | 101 61% 44% |
| `--secondary` | 250 60% 50% | 0 1% 34% (cinza medio) |
| `--popover` | 240 8% 12% | 0 0% 7% |
| `--sidebar-*` | Ajustar na mesma logica (preto base, verde primary) |
| `--neon-green` | 85 100% 60% | 101 61% 44% |

Cores nao listadas que nao afetam a interface (destructive etc) permanecem.

### 3. Aplicar Google Sans como fonte padrao da interface
- Em `src/index.css`, no `@layer base`, adicionar `font-family: 'Google Sans', sans-serif` ao `body`
- Isso aplica a fonte em toda a UI automaticamente via Tailwind (`text-foreground` e heranca)
- As fontes do preview/canvas (Tusker Grotesk, Gilroy, Clash Grotesk, fontes customizadas dos programas) nao serao afetadas pois sao aplicadas diretamente via inline styles ou via `customFontFamily`

### 4. Cor de fundo da area do canvas
- No `CortesThumbBuilder.tsx` e `Index.tsx`, a area do canvas usa `bg-[hsl(240_10%_6%)]` -- atualizar para `bg-black` para manter consistencia com a nova paleta

## Arquivos alterados
- `src/index.css` -- font-face + variaveis de cor + body font-family
- `src/components/cortes/CortesThumbBuilder.tsx` -- bg da area do canvas (1 linha)
- `src/pages/Index.tsx` -- bg da area do canvas (1 linha)

## O que NAO muda
- `CortesCanvas.tsx`, `ThumbnailCanvas.tsx`, `ThumbnailCanvasJogoCompleto.tsx` -- nenhuma alteracao
- Logica de export/download -- nenhuma alteracao
- Modelos de thumb -- nenhuma alteracao
- Fontes do preview (Tusker, Gilroy, Clash Grotesk) -- nenhuma alteracao
- Dialogs de criar/editar programa -- herdam as novas cores automaticamente via CSS variables

