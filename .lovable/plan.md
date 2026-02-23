

# Corrigir envio de imagens de referencia no gerador PIP com IA

## Problema
Quando imagens de referencia sao anexadas, o payload enviado para a edge function fica muito grande (imagens base64 sem compressao podem ter varios MB cada). Isso excede o limite de tamanho do corpo da requisicao da edge function, resultando em erro "non-2xx status code".

## Solucao
Redimensionar e comprimir as imagens de referencia no lado do cliente (browser) antes de envia-las para a edge function. Cada imagem sera reduzida para no maximo 512x512 pixels e comprimida em JPEG com qualidade 70%, mantendo o tamanho do payload viavel.

## Alteracoes

### 1. `src/components/cortes/PipAiGenerator.tsx`
- Criar funcao auxiliar `resizeImage(dataUrl, maxSize, quality)` que usa um canvas offscreen para redimensionar a imagem
- No `handleAttachImages`, apos ler o arquivo, passar pela funcao de resize antes de adicionar ao estado `referenceImages`
- Isso garante que cada imagem de referencia tenha no maximo ~50-80KB em vez de varios MB

### 2. `supabase/functions/gemini-generate-pip/index.ts`
- Adicionar log do tamanho do payload para facilitar debug futuro
- Adicionar tratamento de erro mais especifico para payloads grandes
- Manter a logica existente sem mudancas estruturais

## Detalhes tecnicos

A funcao de resize:
- Cria um elemento `<canvas>` temporario
- Desenha a imagem redimensionada (max 512px no maior lado, mantendo proporcao)
- Exporta como JPEG com qualidade 0.7
- Retorna o novo data URL comprimido

## Arquivos alterados
1. `src/components/cortes/PipAiGenerator.tsx` -- resize de imagens no cliente
2. `supabase/functions/gemini-generate-pip/index.ts` -- melhor tratamento de erro

## O que NAO muda
- Fluxo de geracao sem referencias (ja funciona)
- Qualidade da imagem gerada pela IA
- Nenhum outro componente ou modelo

