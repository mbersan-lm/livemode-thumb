

# Paineis glass em formato vertical ("em pe")

## O que muda
Os dois paineis glass serao alterados de formato paisagem (600x356) para formato retrato/vertical, mais altos do que largos, conforme a referencia.

## Detalhes tecnicos

### `src/components/ThumbnailCanvasAoVivo.tsx`

Atualizar as dimensoes e posicionamento dos dois paineis:

**Painel esquerdo:**
- `left: '235px'`
- `top: '160px'`
- `width: '300px'`
- `height: '520px'`

**Painel direito:**
- `left: '745px'`
- `top: '160px'`
- `width: '300px'`
- `height: '520px'`

Isso coloca os paineis verticais, centralizados no canvas, com espaco entre eles para o placar e escudos.

