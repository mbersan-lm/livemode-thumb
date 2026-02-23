
# Agrupar os 4 Quadrantes em um unico menu

## Objetivo
Agrupar os 4 quadrantes do modelo **Thumb Principal** dentro de um unico card/menu colapsavel, em vez de exibi-los como 4 blocos separados na interface.

## Mudancas

### Arquivo: `src/components/cortes/CortesControls.tsx`

**Estrutura atual (linhas ~1445-1500):**
Os 4 quadrantes sao renderizados como blocos individuais (`<div>`) diretamente no fluxo principal dos controles, sem agrupamento visual.

**Nova estrutura:**
Envolver os 4 quadrantes em um componente `Collapsible` (ja importado no arquivo) com:

1. **Cabecalho do menu**: Um trigger colapsavel com o titulo "Quadrantes" e o icone de seta (ChevronDown), seguindo o mesmo padrao visual dos outros menus colapsaveis do builder.

2. **Conteudo interno**: Os 4 cards de quadrante (que ja existem) ficam dentro do `CollapsibleContent`, organizados em um `space-y-3` para espa amento entre eles.

3. **Estilo do container**: Borda arredondada com fundo sutil (`rounded-lg border border-border bg-muted/20 p-3`), consistente com o restante da UI.

A logica interna de cada quadrante (upload de foto, toggle de visibilidade, sliders de ajuste) permanece identica -- apenas o agrupamento visual muda.

## Detalhes tecnicos

- Adicionar um estado `const [showQuadrantsMenu, setShowQuadrantsMenu] = useState(true)` para controlar se o menu inicia aberto ou fechado.
- Usar os componentes `Collapsible`, `CollapsibleTrigger` e `CollapsibleContent` que ja estao importados no arquivo.
- Nenhuma nova dependencia necessaria.
- Apenas o arquivo `CortesControls.tsx` sera modificado.
