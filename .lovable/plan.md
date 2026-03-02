

## Plano: Limitar altura do lettering a 50% — exceto Thumb Principal do Roda de Bobo

### Alterações

1. **`CortesCanvas.tsx`**:
   - Linha 565: `maxHeight: '38%'` → `maxHeight: '50%'` (texto padrão — este bloco já não renderiza para thumb-principal do RdB)
   - Linha 677: `maxHeight: '40%'` → `maxHeight: '50%'` (texto esquerdo meio-a-meio)
   - Linha 712: `maxHeight: '40%'` → `maxHeight: '50%'` (texto direito meio-a-meio)
   - Linha 608: `maxHeight: 200` — **não alterar** (este é o bloco do Roda de Bobo com quadrant grid)

2. **`CortesControls.tsx`** (export):
   - Linha 929: `H * 0.38` → `H * 0.50`
   - Linha 987: `H * 0.40` → `H * 0.50`
   - Linha 1000: `H * 0.40` → `H * 0.50`
   - O bloco de texto do Roda de Bobo (thumb-principal com quadrant grid) tem sua própria lógica separada e não será alterado.

### Arquivos alterados
- `src/components/cortes/CortesCanvas.tsx`
- `src/components/cortes/CortesControls.tsx`

