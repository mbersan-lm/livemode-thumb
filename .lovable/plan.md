

## Plano: Corrigir fonte personalizada ausente na exportação

### Problema raiz
O programa "Live CazéTv" usa uma fonte personalizada (`CustomFont-8f7747ce`) carregada de uma URL do Supabase Storage. No preview do navegador, o `CortesProgramBuilder` carrega essa fonte dinamicamente via `FontFace` API. Porém, na exportação via Railway, a `font_url` nunca é enviada no payload — o servidor não tem a fonte e renderiza com fallback (sans-serif genérico), resultando em texto completamente diferente.

O `fixedFontSize` implementado anteriormente funciona corretamente, mas não resolve este caso porque o **tipo de fonte** é diferente, não apenas o tamanho.

### Solução
Propagar a `font_url` desde o banco de dados até o servidor de exportação, e carregá-la dinamicamente no `Render.tsx` antes de marcar o frame como pronto.

### Alterações

**1. `src/components/cortes/CortesThumbBuilder.tsx`**
- Adicionar prop `fontUrl?: string`
- Incluir `fontUrl` no objeto `currentCanvasProps`

**2. `src/pages/CortesProgramBuilder.tsx`**
- Passar `fontUrl={program.font_url || undefined}` ao `CortesThumbBuilder`

**3. `src/components/cortes/CortesControls.tsx`**
- Adicionar `fontUrl?: string` à interface `CurrentCanvasProps`
- Incluir `fontUrl: props.fontUrl` no payload de `handleExport`

**4. `src/pages/Render.tsx`**
- No case `'cortes'`, antes de marcar `ready=true`, verificar se `state.fontUrl` e `state.customFontFamily` existem
- Se sim, carregar a fonte via `FontFace` API:
```ts
if (state.fontUrl && state.customFontFamily) {
  const fontName = state.customFontFamily.replace(/'/g, '');
  const font = new FontFace(fontName, `url(${state.fontUrl})`);
  await font.load();
  document.fonts.add(font);
}
```
- Isso garante que a fonte esteja disponível antes do screenshot

### Impacto
- Corrige a exportação de TODOS os programas com fonte personalizada (Live CazéTv e qualquer outro criado pelo usuário)
- Programas com fontes built-in (Clash Grotesk, General Sans) já funcionam porque estão no `index.css`
- Requer re-deploy no Railway após a alteração

