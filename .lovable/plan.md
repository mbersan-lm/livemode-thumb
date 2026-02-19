
# Corrigir Export JPG — Renderização Offscreen Real

## Diagnóstico do Problema Atual

O `onclone` que força `position: fixed; top: 0; left: 0` no elemento clonado ainda não é suficiente. O `html2canvas` opera sobre um clone do documento inteiro e calcula o viewport de captura baseado no **elemento original** no documento real — não no clonado. Como o elemento original está dentro de um `div` com `transform: scale(0.5)`, o `html2canvas` ainda usa as coordenadas erradas.

**Por que funciona no Melhores Momentos (`Index.tsx`)?** O layout lá não usa `transform: scale()` no container do canvas, então as coordenadas coincidem.

## Solução: Renderização Offscreen Real

A abordagem correta é:

1. Criar um `div` container **fora do fluxo visual** (`position: fixed; left: -9999px; top: 0; width: 1280px; height: 720px; overflow: hidden; z-index: -1`) e anexá-lo ao `document.body`
2. Usar `ReactDOM.render` / `createRoot` para renderizar uma cópia do `CortesCanvas` nesse container, com as mesmas props atuais
3. Aguardar fonts e imagens carregarem (via `document.fonts.ready`)
4. Rodar `html2canvas` **nesse container offscreen** (que nunca teve scale nem transform)
5. Remover o container após captura

Isso garante que o `html2canvas` sempre veja o canvas em `(0,0)` sem nenhuma transformação, produzindo um JPG idêntico ao preview.

## Implementação

### Mudanças em `src/components/cortes/CortesThumbBuilder.tsx`

Exportar as props do estado atual e passar uma função `onExport` para `CortesControls`, que faz a renderização offscreen via `createRoot`.

### Mudanças em `src/components/cortes/CortesControls.tsx`

Substituir o `handleExport` por uma função que:

```typescript
const handleExport = async () => {
  toast.loading('Gerando JPG...');
  await document.fonts.ready;

  // Cria container offscreen
  const offscreen = document.createElement('div');
  offscreen.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 1280px;
    height: 720px;
    overflow: hidden;
    z-index: -1;
  `;
  document.body.appendChild(offscreen);

  // Renderiza CortesCanvas no container offscreen com as props atuais
  const root = createRoot(offscreen);
  root.render(<CortesCanvas {...currentProps} />);

  // Aguarda render
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    const canvas = await html2canvas(offscreen, {
      width: 1280,
      height: 720,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0C0C20',
      logging: false,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });
    // download...
  } finally {
    root.unmount();
    document.body.removeChild(offscreen);
  }
};
```

### Interface de Props

Para isso funcionar, `CortesControls` precisará receber as props do canvas atual para passá-las ao `CortesCanvas` no container offscreen:

```typescript
// Novas props em CortesControlsProps
currentCanvasProps: {
  thumbModel: ThumbModel;
  pipImage: string | null;
  personCutout: string | null;
  person2Cutout: string | null;
  thumbText: string;
  thumbTextLeft: string;
  thumbTextRight: string;
  pipTransform: TransformState;
  personTransform: TransformState;
  person2Transform: TransformState;
  pipFrame: PipFrameState;
  bgImage?: string;
  logosImage?: string;
  textColor?: string;
  strokeColor?: string;
  pipBorderColor?: string;
  highlightColor?: string;
  customFontFamily?: string;
}
```

## Arquivos a Modificar

- `src/components/cortes/CortesControls.tsx` — substituir `handleExport` por renderização offscreen com `createRoot`
- `src/components/cortes/CortesThumbBuilder.tsx` — passar prop `currentCanvasProps` para `CortesControls` com o estado atual
