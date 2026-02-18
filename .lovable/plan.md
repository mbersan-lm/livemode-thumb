

# Sistema de Programas para Cortes

## Resumo

Transformar a pagina /cortes em um hub de programas, onde cada programa tem seus proprios assets e cores. "Roda de Bobo" permanece como programa fixo (hardcoded), e novos programas sao criados pelo usuario e salvos no banco de dados.

## Fluxo do Usuario

1. Acessa /cortes e ve a lista de programas (cards)
2. "Roda de Bobo" aparece como card fixo (sempre presente)
3. Botao "+ Novo Programa" abre um formulario de criacao
4. No formulario, o usuario:
   - Da um nome ao programa (ex: "Geral CazeTv")
   - Escolhe o tipo de thumb: "Corte com PIP" (unico tipo por enquanto, expansivel)
   - Faz upload de: fonte personalizada (.ttf/.otf), imagem de fundo (KV), imagem de logos
   - Define cores: cor do texto, cor do tracado do texto, cor da borda do PIP
5. Ao salvar, o programa aparece na lista
6. Clicar em um programa abre o builder de thumb (mesmo layout atual)
7. Programas customizados podem ser editados ou excluidos

## Mudancas no Banco de Dados

### Tabela: `cortes_programs`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid (PK) | Identificador |
| name | text | Nome do programa |
| thumb_type | text | Tipo de thumb (ex: "pip") |
| font_url | text | URL da fonte no storage |
| font_family | text | Nome da font-family CSS |
| bg_url | text | URL do KV de fundo |
| logos_url | text | URL da imagem de logos |
| text_color | text | Cor do texto (hex) |
| stroke_color | text | Cor do tracado do texto (hex) |
| pip_border_color | text | Cor da borda do PIP (hex) |
| created_at | timestamptz | Data de criacao |

RLS: acesso publico (sem autenticacao, pois o app nao tem login).

### Storage Bucket: `cortes-assets`

Bucket publico para armazenar fontes, KVs e logos dos programas customizados.

## Estrutura de Arquivos

### Novos arquivos:
- `src/pages/CortesHub.tsx` -- pagina de listagem de programas
- `src/components/cortes/ProgramCard.tsx` -- card de cada programa
- `src/components/cortes/CreateProgramDialog.tsx` -- dialog/formulario de criacao
- `src/components/cortes/DynamicCortesCanvas.tsx` -- canvas que aceita cores/assets customizados

### Arquivos modificados:
- `src/App.tsx` -- novas rotas: /cortes (hub), /cortes/roda-de-bobo (builder atual), /cortes/:programId (builder dinamico)
- `src/pages/Cortes.tsx` -- redireciona para o hub
- `src/components/cortes/CortesCanvas.tsx` -- recebe cores como props (com valores padrao do Roda de Bobo para manter compatibilidade)
- `src/components/cortes/CortesThumbBuilder.tsx` -- aceita config do programa como prop

## Detalhes Tecnicos

### CortesCanvas - Props adicionais (com defaults)

```text
bgImage?: string         (default: "/cortes/bg-corte.png")
logosImage?: string      (default: "/cortes/logos-corte.png")
textColor?: string       (default: "#F1E8D5")
strokeColor?: string     (default: "#0C0C20")
pipBorderColor?: string  (default: "#D02046")
customFontFamily?: string (default: "Clash Grotesk")
```

Todos os valores atuais sao mantidos como default, entao o "Roda de Bobo" continua funcionando sem nenhuma alteracao.

### Carregamento de fonte customizada

Quando um programa customizado tem uma fonte, ela e carregada via FontFace API antes de renderizar o canvas:

```text
const font = new FontFace("CustomFont-{programId}", "url({fontUrl})");
await font.load();
document.fonts.add(font);
```

### Rotas

```text
/cortes              -> CortesHub (lista de programas)
/cortes/roda-de-bobo -> CortesThumbBuilder (hardcoded, sem mudancas)
/cortes/:id          -> CortesThumbBuilder (com config do banco)
```

### Formulario de criacao

O dialog de criacao tera:
- Campo de texto: nome do programa
- Seletor: tipo de thumb (apenas "Corte com PIP" por enquanto)
- 3 uploads: fonte, KV (fundo), logos
- 3 color pickers: cor do texto, cor do tracado, cor da borda PIP
- Botao salvar: faz upload dos arquivos para o storage e salva o registro no banco

### Protecao do "Roda de Bobo"

O "Roda de Bobo" NAO existe no banco. Ele e um card fixo renderizado no frontend, com rota fixa `/cortes/roda-de-bobo`, usando os assets hardcoded atuais. Isso garante que nunca sera alterado ou excluido acidentalmente.

