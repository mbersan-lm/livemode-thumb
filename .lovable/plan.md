
# Hub Inicial - Tela de Selecao de Modelo

## Objetivo
Criar uma pagina inicial (landing page) que funcione como hub de selecao, onde o usuario escolhe entre tres opcoes antes de acessar qualquer ferramenta:

1. **Melhores Momentos e Jogo Completo** (juntos, como estao hoje)
2. **Ao Vivo**
3. **Cortes**

## Mudancas Planejadas

### 1. Nova pagina: `src/pages/Home.tsx`
- Pagina com fundo escuro (bg-background/black) consistente com o visual atual
- Tres cards grandes e clicaveis, organizados em grid responsivo
- Cada card tera:
  - Titulo do modelo (ex: "Melhores Momentos & Jogo Completo", "Ao Vivo", "Cortes")
  - Breve descricao
  - Icone ou indicador visual
- Ao clicar, o usuario sera redirecionado para a rota correspondente

### 2. Reorganizacao de rotas em `src/App.tsx`
- `/` → Nova pagina Home (hub de selecao)
- `/melhores-momentos` → Pagina Index atual (Melhores Momentos + Jogo Completo)
- `/ao-vivo` → Nova pagina dedicada ao modelo Ao Vivo (extraida da Index)
- `/cortes` → Permanece como esta (CortesHub)
- `/cortes/:id` → Permanece como esta

### 3. Ajustes na pagina Index (`src/pages/Index.tsx`)
- Remover a opcao "Ao Vivo" do ViewControls, ja que tera sua propria rota
- Manter apenas "Melhores Momentos" e "Jogo Completo" como opcoes
- Atualizar o botao de navegacao no header para voltar ao Hub (`/`) em vez de ir para `/cortes`

### 4. Nova pagina: `src/pages/AoVivo.tsx`
- Extrair toda a logica do modelo "Ao Vivo" da Index para uma pagina dedicada
- Incluir o canvas `ThumbnailCanvasAoVivo`, controles de gradiente, template (Europa League / Conference League), times e exportacao
- Botao para voltar ao Hub (`/`)

### 5. Atualizar `ViewControls.tsx`
- Remover a opcao "Ao Vivo" (ficara apenas "Melhores Momentos" e "Jogo Completo")
- Ajustar o grid de 3 colunas para 2 colunas

### 6. Atualizar `CortesHub.tsx`
- Alterar o botao de navegacao para voltar ao Hub (`/`) em vez de ir para a pagina de Melhores Momentos

## Detalhes Tecnicos

### Estrutura da Home

```text
+------------------------------------------+
|              Hub Principal               |
|                                          |
|  +----------+  +----------+  +--------+  |
|  | Melhores |  |          |  |        |  |
|  | Momentos |  | Ao Vivo  |  | Cortes |  |
|  | & Jogo   |  |          |  |        |  |
|  | Completo |  |          |  |        |  |
|  +----------+  +----------+  +--------+  |
|                                          |
+------------------------------------------+
```

### Arquivos a criar
- `src/pages/Home.tsx` — Hub de selecao
- `src/pages/AoVivo.tsx` — Pagina dedicada ao modelo Ao Vivo

### Arquivos a modificar
- `src/App.tsx` — Adicionar novas rotas
- `src/pages/Index.tsx` — Remover logica do Ao Vivo, atualizar navegacao
- `src/components/controls/ViewControls.tsx` — Remover opcao Ao Vivo, ajustar grid
- `src/pages/CortesHub.tsx` — Atualizar link de volta para `/`
