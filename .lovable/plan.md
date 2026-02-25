

# Alterar opacidade do fundo do card "Geral CazéTv" para 100%

Atualmente, todos os cards com imagem de fundo usam `opacity: 0.7` fixo (linha 26 do ProgramCard). Para que o "Geral CazéTv" tenha 100% e o "Roda de Bobo" mantenha 70%, preciso adicionar uma prop `bgOpacity` ao componente.

## Mudanças

**`src/components/cortes/ProgramCard.tsx`**
- Adicionar prop opcional `bgOpacity?: number` (default `0.7`)
- Usar essa prop no style do div de background em vez do valor fixo `0.7`

**`src/pages/CortesHub.tsx`**
- Passar `bgOpacity={1}` no ProgramCard do "Geral CazéTv"
- O "Roda de Bobo" continua sem a prop (usa o default 0.7)

