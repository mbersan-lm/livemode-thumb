

# Ampliar Largura Horizontal do Texto na Thumb "Cortes"

## Mudanca

### Arquivo: `src/components/cortes/CortesCanvas.tsx`

Ajustar o container de texto (Layer 5, linhas 148-168) para ocupar mais largura horizontal:

- `left: '5%'` → `left: '2%'` (mais proximo da borda esquerda)
- `width: '90%'` → `width: '96%'` (ocupa 96% da largura total)

Isso deixa 2% de margem em cada lado (25.6px de cada lado no canvas de 1280px), que somado ao `padding: 20px` interno garante uma margem segura e bonita para o stroke de 15px.

Nenhuma outra mudanca necessaria -- o autofit e o stroke continuam funcionando normalmente.
