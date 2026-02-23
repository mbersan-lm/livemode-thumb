

# Novo modelo "Com PIP dividido"

## Resumo

Adicionar um novo modelo de thumbnail chamado "Com PIP dividido" que funciona como o "Com PIP" existente, mas com a moldura PIP dividida em duas fotos lado a lado. Disponivel para todos os programas.

## Arquivos modificados

### 1. `src/components/cortes/CortesThumbBuilder.tsx`

- Adicionar `'pip-dividido'` ao tipo `ThumbModel`.
- Reutilizar o estado `pip2Image`, `pip2Transform`, `pip2Frame` e `pip2BaseScale` ja existentes para a segunda imagem do PIP dividido.
- Definir defaults para o PIP dividido: duas molduras lado a lado ocupando a mesma area que o PIP unico (cada uma com ~metade da largura).

### 2. `src/components/cortes/CortesCanvas.tsx` (preview)

- Adicionar `const showPipDividido = thumbModel === 'pip-dividido'`.
- Renderizar duas molduras PIP lado a lado (similar ao `jogo-pip-duplo` mas sem os 3 cutouts), com a mesma rotacao e borda.
- Manter o cutout de pessoa no lado direito (como no modelo `pip`).

### 3. `src/components/cortes/CortesControls.tsx` (controles + export)

**Seletor de modelo:**
- Adicionar `<SelectItem value="pip-dividido">Com PIP dividido</SelectItem>` como opcao universal (junto ao "Com PIP").

**Controles de UI:**
- Quando `thumbModel === 'pip-dividido'`:
  - Upload PIP esquerdo (usa `pipImage` / `onPipUpload`)
  - Ajustes de imagem PIP esquerdo
  - Upload PIP direito (usa `pip2Image` / `onPip2Upload`)
  - Ajustes de imagem PIP direito
  - Moldura compartilhada (sincronizada como no `jogo-pip-duplo`)
  - Upload pessoa + ajustes (reutiliza os controles existentes do modelo `pip`)

**Export (handleExport):**
- Adicionar `const showPipDividido = thumbModel === 'pip-dividido'`.
- Desenhar duas molduras PIP com clip + borda (reutilizando logica do `jogo-pip-duplo`).
- Desenhar o cutout de pessoa no lado direito (como no modelo `pip`).

### 4. Sincronizacao de molduras em `CortesThumbBuilder.tsx`

- No `onPipFrameChange`, adicionar o modelo `pip-dividido` a condicao que sincroniza as molduras (junto com `jogo-pip-duplo`), garantindo que largura, altura e Y sejam espelhados.

## Comportamento visual

- Duas molduras PIP lado a lado, cada uma com borda colorida
- PIP esquerdo rotacionado -1.2deg, PIP direito rotacionado +1.2deg
- Pessoa recortada aparece no lado direito (identico ao modelo "Com PIP")
- Texto, gradiente, logos — tudo igual ao modelo "Com PIP"

