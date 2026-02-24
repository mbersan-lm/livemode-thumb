

# Esconder overlay "Ao Vivo" quando "Som ambiente" estiver ativo

## O que sera feito

Quando o switch "Som ambiente" estiver ligado, o overlay `overlay-ao-vivo-panels.png` (que contem o visual "Ao Vivo" com os paineis) sera ocultado. Assim, apenas o overlay de "Som ambiente" aparecera sobre a thumb.

## Detalhes Tecnicos

**Arquivo modificado:**
- `src/components/ThumbnailCanvasAoVivo.tsx`

**Alteracao:**
- Envolver o `<img>` do overlay `overlay-ao-vivo-panels.png` (linha 158-164) com uma condicao `{!showSomAmbiente && ...}`, fazendo com que ele desapareca quando o switch estiver ativado.

Nenhum outro arquivo precisa ser alterado, pois a prop `showSomAmbiente` ja esta disponivel no componente.
