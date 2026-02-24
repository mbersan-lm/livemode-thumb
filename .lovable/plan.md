

# Diminuir opacidade da borda dos painéis de escudos para 35%

## Resumo
Alterar a borda branca dos dois retângulos glass (esquerdo e direito) onde ficam os escudos dos times, de 100% de opacidade para 35% (`rgba(255,255,255,0.35)`). A alteração será feita tanto no preview quanto no export para manter paridade visual.

## Alterações

### 1. Preview — `src/components/ThumbnailCanvasAoVivo.tsx`

Nos dois painéis glass (left e right), trocar:
- `border: '1px solid white'` por `border: '1px solid rgba(255,255,255,0.35)'`

Linhas afetadas: ~183 (painel esquerdo) e ~200 (painel direito).

### 2. Export — `src/pages/AoVivo.tsx`

Na função `drawGlassPanel`, trocar:
- `ctx.strokeStyle = 'white'` por `ctx.strokeStyle = 'rgba(255,255,255,0.35)'`

Linha afetada: ~209.

O painel glass preto (bottom-left) permanece inalterado.
