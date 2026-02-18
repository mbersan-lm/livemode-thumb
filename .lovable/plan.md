

## Aba "Cortes" -- Gerador de Thumbnails 1280x720

### Resumo
Nova rota `/cortes` com ferramenta completa para gerar thumbnails de cortes do programa "Roda de Bobo". O usuario faz upload de uma imagem PIP (frame do jogo) e uma foto de pessoa (que tera o fundo removido automaticamente via PhotoRoom API), digita o texto da thumb, e exporta como JPG 1280x720.

---

### 1. Assets e Fonte

Copiar os 3 arquivos enviados para o projeto:
- `user-uploads://THUMB_CORTE_RODA_DE_BOBO.png` -> `public/cortes/bg-corte.png` (fundo)
- `user-uploads://THUMB_CORTE_RODA_DE_BOBO_1.png` -> `public/cortes/logos-corte.png` (logos Roda de Bobo + CazeTV)
- `user-uploads://ClashGrotesk-Variable.ttf` -> `public/fonts/ClashGrotesk-Variable.ttf`

Registrar a fonte Clash Grotesk no `src/index.css`:
```css
@font-face {
  font-family: 'Clash Grotesk';
  src: url('/fonts/ClashGrotesk-Variable.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
}
```

---

### 2. Backend -- Edge Function para PhotoRoom

**Pre-requisito**: Habilitar Lovable Cloud no projeto, depois configurar o secret `PHOTOROOM_API_KEY`.

**Arquivo**: `supabase/functions/photoroom-remove-bg/index.ts`

- Recebe POST com `image_file` (base64 ou FormData)
- Chama `https://sdk.photoroom.com/v1/segment` com header `x-api-key` do secret
- Retorna o PNG com transparencia para o front
- Tratamento de erros (chave invalida, limite de requests, etc.)

---

### 3. Rota e Navegacao

**`src/App.tsx`**: Adicionar rota `/cortes` apontando para nova pagina.

**`src/pages/Cortes.tsx`**: Pagina principal que renderiza o componente `CortesThumbBuilder`.

Adicionar link de navegacao entre as duas ferramentas (um botao/link simples no header de cada pagina para ir e voltar entre `/` e `/cortes`).

---

### 4. Componente Principal: `CortesThumbBuilder`

**Arquivo**: `src/components/cortes/CortesThumbBuilder.tsx`

Layout similar ao Index.tsx existente: preview a esquerda, controles a direita.

**Estado gerenciado**:
- `pipImage`: string | null (imagem PIP uploaded)
- `personImage`: string | null (foto original da pessoa)
- `personCutout`: string | null (resultado PhotoRoom, PNG sem fundo)
- `thumbText`: string (texto da thumbnail)
- `isRemovingBg`: boolean (loading do PhotoRoom)
- `error`: string | null

---

### 5. Canvas de Preview: `CortesCanvas`

**Arquivo**: `src/components/cortes/CortesCanvas.tsx`

Div 1280x720 com as camadas na ordem:

1. **BG** (`/cortes/bg-corte.png`) -- cobrindo tudo
2. **PIP** -- retangulo com borda rosa:
   - `left: 2.2%`, `top: 7.8%`, `width: 56.6%`, `height: 64.3%`
   - `border: 10px solid #D02046`
   - `transform: rotate(-1.2deg)`
   - `overflow: hidden`, imagem com `object-fit: cover`
3. **Pessoa** (PNG sem fundo) -- posicionada a direita:
   - `right: -6%`, `top: -2%`, `height: 108%`, `width: auto`
   - Na frente do BG/PIP, atras do texto
4. **Logos** (`/cortes/logos-corte.png`) -- no topo, z-index alto
5. **Texto** -- por cima de tudo:
   - Fonte: Clash Grotesk, weight 800
   - Cor: `#F1E8D5`
   - Stroke: `10px #0C0C20` via `-webkit-text-stroke` + `paint-order: stroke fill`
   - Posicao: `left: 5%`, `bottom: 6%`, `width: 90%`
   - Auto-fit: comeca em 100px, reduz ate caber sem overflow
   - `line-height: 0.95`, `text-align: center`

---

### 6. Controles: `CortesControls`

**Arquivo**: `src/components/cortes/CortesControls.tsx`

- Upload PIP (drag & drop ou botao)
- Upload Pessoa (ao enviar, chama automaticamente a edge function)
- Textarea para texto da thumb
- Indicador de loading "Removendo fundo..." durante processamento
- Mensagens de erro caso PhotoRoom falhe
- Botoes: "Limpar" (reset tudo) e "Baixar JPG"

---

### 7. Export JPG

Reutilizar `html2canvas` (ja instalado) para capturar a div 1280x720.

Na funcao de export:
- Neutralizar transforms dos ancestrais (mesmo padrao do ExportControls existente)
- Para o texto com stroke, o html2canvas captura o CSS `-webkit-text-stroke` corretamente
- Gerar blob JPG com qualidade 90%
- Download automatico com nome `CORTE_[timestamp].jpg`

---

### 8. Auto-fit do Texto

Logica de auto-sizing:
- Renderizar texto em div invisivel com font-size inicial (100px)
- Medir se ultrapassa a caixa (`scrollHeight > clientHeight`)
- Reduzir font-size progressivamente (de 2 em 2px) ate caber
- Recalcular ao mudar texto ou redimensionar janela
- Font-size minimo: 30px

---

### Arquivos a criar/modificar

| Arquivo | Acao |
|---|---|
| `public/cortes/bg-corte.png` | Copiar asset |
| `public/cortes/logos-corte.png` | Copiar asset |
| `public/fonts/ClashGrotesk-Variable.ttf` | Copiar fonte |
| `src/index.css` | Adicionar @font-face Clash Grotesk |
| `src/App.tsx` | Adicionar rota /cortes |
| `src/pages/Cortes.tsx` | Nova pagina |
| `src/components/cortes/CortesThumbBuilder.tsx` | Componente principal |
| `src/components/cortes/CortesCanvas.tsx` | Canvas 1280x720 |
| `src/components/cortes/CortesControls.tsx` | Painel de controles |
| `supabase/functions/photoroom-remove-bg/index.ts` | Edge function PhotoRoom |

### Ordem de implementacao

1. Habilitar Lovable Cloud
2. Copiar assets e fonte
3. Registrar fonte no CSS
4. Criar edge function PhotoRoom
5. Configurar secret PHOTOROOM_API_KEY
6. Criar componentes (Canvas, Controls, ThumbBuilder)
7. Criar pagina e rota
8. Adicionar navegacao entre paginas

