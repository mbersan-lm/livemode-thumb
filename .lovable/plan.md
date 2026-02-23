

# Novo Modelo: Chamada Principal (4 fotos em linha + texto)

## Resumo
Adicionar um novo modelo de thumbnail chamado "Chamada Principal" ao sistema de Cortes. O modelo exibe 4 fotos lado a lado na horizontal (com remocao de fundo) sobre o KV enviado pelo usuario, com texto na parte inferior.

## Layout (1280x720)

```text
+----------------------------------------------+
|                KV de fundo                    |
|                                               |
|  [Foto1]  [Foto2]  [Foto3]  [Foto4]          |
|  pessoa   pessoa   pessoa   pessoa            |
|  recortada recortada recortada recortada      |
|                                               |
|  ========= GRADIENTE INFERIOR =========       |
|  [Logos]                                      |
|       TEXTO AUTO-FIT (lettering)              |
+----------------------------------------------+
```

As 4 fotos sao recortadas (sem fundo, usando o mesmo servico de remocao de fundo ja existente) e posicionadas em linha, cada uma ocupando aproximadamente 25% da largura, com controles individuais de posicao, zoom e rotacao.

## Alteracoes

### 1. Copiar KV de fundo
- Copiar `user-uploads://THUMB_GERAL.jpg` para `public/cortes/bg-chamada-principal.jpg`

### 2. Atualizar tipo ThumbModel
**Arquivo:** `src/components/cortes/CortesThumbBuilder.tsx`
- Adicionar `'chamada-principal'` ao tipo `ThumbModel`
- Adicionar estado para `person4Cutout`, `person4Transform`, `isRemovingBg4`
- Adicionar handler `handlePerson4Upload` (com remocao de fundo)
- Adicionar `DEFAULT_PERSON4_TRANSFORM`
- Passar os novos props para `CortesCanvas` e `CortesControls`
- Limpar person4 no `handleClear`

### 3. Renderizar o novo modelo no Canvas (preview)
**Arquivo:** `src/components/cortes/CortesCanvas.tsx`
- Adicionar `showChamadaPrincipal = thumbModel === 'chamada-principal'`
- Adicionar prop `person4Cutout` e `person4Transform`
- Renderizar as 4 pessoas recortadas em linha horizontal, distribuidas igualmente pela largura do canvas
- Posicionamento base: cada pessoa ocupa ~25% da largura, ancorada na parte inferior
- Manter as camadas existentes (gradiente, logos, texto) acima das fotos

### 4. Adicionar controles no painel
**Arquivo:** `src/components/cortes/CortesControls.tsx`
- Adicionar opcao "Chamada Principal" ao seletor de modelo
- Adicionar controles de upload e ajuste para as 4 pessoas (reutilizar o padrao ja existente de upload + remocao de fundo + sliders de posicao/zoom/rotacao)
- Adicionar prop `person4Cutout`, `person4Transform`, `onPerson4Upload`, `onPerson4TransformChange`, `isRemovingBg4`
- Adicionar logica de export (Canvas API) para o novo modelo, desenhando as 4 pessoas recortadas em linha

### 5. Disponibilidade do modelo
- Adicionar nova prop `allowChamadaPrincipal` ao `CortesThumbBuilder`
- O modelo aparecera no seletor quando `allowChamadaPrincipal` for `true`
- Configurar no `CortesProgramBuilder.tsx` para ativar o modelo nos programas desejados (por enquanto, ativar para "Geral CazeTv" e "Geral CazeTv Brasil")

## Detalhes Tecnicos

### Posicionamento das 4 fotos no canvas (1280x720)
- Foto 1: left 0%, ancoraCentroX ~16% da largura
- Foto 2: ancoraCentroX ~37%
- Foto 3: ancoraCentroX ~63%
- Foto 4: ancoraCentroX ~84%
- Cada foto: height ~95% do canvas, largura automatica pelo aspect ratio
- Todas ancoradas no bottom do canvas

### Export (Canvas API)
- Desenhar as 4 `personImg` na mesma logica de posicionamento
- Reutilizar `drawAutoFitText` para o texto
- Reutilizar gradiente inferior e logos

## Arquivos alterados
1. `public/cortes/bg-chamada-principal.jpg` -- novo arquivo (KV de fundo)
2. `src/components/cortes/CortesThumbBuilder.tsx` -- novo tipo, estado e handlers para person4
3. `src/components/cortes/CortesCanvas.tsx` -- renderizacao do novo modelo
4. `src/components/cortes/CortesControls.tsx` -- controles e export do novo modelo
5. `src/pages/CortesProgramBuilder.tsx` -- ativar modelo para programas especificos

## O que NAO muda
- Nenhum modelo existente (pip, pip-dividido, duas-pessoas, etc.)
- Nenhuma logica de remocao de fundo ou upscale
- Nenhuma cor, fonte ou estilo da interface
- Nenhuma edge function
