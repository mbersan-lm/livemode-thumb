

## Plano: Fixar PIP no centro para o modelo "PIP meio + 2 pessoas"

### O que será feito

Remover os controles de posição X e Y da moldura PIP no modelo `pip-meio-2pessoas`, forçando o PIP a ficar sempre centralizado horizontalmente e na posição Y fixa.

### Alterações

1. **`CortesControls.tsx`** (linhas ~1397-1414) — Remover os sliders de "Posição X" e "Posição Y" da seção "Moldura PIP" do bloco `pip-meio-2pessoas`. Manter apenas os controles avançados de largura e altura (colapsáveis). O botão de reset continua, fixando `x: 37, y: 15.4`.

2. **`CortesControls.tsx` + `CortesCanvas.tsx`** — Na renderização (preview e export), forçar `pipFrame.x` a ser calculado como `(100 - pipFrame.width) / 2` para centralização horizontal perfeita, e fixar `pipFrame.y` em `15.4` quando o modelo for `pip-meio-2pessoas`. Isso garante que mesmo que o estado tenha valores diferentes, o PIP sempre renderiza no centro.

### Arquivos alterados

- `src/components/cortes/CortesControls.tsx` — remover sliders X/Y da moldura PIP; forçar centralização no export
- `src/components/cortes/CortesCanvas.tsx` — forçar centralização no preview

