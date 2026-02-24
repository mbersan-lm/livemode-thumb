

# Remover "Selecionar Template" na aba Ao Vivo

## Problema

Quando o usuario seleciona "Ao Vivo", a aba "Template" na TabsList esta oculta, mas o conteudo do "Selecionar Template" (com o dropdown "Brasileirao") ainda aparece na parte inferior porque o `Tabs` tem `defaultValue="template"` e o `TabsContent` continua sendo renderizado.

## Solucao

Modificar o arquivo `src/pages/Index.tsx` para:

1. **Esconder o `TabsContent` de template** quando `activeCanvas === 'av'`, adicionando uma condicao para nao renderizar esse conteudo.
2. **Ajustar o `defaultValue` do Tabs** para que, quando o usuario estiver em Ao Vivo, o tab ativo padrao seja "teams" em vez de "template" (que nao existe nesse modo).

## Detalhes Tecnicos

**Arquivo:** `src/pages/Index.tsx`

- Alterar o `Tabs` para usar um `defaultValue` dinamico: `defaultValue={activeCanvas === 'av' ? 'teams' : 'template'}`
- Envolver o `TabsContent value="template"` com `{activeCanvas !== 'av' && (...)}`  para que ele nao seja renderizado no modo Ao Vivo

Isso garante que o menu "Template Ao Vivo" (Europa League / Conference League) continue visivel, enquanto o "Selecionar Template" geral (Brasileirao, etc.) desaparece completamente.
