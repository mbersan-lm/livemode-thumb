

# Gerar imagem PIP com IA (Gemini 3 Pro Image)

## Objetivo
Adicionar nos controles do PIP uma ferramenta para gerar imagens via IA usando o modelo `google/gemini-3-pro-image-preview` (Nano Banana Pro). O usuario digita um prompt, opcionalmente anexa imagens de referencia, e recebe uma imagem 16:9 gerada pela IA diretamente no PIP.

## O que sera criado/alterado

### 1. Nova Edge Function: `supabase/functions/gemini-generate-pip/index.ts`
- Recebe `prompt` (string) e `reference_images` (array opcional de strings base64)
- Chama a Lovable AI Gateway com o modelo **`google/gemini-3-pro-image-preview`**
- Inclui instrucao de sistema para gerar imagem em proporcao 16:9 (1280x720), alta qualidade, estilo fotografico
- Retorna a imagem gerada em base64
- Tratamento de erros 429 (rate limit) e 402 (creditos insuficientes)

### 2. Novo componente: `src/components/cortes/PipAiGenerator.tsx`
- Textarea para digitar o prompt
- Botao de anexar imagens de referencia (multiplas imagens aceitas)
- Preview das imagens anexadas com botao de remover cada uma
- Botao "Gerar com IA" que chama a edge function
- Loading state com spinner durante a geracao
- Callback `onImageGenerated(base64DataUrl)` para alimentar o PIP

### 3. Alterar `src/components/cortes/CortesThumbBuilder.tsx`
- Adicionar funcao `handlePipFromBase64(base64: string)` que recebe o data URL gerado pela IA, define como `pipImage` e calcula o auto-scale reutilizando a mesma logica do `handlePipUpload`
- Passar esse handler como nova prop `onPipFromBase64` para `CortesControls`

### 4. Alterar `src/components/cortes/CortesControls.tsx`
- Receber nova prop `onPipFromBase64`
- Nos modelos que usam PIP (`pip`, `pip-dividido`, `jogo-pip-duplo`), renderizar o componente `PipAiGenerator` abaixo do botao de upload do PIP
- Conectar o callback do gerador ao `onPipFromBase64`

## Fluxo do usuario

```text
1. Usuario esta em um modelo com PIP (pip, pip-dividido, jogo-pip-duplo)
2. Abaixo do botao "Upload PIP", ve a secao "Gerar PIP com IA"
3. Digita o prompt (ex: "campo de futebol lotado a noite com luzes")
4. Opcionalmente anexa imagens de referencia clicando no icone de anexo
5. Clica em "Gerar com IA"
6. Aguarda o loading (pode levar alguns segundos -- o modelo Pro e mais lento porem com maior qualidade)
7. A imagem gerada e automaticamente inserida como imagem do PIP
```

## Detalhes tecnicos

- **Modelo**: `google/gemini-3-pro-image-preview` -- maior qualidade de geracao de imagens, mais lento que o flash
- **Prompt do sistema**: Instrui o modelo a gerar imagem em 16:9, alta qualidade, estilo fotografico/realista
- **Imagens de referencia**: Enviadas como partes `image_url` no array de content, junto com o texto do prompt
- **Auto-scale**: Reutiliza a mesma logica de calculo de escala que existe no `handlePipUpload` (baseada na proporcao container vs imagem)
- **Secret**: Usa `LOVABLE_API_KEY` que ja esta configurado
- **config.toml**: Nao precisa ser editado manualmente (gerenciado automaticamente)

