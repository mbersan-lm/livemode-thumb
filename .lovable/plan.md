

## Plano: Criar template "Kings League" (com Jogo Completo)

### Alterações

1. **Copiar KV para o projeto**
   - `user-uploads://KV_KINGS.png` → `public/kv/kv-kingsleague.png`
   - O KV de Jogo Completo será adicionado posteriormente quando o usuário enviar

2. **`src/data/templates.ts`**
   - Adicionar `'kingsleague'` ao tipo `TemplateType`
   - Adicionar entrada no objeto `templates` com KV, fonte Gilroy ExtraBold, e `kvJogoCompletoPath` como string vazia (placeholder até receber o KV de JC)

3. **`src/types/thumbnail.ts`**
   - Adicionar `'kingsleague'` ao union type do campo `template`

4. **`src/data/teamsKingsLeague.ts`** (novo arquivo)
   - Criar array vazio de times (será preenchido depois)

5. **`src/components/ThumbnailCanvas.tsx`**
   - Adicionar import e mapeamento para `template === 'kingsleague'`

6. **`src/components/ThumbnailCanvasJogoCompleto.tsx`**
   - Adicionar import e mapeamento para `template === 'kingsleague'`

7. **Sem alteração em `ViewControls.tsx`**
   - Kings League terá Jogo Completo disponível (diferente do Libertadores)

