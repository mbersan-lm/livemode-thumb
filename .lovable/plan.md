

## Problema

A prop `thumbPrincipalLogosImage` não tem um valor definido para "Geral CazéTv Brasil" — retorna `undefined`, o que faz cair na logo padrão do programa. O usuário quer uma logo exclusiva para a Thumb Principal desse programa, que é a imagem enviada em anexo.

## Solução

1. Copiar a imagem enviada para `public/cortes/logos-thumb-principal-brasil.png`.
2. Em `src/pages/CortesProgramBuilder.tsx`, adicionar o caso "Geral CazéTv Brasil" na lógica de `thumbPrincipalLogosImage`.

### Mudanças:

**Arquivo de asset:** Copiar `user-uploads://GERAL_THUMB_14-10.jpg` para `public/cortes/logos-thumb-principal-brasil.png`.

**`src/pages/CortesProgramBuilder.tsx` (linhas 62-66):**

De:
```typescript
thumbPrincipalLogosImage={
  program!.name === 'Geral CazéTv' ? '/cortes/logos-thumb-principal.png'
  : program!.name === 'Roda de Bobo' ? '/cortes/logos-thumb-principal-rdb.png'
  : undefined
}
```

Para:
```typescript
thumbPrincipalLogosImage={
  program!.name === 'Geral CazéTv' ? '/cortes/logos-thumb-principal.png'
  : program!.name === 'Geral CazéTv Brasil' ? '/cortes/logos-thumb-principal-brasil.png'
  : program!.name === 'Roda de Bobo' ? '/cortes/logos-thumb-principal-rdb.png'
  : undefined
}
```

Nenhum outro arquivo precisa ser alterado. A lógica em `CortesThumbBuilder` já seleciona `thumbPrincipalLogosImage` quando o modelo é `thumb-principal`.

