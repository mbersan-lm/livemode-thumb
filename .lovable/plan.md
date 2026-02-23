

# Layout 50/50 na tela de Cortes

## O que muda

Apenas o layout do `CortesThumbBuilder.tsx` -- a divisao entre o preview da thumbnail e o painel de controles passa de "canvas flex-1 + painel fixo 380px" para "50% / 50%".

## Alteracoes no arquivo `src/components/cortes/CortesThumbBuilder.tsx`

### 1. Calculo de escala do canvas (linha 95)

Trocar `window.innerWidth - 380 - 32` por `(window.innerWidth / 2) - 32` para que o canvas se dimensione com base em metade da tela:

```typescript
const availableWidth = window.innerWidth >= 768
  ? (window.innerWidth / 2) - 32
  : window.innerWidth - 16;
```

### 2. Container do canvas (linha 273)

Trocar `flex-1` por `md:w-1/2`:

```
// Antes
className={`... shrink-0 ${isMobile ? '' : 'flex-1'}`}

// Depois
className={`... shrink-0 ${isMobile ? '' : 'md:w-1/2'}`}
```

### 3. Container do painel de controles (linha 308)

Trocar `md:w-[380px]` e `md:flex-none` por `md:w-1/2`:

```
// Antes
className="w-full md:w-[380px] ... flex-1 md:flex-none overflow-hidden"

// Depois
className="w-full md:w-1/2 ... flex-1 md:flex-none overflow-hidden"
```

## Resultado

- Desktop: tela dividida igualmente -- 50% preview, 50% controles
- Mobile: sem alteracao -- continua empilhado verticalmente
- Nenhum outro arquivo e modificado
