
# Remoção automática de fundo após Gemini Upscale

## Objetivo
Após o Gemini melhorar a foto da pessoa (upscale), o sistema deve automaticamente remover o fundo da imagem resultante usando a API do PhotoRoom, garantindo que o recorte sempre fique com fundo transparente.

## O que muda

Arquivo: **src/components/cortes/CortesThumbBuilder.tsx**

### 1. Criar função auxiliar `removeBgFromBase64`
Uma nova função que aceita uma string base64 (ao invés de um File) e chama a edge function `photoroom-remove-bg` para remover o fundo. Isso é necessário porque o resultado do Gemini já vem em base64.

### 2. Atualizar `handleUpscalePerson`
Após receber a imagem melhorada do Gemini, chamar `removeBgFromBase64` antes de definir o estado. O toast de sucesso será atualizado para refletir as duas etapas ("Imagem melhorada e fundo removido!").

### 3. Atualizar `handleUpscalePerson2`
Mesma lógica aplicada para a pessoa 2 -- após o upscale do Gemini, remover o fundo automaticamente antes de salvar o cutout.

## Fluxo atualizado

```text
Usuário clica "Melhorar com Gemini"
  --> Envia imagem para edge function gemini-upscale
  --> Recebe imagem melhorada (com fundo)
  --> Automaticamente envia para photoroom-remove-bg
  --> Recebe imagem sem fundo
  --> Atualiza o estado do cutout
```

## Detalhes Tecicos

- A nova funcao `removeBgFromBase64(base64: string): Promise<string>` reutiliza a mesma edge function `photoroom-remove-bg` que ja existe, apenas passando o base64 diretamente sem precisar converter de File.
- Os estados de loading (`isUpscalingPerson` / `isUpscalingPerson2`) continuam cobrindo todo o processo (upscale + remocao de fundo).
- Em caso de erro na remocao de fundo, o sistema ainda salva a imagem melhorada do Gemini (com fundo) como fallback, exibindo um aviso.
