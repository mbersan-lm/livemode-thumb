

## Plano: Adicionar template "Sul-americana" ao Melhores Momentos

### 1. Asset — KV de fundo
Copiar a imagem enviada para `public/kv/kv-sulamericana.png`.

### 2. Dados de times
Criar `src/data/teamsSulamericana.ts` com um array vazio (ou mínimo) para ir adicionando escudos aos poucos:
```typescript
import { Team } from './teams';
export const teamsSulamericana: Team[] = [];
```

### 3. Template config
**`src/data/templates.ts`**
- Adicionar `'sulamericana'` ao tipo `TemplateType`
- Adicionar entrada no objeto `templates` com KV path, fonte Gilroy ExtraBold (mesmo padrão dos templates europeus), `kvJogoCompletoPath: ''` (sem jogo completo por enquanto)

### 4. Atualizar componentes que fazem switch por template
Todos os arquivos que usam a cadeia de ternários para mapear template → lista de times precisam incluir `sulamericana`:

- **`src/components/ThumbnailCanvas.tsx`** — adicionar `template === 'sulamericana' ? teamsSulamericana`
- **`src/components/ThumbnailCanvasJogoCompleto.tsx`** — idem
- **`src/components/controls/TeamControls.tsx`** — idem
- **`src/components/controls/ViewControls.tsx`** — esconder "Jogo Completo" (como faz com libertadores)
- **`src/types/thumbnail.ts`** — adicionar `'sulamericana'` ao union type do campo `template`

### 5. Posicionamento visual
Seguir o mesmo padrão da Libertadores/Europa League: `top-[335px]` no MM e `-top-[20px]` no JC, fonte branca no "x", placar com `translateX(-3%)`.

