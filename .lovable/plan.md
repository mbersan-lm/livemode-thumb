
# Reverter PIP para objectFit: contain

## Mudanca

### Arquivo: `src/components/cortes/CortesCanvas.tsx`

- Linha 100: trocar `objectFit: 'cover'` de volta para `objectFit: 'contain'`

Isso restaura o comportamento anterior onde a imagem PIP e exibida por completo dentro do frame, sem cortes.
