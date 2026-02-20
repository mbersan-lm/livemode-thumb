
# Botão "AI Cinematic Background" — Gerador de Fundo com IA

## O que será feito

Adicionar um novo botão chamado **"AI Cinematic BG"** nas "Quick Actions" de ambas as abas (Melhores Momentos e Jogo Completo) em `PhotoControls.tsx`. Ao clicar, o sistema envia a foto carregada para uma nova Edge Function que usa o modelo de geração de imagem da Lovable AI (`google/gemini-3-pro-image-preview`) para criar um fundo cinematográfico 1280x720. O resultado substitui a foto atual no canvas.

---

## Como vai funcionar

```text
Usuário clica em "AI Cinematic BG"
        ↓
Frontend envia a foto (base64) para a Edge Function
        ↓
Edge Function analisa a imagem com visão do modelo Gemini
  → Extrai contexto visual (estádio, cores, atmosfera)
        ↓
Edge Function chama o modelo de geração de imagem
  → Prompt: fundo cinematográfico 16:9, centro limpo e suave,
    bokeh, iluminação dramática, sem texto/logos/pessoas
        ↓
Retorna o fundo gerado como base64
        ↓
Frontend substitui o playerPhoto no canvas
  → Transform resetado para scale 1, x/y 0 (imagem já é 1280x720)
```

---

## Arquivos que serão criados/modificados

### 1. `supabase/functions/ai-cinematic-bg/index.ts` (novo)
Nova Edge Function que:
- Recebe `image_base64` do frontend
- Usa `google/gemini-2.5-flash` (visão) para analisar a imagem e extrair contexto (cores dominantes, ambiente, estilo)
- Com esse contexto, chama `google/gemini-3-pro-image-preview` para gerar o fundo cinematográfico com o prompt exato especificado pelo usuário
- Retorna a imagem gerada como `data:image/png;base64,...`

O prompt enviado à geração de imagem será fixo no backend:
> *"Cinematic 16:9 YouTube thumbnail background, 1280x720px. [contexto extraído da imagem]. Dramatic high-contrast environment, stadium atmosphere, soft bokeh depth of field, cinematic lighting. Center area must be clean, low-detail, slightly blurred. No text, no logos, no people, no foreground objects, no strong center patterns. Energetic and professional look."*

### 2. `src/components/controls/PhotoControls.tsx` (editado)
- Adicionar estado `isGeneratingBG` e `isGeneratingBGJC`
- Adicionar função `handleAiCinematicBG` que chama a nova Edge Function
- Adicionar botão **"AI Cinematic BG"** com ícone `Sparkles` (ou `Wand2`) nas Quick Actions de ambas as abas
- Botão fica desabilitado se não houver foto carregada

### 3. `supabase/config.toml` (editado)
- Adicionar entrada `[functions.ai-cinematic-bg]` com `verify_jwt = false`

---

## Detalhes técnicos

- A `LOVABLE_API_KEY` já está configurada como secret — não é necessário nenhuma configuração extra do usuário
- O modelo de visão (`gemini-2.5-flash`) lê a foto carregada para extrair contexto real (cores da camisa, tipo de iluminação, ambiente percebido), tornando o fundo gerado mais coerente com a foto
- O modelo de geração (`gemini-3-pro-image-preview`) produz a imagem 1280x720
- A imagem gerada substitui completamente o `playerPhoto` no estado, com transform resetado para `{x:0, y:0, scale:1}` — ela já ocupa o canvas inteiro
- Toast de feedback: "Gerando fundo cinematográfico..." durante o processo e "Fundo gerado!" no sucesso

---

## UX do botão

```text
[ ✨ AI Cinematic BG ]   ← botão novo, acima do AI Expand
[ ⤢  AI Expand (1280×720) ]
[ ⊕  Center ]
[ ↺  Reset All ]
```

- Durante a geração: spinner + "Gerando fundo..."
- Tempo estimado: 10–20 segundos
- Desabilitado se não houver foto carregada
