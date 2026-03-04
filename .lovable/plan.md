

## Plano: Substituir overlay de Som Ambiente

### Alteração

1. **Copiar a imagem enviada para o projeto**
   - Copiar `user-uploads://AO_VIVO_COM_IMAGNES.png` para `public/kv/overlay-som-ambiente.png` (substituindo o arquivo atual)

2. **Nenhuma alteração de código necessária**
   - O componente `ThumbnailCanvasAoVivo` já referencia `/kv/overlay-som-ambiente.png` no overlay de Som Ambiente (zIndex 100), então basta substituir o arquivo.

