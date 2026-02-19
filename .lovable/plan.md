
# Corrigir Export JPG — Aguardar Carregamento Real das Imagens

## Diagnóstico Definitivo

O container offscreen é criado corretamente, o `CortesCanvas` é renderizado lá — mas a captura acontece antes das imagens (base64/PNG) terminarem de carregar no DOM. O `document.fonts.ready` só aguarda fontes, não imagens.

Observe no JPG exportado: a estrutura está correta (logos, layout, texto), mas as fotos (PIP e pessoa) não aparecem — exatamente o comportamento de imagens que ainda não carregaram quando o `html2canvas` fez a captura.

Além disso, os `useEffect` que calculam o `fontSize` do texto dentro do `CortesCanvas` são assíncronos — se o canvas renderiza e o html2canvas captura antes desses effects rodarem, o texto aparece em tamanho errado.

## Solução

Após o `root.render`, ao invés de aguardar apenas um `setTimeout` fixo de 600ms:

1. **Aguardar todas as imagens** do container offscreen terminarem de carregar com `Promise.all` sobre os eventos `load` de cada `<img>` cujo `complete` ainda é falso.
2. **Aumentar o delay mínimo** para 1000ms para garantir que os `useEffect` de auto-fit de fonte rodem.
3. **Aguardar `document.fonts.ready`** antes do delay (não depois).

```typescript
// Após root.render — aguarda fontes + imagens
await document.fonts.ready;

// Aguarda um ciclo de render dos useEffects
await new Promise(resolve => setTimeout(resolve, 1000));

// Aguarda todas as imagens no container offscreen
const images = Array.from(offscreen.querySelectorAll('img'));
await Promise.all(
  images.map(
    (img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res(); // resolve mesmo em erro para não travar
          })
  )
);
```

## Arquivos a Modificar

- `src/components/cortes/CortesControls.tsx` — apenas a função `handleExport`, substituindo a lógica de espera atual (linhas 124–213)

## Mudança específica

Substituir:
```typescript
await new Promise<void>((resolve) => {
  root.render(<CortesCanvas ... />);
  setTimeout(resolve, 600);
});
await document.fonts.ready;
```

Por:
```typescript
root.render(<CortesCanvas ... />);
await document.fonts.ready;
await new Promise(resolve => setTimeout(resolve, 1000));

// Aguarda carregamento real de todas as imagens
const imgs = Array.from(offscreen.querySelectorAll('img'));
await Promise.all(
  imgs.map(img =>
    img.complete
      ? Promise.resolve()
      : new Promise<void>(res => { img.onload = res; img.onerror = res; })
  )
);
```
