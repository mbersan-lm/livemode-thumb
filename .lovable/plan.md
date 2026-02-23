

# Layout 50/50 na tela de Melhores Momentos / Jogo Completo

## Arquivo: `src/pages/Index.tsx`

### 1. Calculo de escala (linha ~108)

Trocar `window.innerWidth - 380 - 32` por `(window.innerWidth / 2) - 32`:

```typescript
const availableWidth = window.innerWidth >= 768
  ? (window.innerWidth / 2) - 32
  : window.innerWidth - 16;
```

### 2. Container do canvas (linha ~122)

Trocar `flex-1` por `md:w-1/2`:

```
// Antes
className={`... ${isMobile ? '' : 'flex-1'}`}

// Depois
className={`... ${isMobile ? '' : 'md:w-1/2'}`}
```

### 3. Container do painel de controles (linha ~142)

Trocar `md:w-[380px]` e `md:flex-none` por `md:w-1/2`:

```
// Antes
className="w-full md:w-[380px] ... flex-1 md:flex-none"

// Depois
className="w-full md:w-1/2 ... flex-1 md:flex-none"
```

## Resultado

- Desktop: preview e controles divididos igualmente em 50/50
- Mobile: sem alteracao
- Apenas `src/pages/Index.tsx` e modificado

