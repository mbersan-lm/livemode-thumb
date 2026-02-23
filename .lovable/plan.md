

# Tornar "Roda de Bobo" editavel e garantir edicao para todos os programas

## Problema

O programa "Roda de Bobo" esta fixo no codigo (hardcoded) com uma rota propria (`/cortes/roda-de-bobo`) e um componente dedicado. Por isso, ele nao aparece no banco de dados e nao tem os botoes de editar/excluir. A solucao e migra-lo para o banco de dados para que seja tratado igualmente a todos os outros programas.

## Alteracoes

### 1. Inserir "Roda de Bobo" no banco de dados

Criar uma migration que insere o programa com seus valores conhecidos:
- name: `Roda de Bobo`
- text_color: `#F1E8D5`
- stroke_color: `#0C0C20`
- pip_border_color: `#D02046`
- highlight_color: `#D02046`
- bg_url, logos_url, font_url: `null` (usa os assets locais fixos do projeto)

### 2. Remover rota hardcoded

**Arquivo: `src/App.tsx`**
- Remover a rota dedicada `/cortes/roda-de-bobo` que aponta para o componente `Cortes`
- A rota generica `/cortes/:id` ja cobre esse caso

### 3. Atualizar `src/pages/CortesProgramBuilder.tsx`

- Adicionar logica condicional para o nome "Roda de Bobo":
  - `allowJogoV1={true}` (prop que so esse programa usa)
  - `logosNegativeImage="/cortes/logos-corte-negativo.png"` (logo negativa especifica)
- Isso segue o mesmo padrao ja usado para "Geral CazeTv", "Live CazeTv", etc.

### 4. Remover card hardcoded do hub

**Arquivo: `src/pages/CortesHub.tsx`**
- Remover o bloco do `ProgramCard` fixo de "Roda de Bobo"
- O programa agora vira do banco como qualquer outro e ja tera os botoes de editar e excluir automaticamente

### 5. Arquivo `src/pages/Cortes.tsx` (opcional)

- Pode ser removido, pois nao sera mais referenciado

## Resultado

- "Roda de Bobo" aparecera na lista vindo do banco, com botoes de editar e excluir
- Todos os programas novos cadastrados ja tem edicao (isso ja funciona)
- A experiencia e uniforme para todos os programas

