
# Correcao: Imagens de referencia na geracao de PIP com IA

## Problema
Quando imagens de referencia sao anexadas, o modelo `gemini-3-pro-image-preview` recebe as imagens diretamente e retorna `IMAGE_OTHER` (recusa gerar). Alem disso, imagens grandes geram payloads enormes que podem causar timeout.

## Solucao: Dois estagios + compressao no cliente

### Fluxo corrigido

```text
Cliente                          Edge Function
  |                                    |
  |-- comprime imagens (512px) ------->|
  |                                    |-- Estagio 1: gemini-2.5-flash
  |                                    |   descreve as imagens de referencia
  |                                    |   (retorna texto descritivo)
  |                                    |
  |                                    |-- Estagio 2: gemini-3-pro-image-preview
  |                                    |   gera imagem usando APENAS o prompt
  |                                    |   + descricao textual (sem imagens)
  |                                    |
  |<-- imagem gerada (base64) ---------|
```

### 1. Compressao no cliente
**Arquivo:** `src/components/cortes/PipAiGenerator.tsx`
- Ao anexar imagens, redimensionar para max 512px (largura ou altura) usando canvas
- Converter para JPEG com qualidade 0.7
- Isso reduz drasticamente o tamanho do payload (de varios MB para ~50-100KB por imagem)

### 2. Fluxo de dois estagios na edge function
**Arquivo:** `supabase/functions/gemini-generate-pip/index.ts`
- **Estagio 1**: Enviar as imagens de referencia ao modelo `google/gemini-2.5-flash` pedindo uma descricao textual detalhada (cores, composicao, estilo, objetos)
- **Estagio 2**: Usar o prompt do usuario + a descricao textual para gerar a imagem com `google/gemini-3-pro-image-preview` (SEM enviar as imagens, apenas texto)
- Adicionar logs para debug (`console.log` com tamanho do payload, comprimento da descricao)
- Tratar erros de rate limit (429) e creditos (402) em ambos os estagios

## Detalhes tecnicos

### Compressao de imagem no cliente (canvas resize)
```text
Imagem original (ex: 3000x2000, 4MB base64)
  -> Canvas resize para 512x341
  -> JPEG quality 0.7
  -> ~50-100KB base64
```

### Prompt do estagio 1 (descricao)
Sistema pede ao modelo de texto para descrever as imagens em detalhe: estilo visual, cores dominantes, composicao, objetos, iluminacao, atmosfera. Retorna apenas texto.

### Prompt do estagio 2 (geracao)
Combina o prompt do usuario com a descricao das referencias em um unico prompt textual. O modelo de imagem recebe apenas texto, evitando o erro `IMAGE_OTHER`.

## Arquivos alterados
1. `src/components/cortes/PipAiGenerator.tsx` -- adicionar funcao de compressao de imagem
2. `supabase/functions/gemini-generate-pip/index.ts` -- implementar fluxo de dois estagios

## O que NAO muda
- Interface do usuario (botoes, layout, fluxo de uso)
- Modelos de thumbnail existentes
- Outras edge functions
