

# Remover degradê inferior do modelo Thumb Principal (Roda de Bobo)

## O que será feito
Remover o gradiente escuro que sobe de baixo para cima (overlay cinza/preto com opacidade) exclusivamente no modelo "Thumb Principal". Os demais modelos continuarão com o gradiente normalmente.

## Alterações técnicas

### 1. Preview — `src/components/cortes/CortesCanvas.tsx` (linhas 473-485)

Envolver o `div` do gradiente inferior com uma condição `!showThumbPrincipal` para que ele não seja renderizado quando o modelo for "thumb-principal".

```text
// Antes:
{/* Layer 3.5: Bottom gradient overlay */}
<div style={{ ... background: 'linear-gradient(...)' }} />

// Depois:
{!showThumbPrincipal && (
  {/* Layer 3.5: Bottom gradient overlay */}
  <div style={{ ... background: 'linear-gradient(...)' }} />
)}
```

### 2. Export Canvas — `src/components/cortes/CortesControls.tsx` (linhas 855-860)

Envolver o bloco que desenha o gradiente no Canvas com `if (!showThumbPrincipal)` para pular essa camada na exportação.

```text
// Antes:
// ── Layer 4: Gradiente inferior
const grad = ctx.createLinearGradient(0, H * 0.55, 0, H);
...
ctx.fillRect(0, H * 0.55, W, H * 0.45);

// Depois:
if (!showThumbPrincipal) {
  const grad = ctx.createLinearGradient(0, H * 0.55, 0, H);
  ...
  ctx.fillRect(0, H * 0.55, W, H * 0.45);
}
```

## Resultado
O modelo Thumb Principal (Roda de Bobo) não terá mais o degradê escuro vindo de baixo, mantendo o fundo limpo. Todos os outros modelos permanecem inalterados.
