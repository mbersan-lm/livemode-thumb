

# Adicionar edicao de programas existentes

## O que sera feito

Criar um dialog de edicao que reutiliza a mesma estrutura do `CreateProgramDialog`, permitindo alterar nome, cores e assets (fundo, logos, fonte) de programas ja existentes diretamente no hub, sem precisar recriar.

## Alteracoes

### 1. Novo componente: `src/components/cortes/EditProgramDialog.tsx`

- Dialog identico ao `CreateProgramDialog`, mas recebe um `program: CortesProgram` como prop
- Inicializa os campos com os valores atuais do programa (nome, cores)
- Para os uploads de arquivos (fundo, logos, fonte), mostra o estado atual ("Fundo atual" / "Logos atual") e permite trocar opcionalmente
- No save, faz `UPDATE` no banco em vez de `INSERT`:
  - Somente faz upload dos arquivos que foram alterados (novo File selecionado)
  - Mantem as URLs existentes para os campos nao alterados
- Reutiliza os sub-componentes `FileUploadButton` e `ColorPicker` (serao extraidos ou exportados do `CreateProgramDialog`)

### 2. Arquivo: `src/components/cortes/CreateProgramDialog.tsx`

- Exportar os componentes auxiliares `FileUploadButton` e `ColorPicker` para que o `EditProgramDialog` possa reutiliza-los

### 3. Arquivo: `src/components/cortes/ProgramCard.tsx`

- Adicionar prop `onEdit?: () => void`
- Adicionar icone de edicao (Pencil) ao lado do icone de exclusao, visivel no hover do card

### 4. Arquivo: `src/pages/CortesHub.tsx`

- Adicionar estado para controlar o dialog de edicao (`editingProgram`)
- Ao clicar no botao de editar de um card, abrir o `EditProgramDialog` com os dados do programa
- Ao salvar, recarregar a lista de programas

## Detalhes tecnicos

- O `EditProgramDialog` usara `supabase.from('cortes_programs').update({...}).eq('id', program.id)` para persistir as alteracoes
- Uploads opcionais: se o usuario nao selecionar um novo arquivo, o campo mantem a URL existente no banco
- Os componentes `FileUploadButton` e `ColorPicker` serao movidos para exportacao nomeada no `CreateProgramDialog` para evitar duplicacao

