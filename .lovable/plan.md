

# Ajustes no Texto da Thumbnail de Cortes

## Problemas Identificados

1. **Traçado (stroke) com cantos pontiagudos** - O `WebkitTextStroke` usa `lineJoin: miter` por padrão, criando pontas afiadas nas letras.
2. **Texto responsivo** - O sistema de auto-ajuste ja existe (loop que reduz de 2500px ate 120px), mas o `lineHeight: 0.95` muito apertado e o `overflow: hidden` podem estar impedindo o correto funcionamento.
3. **Acentos cortados** - O `lineHeight: 0.95` comprime demais verticalmente e o `overflow: hidden` corta os acentos que ultrapassam a caixa do texto. A area precisa de mais espaco superior (padding-top) para acomodar acentos.

## Solucao

### Arquivo: `src/components/cortes/CortesCanvas.tsx`

**1. Stroke arredondado:**
- Adicionar `lineJoin: 'round'` e `strokeLinecap: 'round'` via propriedades CSS (`strokeLinejoin`, `strokeLinecap`)
- Alternativa mais robusta: usar a tecnica de text-shadow com multiplas sombras para simular um stroke arredondado, porem isso pode impactar a exportacao. A abordagem mais simples e adicionar `WebkitTextStrokeWidth` + `paintOrder: stroke fill` que ja esta em uso, combinado com SVG-like properties.
- A solucao mais eficaz para arredondar o stroke via CSS puro e aplicar `-webkit-text-stroke` junto com `paint-order: stroke fill` e adicionar `stroke-linejoin: round` e `stroke-linecap: round` como propriedades CSS no elemento.

**2. Texto responsivo (ja funciona, ajuste fino):**
- O loop de auto-ajuste ja existe e funciona. Nenhuma mudanca necessaria na logica, apenas nos parametros de layout para dar mais espaco ao texto.

**3. Acentos cortados:**
- Aumentar `lineHeight` de `0.95` para `1.15` para dar espaco vertical suficiente para acentos
- Aumentar `maxHeight` de `35%` para `42%` para compensar o aumento do lineHeight
- Adicionar `paddingTop: '10px'` para dar respiro extra no topo onde os acentos ficam
- Remover `overflow: hidden` e usar `overflow: visible` para que acentos nao sejam cortados (o canvas pai ja tem `overflow: hidden` para conter tudo)

### Resumo das alteracoes no Layer 5 (texto):

- `lineHeight`: `0.95` → `1.15`
- `maxHeight`: `35%` → `42%`
- `overflow`: `hidden` → `visible`
- Adicionar: `paddingTop: '10px'`
- Adicionar: `strokeLinejoin: 'round'` e `strokeLinecap: 'round'` (propriedades CSS para arredondar o stroke)
- Ajustar o loop de auto-ajuste para considerar o novo lineHeight (o `scrollHeight` sera naturalmente maior, entao o loop continuara funcionando corretamente)

