
# Corrigir Export JPG dos Cortes

## Diagnóstico do Problema

O `html2canvas` captura o elemento `CANVAS_CORTES` (que tem 1280×720px em CSS), mas ele está envolto num container com `transform: scale(${canvasScale})` (tipicamente ~0.5). Embora o `onclone` remova o transform dos ancestrais, a posição do elemento clonado no documento ainda não é `(0,0)` — o html2canvas calcula as coordenadas de captura baseado na posição visual renderizada do elemento, que está deslocada/escalada.

Isso causa a distorção: o conteúdo aparece "maior" porque o html2canvas está capturando a partir de uma posição errada, resultando num crop incorreto do canvas real.

**Por que funciona no Melhores Momentos?** O layout do `Index.tsx` é diferente do `CortesThumbBuilder.tsx` — o overflow e estrutura flex do cortes interfere diferente.

## Solução

A abordagem mais confiável é usar a estratégia de **renderização offscreen**: no `onclone`, além de remover transforms dos pais, também reposicionamos o próprio elemento `CANVAS_CORTES` para `position: fixed; top: 0; left: 0; transform: none; z-index: 99999`, garantindo que o html2canvas sempre o encontre exatamente em `(0, 0)` do viewport.

Também corrigimos o `scrollX` e `scrollY` para usar os valores reais da janela negados (`-window.scrollX`, `-window.scrollY`).

## Mudanças Técnicas

### `src/components/cortes/CortesControls.tsx`

Atualizar a função `handleExport` para reposicionar o elemento clonado de forma absoluta:

```typescript
onclone: (clonedDoc) => {
  const el = clonedDoc.getElementById('CANVAS_CORTES');
  if (!el) return;

  // Neutraliza transforms de todos os ancestrais
  let parent = el.parentElement;
  while (parent && parent !== clonedDoc.body) {
    parent.style.transform = 'none';
    parent.style.position = 'static';
    (parent.style as any).zoom = '1';
    parent = parent.parentElement;
  }

  // Força o canvas clonado para a posição exata (0,0)
  el.style.position = 'fixed';
  el.style.top = '0';
  el.style.left = '0';
  el.style.transform = 'none';
  el.style.zIndex = '99999';
  el.style.margin = '0';
},
```

E ajustar o `scrollX`/`scrollY` para compensar scroll real:

```typescript
scrollX: -window.scrollX,
scrollY: -window.scrollY,
```

## Arquivos a modificar

- `src/components/cortes/CortesControls.tsx` — apenas a função `handleExport` (linhas 99–157)
