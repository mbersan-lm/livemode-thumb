
# Novo Modelo: Thumb Principal (4 fotos em linha + lettering)

## Resumo
Criar um novo modelo de thumbnail chamado "Thumb Principal" que exibe 4 pessoas recortadas (com remocao de fundo automatica) posicionadas em linha horizontal sobre o KV enviado, com lettering dinamico na parte inferior.

## Layout (1280x720)

```text
+----------------------------------------------+
|            KV de fundo (THUMB_GERAL.jpg)      |
|                                               |
|  [Foto1]  [Foto2]  [Foto3]  [Foto4]          |
|  ~25%     ~25%     ~25%     ~25%              |
|  (ancoradas no bottom do canvas)              |
|                                               |
|  ========= GRADIENTE INFERIOR =========       |
|  [Logos]                                      |
|       TEXTO AUTO-FIT (lettering)              |
+----------------------------------------------+
```

## Arquivos alterados

### 1. Novo asset: `public/cortes/bg-thumb-principal.jpg`
- Copiar a imagem enviada (`THUMB_GERAL.jpg`) para uso como fundo padrao deste modelo

### 2. `src/components/cortes/CortesThumbBuilder.tsx`
- Adicionar `'thumb-principal'` ao tipo `ThumbModel`
- Adicionar estado para `person4Cutout`, `person4Transform`, `isRemovingBg4`
- Adicionar handler `handlePerson4Upload` (com remocao de fundo via PhotoRoom)
- Adicionar `DEFAULT_PERSON4_TRANSFORM`
- Passar `person4Cutout`, `person4Transform`, `isRemovingBg4` para `CortesCanvas` e `CortesControls`
- Limpar `person4Cutout` no `handleClear`
- Adicionar prop `allowThumbPrincipal` para controlar visibilidade no seletor

### 3. `src/components/cortes/CortesCanvas.tsx` (preview)
- Adicionar props `person4Cutout` e `person4Transform`
- Adicionar `showThumbPrincipal = thumbModel === 'thumb-principal'`
- Renderizar 4 pessoas recortadas em linha:
  - Foto 1: centroX ~16% da largura
  - Foto 2: centroX ~37%
  - Foto 3: centroX ~63%
  - Foto 4: centroX ~84%
  - Cada foto: height ~95% do canvas, ancorada no bottom
  - Controles individuais de X, Y, Zoom e Rotacao
- Excluir este modelo da renderizacao de pessoa do modelo "pip"/"duas-pessoas" (adicionar `!showThumbPrincipal` nas condicoes)

### 4. `src/components/cortes/CortesControls.tsx` (controles + export)
**Controles:**
- Adicionar `'thumb-principal'` ao seletor de modelos (visivel quando `allowAllModels` ou nova prop)
- Adicionar 4 blocos de upload de foto (reutilizando o padrao existente: upload + removendo fundo + sliders de ajuste)
- Adicionar `person4InputRef`, `showPerson4Adjust` states
- Receber props: `person4Cutout`, `person4Transform`, `onPerson4Upload`, `onPerson4TransformChange`, `isRemovingBg4`

**Export (Canvas API):**
- Adicionar bloco `if (showThumbPrincipal)` na funcao `handleExport`
- Carregar `person4Img` em paralelo com as demais imagens
- Desenhar as 4 pessoas em linha, cada uma com centroX nos pontos definidos acima
- Reutilizar gradiente, logos e `drawAutoFitText` existentes

### 5. `src/pages/CortesProgramBuilder.tsx`
- Ativar o modelo para os programas "Geral CazeTv" e "Geral CazeTv Brasil" (passando `allowThumbPrincipal={true}`)

## Posicionamento das 4 fotos (detalhes tecnicos)

Cada foto recortada:
- height: 95% do canvas (684px)
- largura: automatica pelo aspect ratio da imagem
- ancorada no bottom (base da imagem alinhada com a base do canvas)
- centroX distribuido uniformemente: 16%, 37%, 63%, 84% da largura

No preview (HTML/CSS), cada foto sera renderizada como `<img>` com `position: absolute`, `bottom: 0`, `height: 95%`, e `left` calculado para centrar no ponto adequado.

No export (Canvas API), a funcao `drawJogoCutout` sera reutilizada/adaptada para desenhar cada pessoa no posicionamento correto.

## O que NAO muda
- Nenhum modelo existente (pip, pip-dividido, duas-pessoas, meio-a-meio, so-lettering, jogo-v1, jogo-pip-duplo)
- Nenhuma logica de remocao de fundo ou upscale
- Nenhuma edge function
- Nenhuma cor, fonte ou estilo base
