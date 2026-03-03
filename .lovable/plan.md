

## Plano: Corrigir renderização de texto na exportação de Cortes

### Problema
O texto exportado pelo servidor Railway está renderizando diferente do preview. O componente `CortesCanvas` possui um algoritmo de auto-fit que calcula o `fontSize` dinamicamente via medição do DOM (`scrollHeight > clientHeight`). Esse cálculo roda independentemente tanto no preview do navegador quanto no Playwright do servidor, e diferenças sutis na renderização da fonte entre os dois ambientes resultam em tamanhos e quebras de linha diferentes.

### Solução
Enviar o `fontSize` já calculado pelo preview como parte do state de exportação, e fazer o `CortesCanvas` aceitar um `fontSize` opcional externo que pula o auto-fit.

### Alterações

**1. `src/components/cortes/CortesCanvas.tsx`**
- Adicionar prop opcional `fixedFontSize?: number` (e `fixedFontSizeLeft?`, `fixedFontSizeRight?` para meio-a-meio)
- Quando `fixedFontSize` estiver presente, usá-lo diretamente sem rodar o auto-fit

**2. `src/components/cortes/CortesCanvas.tsx`**
- Expor o `fontSize` calculado via um callback ou ref imperativo, para que o `CortesThumbBuilder` possa capturá-lo
- Alternativa mais simples: adicionar um `ref` callback `onFontSizeComputed`

**3. `src/components/cortes/CortesThumbBuilder.tsx`**
- Capturar o `fontSize` computado pelo canvas e incluí-lo no `currentCanvasProps`

**4. `src/components/cortes/CortesControls.tsx`**
- Incluir `fixedFontSize` (e variantes left/right) no payload de `handleExport`

**5. `src/pages/Render.tsx`**
- Passar `fixedFontSize` ao `CortesCanvas` no case `'cortes'`

### Abordagem técnica
A forma mais limpa é usar um `useImperativeHandle` ou simplesmente adicionar um callback prop `onFontSizeChange` ao `CortesCanvas` que reporta o fontSize computado. O builder captura esse valor e o inclui no state de exportação. Na renderização do servidor, o `CortesCanvas` recebe o fontSize pré-computado e não roda o auto-fit.

