

## Plano: Substituir logo da Kings League no template Melhores Momentos

### Contexto
O template Kings League usa um KV de fundo (`/kv/kv-kingsleague.png`) que já tem a logo da Kings League embutida. Para substituir a logo sem precisar recriar o KV inteiro, vamos adicionar a nova logo como uma camada sobreposta nos dois canvas (MM e Jogo Completo), posicionada sobre a logo existente no KV.

### Alterações

1. **Copiar asset**
   - `user-uploads://YELLOW_K_BRA_MAIN_B_3.png` → `public/kv/logo-kingsleague.png`

2. **`src/components/ThumbnailCanvas.tsx`**
   - Após o KV background `<img>`, adicionar uma camada condicional para `template === 'kingsleague'` que renderiza a nova logo posicionada sobre a logo original do KV (canto superior esquerdo, com zIndex 11 para ficar acima do KV mas abaixo do placar)

3. **`src/components/ThumbnailCanvasJogoCompleto.tsx`**
   - Mesma alteração condicional para o canvas de Jogo Completo

### Nota
O posicionamento exato (top, left, width) será ajustado para cobrir a logo original no KV. Pode ser necessário iterar no posicionamento após a primeira implementação.

