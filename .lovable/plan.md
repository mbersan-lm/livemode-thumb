

# Reposicionar paineis glass conforme referencia

## O que muda
Os dois paineis glass serao reposicionados para ficarem na metade inferior do canvas, lado a lado com um gap entre eles, conforme a imagem de referencia.

## Estimativa de posicao (canvas 1280x720)

Pela referencia, os retangulos comecam aproximadamente no centro vertical e vao ate proximo ao fundo, com largura moderada e gap entre eles.

```text
Canvas 1280x720:

       245px              555px
        |                   |
  270px +------280------+   +------280------+
        |               |   |               |
        |   Painel L    |   |   Painel R    |
        |               |   |               |
        |               |   |               |
  680px +---------------+   +---------------+
```

## Detalhe tecnico

### `src/components/ThumbnailCanvasAoVivo.tsx`

Atualizar o posicionamento e dimensoes dos dois paineis glass:

**Painel esquerdo:**
- `left: '245px'`
- `top: '270px'`
- `width: '280px'`
- `height: '410px'`

**Painel direito:**
- `left: '555px'`
- `top: '270px'`
- `width: '280px'`
- `height: '410px'`

Os paineis ficam verticais (mais altos que largos), posicionados na metade inferior do canvas com um gap de ~30px entre eles.

