

# Novo Modelo "Ao Vivo" na aba Thumbnail Ativa

## Resumo
Adicionar uma terceira opcao chamada **"Ao Vivo"** no seletor "Thumbnail Ativa", ao lado de "Melhores Momentos" e "Jogo Completo". O modelo usara a imagem de estadio enviada como KV de fundo, com o mesmo layout de foto + escudos + placar do modelo Melhores Momentos.

## Alteracoes

### 1. Copiar a imagem do KV para o projeto
- Salvar `user-uploads://BG.jpg` em `public/kv/kv-ao-vivo.jpg`

### 2. Atualizar o tipo `ActiveCanvas` e o `ViewControls`
**Arquivo:** `src/components/controls/ViewControls.tsx`
- Adicionar `'av'` ao tipo `ActiveCanvas` (`'mm' | 'jc' | 'av'`)
- Mudar o grid de 2 para 3 colunas
- Adicionar a tab "Ao Vivo" com valor `'av'`

### 3. Criar o componente `ThumbnailCanvasAoVivo`
**Novo arquivo:** `src/components/ThumbnailCanvasAoVivo.tsx`
- Seguir o mesmo padrao do `ThumbnailCanvas.tsx` (Melhores Momentos)
- Usar a imagem `kv-ao-vivo.jpg` como fundo, cobrindo 100% do canvas (1280x720)
- Manter a mesma estrutura: foto do jogador (z:0) + KV (z:10) + escudos e placar (z:20)
- Usar o posicionamento e estilos dos templates europeus (top-[335px])

### 4. Atualizar o estado e tipos
**Arquivo:** `src/types/thumbnail.ts`
- Adicionar campos `aoVivoPhoto`, `aoVivoPhotoTransform` e `initialScaleAoVivo` ao `ThumbnailState`

### 5. Atualizar a pagina Index
**Arquivo:** `src/pages/Index.tsx`
- Adicionar estado para foto/transform do "Ao Vivo"
- Adicionar handler de upload e transform para o "Ao Vivo"
- Renderizar `ThumbnailCanvasAoVivo` quando `activeCanvas === 'av'`
- Atualizar `PhotoControls` para suportar o novo canvas
- Adicionar ref para o canvas "Ao Vivo"

### 6. Atualizar o `PhotoControls`
**Arquivo:** `src/components/controls/PhotoControls.tsx`
- Adicionar suporte ao `activeCanvas === 'av'` na logica de selecao de foto/transform

### 7. Atualizar o `ExportControls`
**Arquivo:** `src/components/controls/ExportControls.tsx`
- Adicionar botao "Exportar Ao Vivo"
- Adicionar ref e handler de export para o canvas "Ao Vivo"

## Resultado
O usuario podera alternar entre 3 modelos de thumbnail: Melhores Momentos, Jogo Completo e Ao Vivo, cada um com sua propria foto, controles de posicao e exportacao independente.

