

# Adicionar card personalizado para "Geral CazéTv Brasil"

## Mudanças

### 1. Assets
- Copiar `user-uploads://CORTE_LISTA_CONVOCADOS.jpg` para `public/cortes/bg-card-brasil.jpg`
- Copiar `user-uploads://LOGO.png` para `public/cortes/logo-brasil.png`

### 2. `src/pages/CortesHub.tsx` (linhas 82-84)
Estender as condições de `logoUrl`, `bgImageUrl` e `bgOpacity` para incluir "Geral CazéTv Brasil":

```typescript
logoUrl={
  p.name === 'Roda de Bobo' ? '/cortes/logo-rdb.png'
  : p.name === 'Geral CazéTv' ? '/cortes/logo-geral.png'
  : p.name === 'Geral CazéTv Brasil' ? '/cortes/logo-brasil.png'
  : undefined
}
bgImageUrl={
  p.name === 'Roda de Bobo' ? '/cortes/bg-card-rdb.png'
  : p.name === 'Geral CazéTv' ? '/cortes/bg-card-geral.jpg'
  : p.name === 'Geral CazéTv Brasil' ? '/cortes/bg-card-brasil.jpg'
  : undefined
}
bgOpacity={p.name === 'Geral CazéTv' || p.name === 'Geral CazéTv Brasil' ? 1 : undefined}
```

Resultado: card com fundo verde/amarelo a 100% de opacidade e logo "Geral CazéTV" centralizada, sem textos.

