
# Funcionalidade: Upscale Gemini na "Foto de Pessoa" (imagem isolada)

## Visão Geral

O Gemini vai melhorar **apenas a foto da pessoa** (ou da pessoa 2/3), não a thumb composta inteira. Assim o fluxo é:

```text
[Usuário faz upload da foto da pessoa]
         ↓
[Sistema remove o fundo (Photoroom)]
         ↓
[Foto sem fundo fica em personCutout]
         ↓
[Usuário clica "✨ Melhorar com Gemini"]
         ↓
[Edge Function: gemini-upscale recebe personCutout em base64]
         ↓
[Gemini edita a imagem com o prompt de upscale]
         ↓
[personCutout é substituído pela versão melhorada]
         ↓
[Preview da thumb atualiza automaticamente]
```

Isso é muito mais elegante: a thumb toda não precisa ser re-renderizada — o React simplesmente reusa a imagem melhorada no lugar da original.

---

## Fix Urgente (Build Errors)

Os erros de build em `ThumbnailCanvas.tsx` e `ThumbnailCanvasJogoCompleto.tsx` existem porque `maxSize` e `jcMaxSize` não foram reconhecidos — a interface `Team` foi atualizada em `src/data/teams.ts` mas os componentes importam o tipo de outro lugar ou o `.find()` retorna um tipo inferido sem os campos opcionais.

**Fix:** Importar explicitamente o tipo `Team` de `@/data/teams` e tipar o resultado do `.find()`:

```typescript
import { Team, teamsBrasileirao } from '@/data/teams';
// ...
const homeTeam = currentTeams.find(t => t.id === matchData.homeTeamId) as Team | undefined;
const awayTeam = currentTeams.find(t => t.id === matchData.awayTeamId) as Team | undefined;
```

**Arquivos afetados:** `src/components/ThumbnailCanvas.tsx` e `src/components/ThumbnailCanvasJogoCompleto.tsx`

---

## Componentes do Feature

### 1. Nova Edge Function: `supabase/functions/gemini-upscale/index.ts`

Recebe `image_base64` (PNG da pessoa com fundo removido) e retorna a versão melhorada.

- Usa o **Lovable AI Gateway** (`LOVABLE_API_KEY` — já configurado como secret)
- Modelo: `google/gemini-3-pro-image-preview` (melhor qualidade para edição de imagem)
- Envia a imagem + o prompt de upscale exato
- Retorna `{ result_base64: "data:image/png;base64,..." }`

**Prompt usado:**
```
Enhance the image to true photorealistic realism while fully preserving composition, proportions, identity, and emotion.
No beautification, stylization, or facial changes.
Add natural imperfections: subtle asymmetry, uneven eyes/brows/lips, realistic skin texture with pores, fine lines, tiny blemishes, mild discoloration, uneven tones, and natural micro-shadows.
No smooth or plastic skin.
Improve clarity and depth without over-sharpening.
Enhance micro-details: hair strands, fabric fibers, wrinkles, dust, wear, fingerprints, reflections.
Use natural real-world lighting with imperfect shadows and soft highlights.
Ultra-high-resolution, clean upscale, authentic photographic look.
Keep the composition EXACTLY the same. Do not move, resize, crop, or reframe anything. Preserve any transparent background exactly as-is.
```

### 2. `src/components/cortes/CortesThumbBuilder.tsx`

Adicionar:
- Estado `isUpscalingPerson: boolean`
- Função `handleUpscalePerson()` que chama a edge function com `personCutout` e substitui `personCutout` com o resultado
- Passa `isUpscalingPerson` e `onUpscalePerson` como props para `CortesControls`

Mesma lógica replicada para `person2Cutout` → `isUpscalingPerson2` / `handleUpscalePerson2`.

### 3. `src/components/cortes/CortesControls.tsx`

**No painel da Foto de Pessoa**, logo após o botão "Remover fundo", adicionar um novo botão:

```
┌──────────────────────────────────────────────────┐
│ Foto de Pessoa                                   │
│  [Upload]  [Remover fundo]                       │
│  [✨ Melhorar com Gemini]  ← NOVO               │
│                                                  │
│  (Aparece somente se personCutout existir)       │
│  (Mostra spinner "Melhorando imagem..." quando   │
│   isUpscalingPerson = true)                      │
└──────────────────────────────────────────────────┘
```

O botão só aparece se `personCutout` existir. Quando clicado, chama `onUpscalePerson()`. Ao retornar, `personCutout` já é substituído automaticamente e o preview atualiza.

---

## Interface de Props (atualização)

```typescript
// CortesControls.tsx — novos props adicionados:
isUpscalingPerson?: boolean;
isUpscalingPerson2?: boolean;
onUpscalePerson?: () => void;
onUpscalePerson2?: () => void;
```

---

## Arquivos que serão criados/modificados

| Arquivo | Ação |
|---------|------|
| `src/components/ThumbnailCanvas.tsx` | Fix de build (cast de tipo `Team`) |
| `src/components/ThumbnailCanvasJogoCompleto.tsx` | Fix de build (cast de tipo `Team`) |
| `supabase/functions/gemini-upscale/index.ts` | CRIAR — edge function |
| `src/components/cortes/CortesThumbBuilder.tsx` | Adicionar estados + handler de upscale |
| `src/components/cortes/CortesControls.tsx` | Adicionar botão "✨ Melhorar com Gemini" no painel da pessoa |

---

## O que NÃO muda

- O fluxo de exportação JPG não é alterado — a thumb composta não passa pelo Gemini
- O fundo removido (Photoroom) continua funcionando igual
- O preview atualiza automaticamente porque o React já observa `personCutout`
- Nenhuma nova dependência de pacote é necessária
- A chave `GEMINI_API_KEY` fornecida pelo usuário **não** será usada diretamente — usaremos o `LOVABLE_API_KEY` já configurado via Lovable AI Gateway, que é mais seguro
