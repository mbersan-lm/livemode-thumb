

# Correcao do Texto: Overflow e Stroke Arredondado

## Problemas

1. **Texto saindo da thumb**: O `overflow: visible` (adicionado para acentos) permite que o texto ultrapasse os limites do canvas. Alem disso, o loop de auto-ajuste nao funciona corretamente com `overflow: visible` porque o `scrollHeight` nao reflete o overflow real.

2. **Stroke pontiagudo**: As propriedades CSS `strokeLinejoin` e `strokeLinecap` nao funcionam em texto HTML com `-webkit-text-stroke`. Essas propriedades so se aplicam a elementos SVG. Para obter um stroke arredondado em texto HTML, e necessario usar a tecnica de **text-shadow multiplo**.

## Solucao

### Arquivo: `src/components/cortes/CortesCanvas.tsx`

**1. Conter o texto dentro da thumb:**
- Manter `overflow: hidden` no texto para que ele nao saia dos limites
- Aumentar o `maxHeight` para `38%` (valor equilibrado entre espaco para acentos e contencao)
- Aumentar `lineHeight` para `1.2` para garantir espaco para acentos sem precisar de overflow visible
- Aumentar `paddingTop` para `20px` para acomodar acentos dentro da caixa
- Garantir que o loop de auto-ajuste funcione corretamente com essas dimensoes

**2. Stroke arredondado com text-shadow:**
- Remover `WebkitTextStroke`, `strokeLinejoin`, `strokeLinecap` e `paintOrder`
- Substituir por uma funcao que gera multiplas sombras em circulo (24-32 pontos) ao redor do texto, criando um contorno naturalmente arredondado
- Exemplo: gerar sombras em angulos de 0 a 360 graus com raio de 15px na cor `#0C0C20`, resultando em um stroke suave e arredondado
- A tecnica usa algo como: `text-shadow: 15px 0 #0C0C20, 14.5px 3.8px #0C0C20, 13px 7.5px #0C0C20, ...` (pontos ao longo de um circulo)

## Detalhes Tecnicos

Funcao auxiliar para gerar o text-shadow circular:

```text
function generateStrokeShadow(radius, color, steps):
  for i = 0 to steps:
    angle = (2 * PI * i) / steps
    x = cos(angle) * radius
    y = sin(angle) * radius
    shadows.push(`${x}px ${y}px 0 ${color}`)
  return shadows.join(', ')
```

Isso gera ~32 sombras posicionadas em circulo, criando um contorno uniforme e arredondado sem cantos pontiagudos.

### Propriedades do texto atualizadas:
- `overflow`: `visible` -> `hidden`
- `maxHeight`: `42%` -> `38%`
- `lineHeight`: `1.15` -> `1.2`
- `paddingTop`: `10px` -> `20px`
- Remover: `WebkitTextStroke`, `paintOrder`, `strokeLinejoin`, `strokeLinecap`
- Adicionar: `textShadow` com sombras circulares (raio ~15px, 32 pontos, cor `#0C0C20`)

