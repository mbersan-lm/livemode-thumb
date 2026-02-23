

# Adicionar controles de upload de imagem PIP ao modelo "Com PIP dividido"

## Problema

O modelo "Com PIP dividido" nao possui campos de upload para as duas imagens PIP. O bloco de controles do modelo `pip` so aparece quando `thumbModel === 'pip'`, e o bloco do `jogo-pip-duplo` so aparece quando `thumbModel === 'jogo-pip-duplo'`. O resultado e que ao selecionar "Com PIP dividido", nao ha como fazer upload das fotos do PIP.

## Solucao

### Arquivo: `src/components/cortes/CortesControls.tsx`

Adicionar um novo bloco de controles exclusivo para `thumbModel === 'pip-dividido'`, logo apos o bloco do modelo `pip` (apos linha 895). O bloco contera:

1. **Imagem PIP esquerda** — Upload usando `onPipUpload` + controles de ajuste (X, Y, Zoom) usando `pipTransform`/`onPipTransformChange`
2. **Imagem PIP direita** — Upload usando `onPip2Upload` + controles de ajuste (X, Y, Zoom) usando `pip2Transform`/`onPip2TransformChange`
3. **Moldura PIP** — Controles de posicao e tamanho da moldura unica (`pipFrame`/`onPipFrameChange`), identicos aos do modelo `pip` normal

Os labels serao "Imagem PIP esquerda" e "Imagem PIP direita" para deixar claro que sao as duas fotos dentro da moldura unica.

### Nenhum outro arquivo precisa ser alterado

O canvas (preview) e o export ja funcionam corretamente com o modelo pip-dividido — o problema era apenas a ausencia dos campos de upload na interface de controles.

