

# Adicionar cor do texto destacado (*asteriscos*)

## Resumo

Adicionar um novo campo de cor para o texto destacado entre `*asteriscos*`, que atualmente usa a mesma cor da borda do PIP. Com essa mudanca, o usuario podera definir essa cor separadamente ao criar um programa.

## Mudancas

### 1. Banco de dados

Adicionar coluna `highlight_color` (text, NOT NULL, default `'#D02046'`) na tabela `cortes_programs`.

### 2. Formulario de criacao (`CreateProgramDialog.tsx`)

- Novo state `highlightColor` com default `'#D02046'`
- Novo `ColorPicker` no grid de cores com label "Texto destaque"
- Incluir `highlight_color` no insert
- Grid de cores passa de 3 para 4 colunas (ou 2x2)

### 3. Canvas (`CortesCanvas.tsx`)

- Nova prop `highlightColor?: string` (default: `'#D02046'`)
- No render do texto, trocar a cor do `<span>` de destaque de `pipBorderColor` para `highlightColor`

### 4. Builder do programa (`CortesThumbBuilder.tsx`)

- Passar a nova prop `highlightColor` para o `CortesCanvas`

### 5. Builder dinamico (`CortesProgramBuilder.tsx`)

- Ler `highlight_color` do programa e passar como prop

### 6. Hub (`CortesHub.tsx`)

- Incluir `highlight_color` na interface `CortesProgram`

### 7. Types (`types.ts`)

- Sera atualizado automaticamente apos a migration

## Resultado

- "Roda de Bobo" continua usando o default `#D02046` para destaque (sem alteracao visual)
- Novos programas podem definir cor de destaque independente da borda do PIP
