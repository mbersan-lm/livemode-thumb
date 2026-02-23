

# Adicionar logo negativa para programas Geral CazéTv

## O que sera feito

Salvar a logo negativa enviada no projeto e ativar a opcao de troca positiva/negativa nos programas "Geral CazéTv" e "Geral CazéTv Brasil", igual ja funciona no "Roda de Bobo".

## Alteracoes

### 1. Novo asset
- Copiar a imagem enviada para `public/cortes/logos-geral-negativa.png`

### 2. Arquivo: `src/pages/CortesProgramBuilder.tsx`
- Adicionar a prop `logosNegativeImage` no componente `CortesThumbBuilder` quando o programa for "Geral CazéTv" ou "Geral CazéTv Brasil"
- Valor: `"/cortes/logos-geral-negativa.png"`
- Logica: condicional pelo nome do programa, similar ao que ja e feito para `divisoriaImage` e `allowAllModels`

Nenhuma alteracao no banco de dados ou em outros arquivos e necessaria -- a infraestrutura de troca de logo (seletor, estado, renderizacao) ja existe no `CortesThumbBuilder` e `CortesControls`.

