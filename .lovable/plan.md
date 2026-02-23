

# Botao de navegacao "Melhores Momentos / Cortes" mais visivel

## Problema atual
A navegacao entre "Melhores Momentos" e "Cortes" e feita por links pequenos em texto cinza (`text-xs text-muted-foreground`), quase invisiveis no header da interface.

## Solucao
Transformar esses links em botoes estilizados com o componente `Button`, usando o visual `outline` com borda branca e bordas arredondadas que ja existem no design system.

## Alteracoes

### 1. `src/pages/Index.tsx` (linha 168)
- Substituir o `<a>` texto "Cortes →" por um `Button` com variante `outline`, icone de seta e texto claro
- Estilo: borda branca, texto branco, hover com fundo sutil

**De:**
```
<a href="/cortes" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
  Cortes →
</a>
```

**Para:**
```
<a href="/cortes">
  <Button variant="outline" size="sm" className="gap-1.5">
    Cortes <ArrowRight className="w-3.5 h-3.5" />
  </Button>
</a>
```

### 2. `src/pages/CortesHub.tsx` (linha 67)
- Substituir o `<a>` texto "← Melhores Momentos" por um `Button` com variante `outline`

**De:**
```
<a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
  <ArrowLeft className="w-4 h-4" /> Melhores Momentos
</a>
```

**Para:**
```
<a href="/">
  <Button variant="outline" size="sm" className="gap-1.5">
    <ArrowLeft className="w-3.5 h-3.5" /> Melhores Momentos
  </Button>
</a>
```

### 3. `src/components/cortes/CortesThumbBuilder.tsx` (linha 345)
- Substituir o `<a>` texto "← Voltar" por um `Button` com variante `outline`

**De:**
```
<a href={backUrl} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
  ← Voltar
</a>
```

**Para:**
```
<a href={backUrl}>
  <Button variant="outline" size="sm" className="gap-1.5">
    <ArrowLeft className="w-3.5 h-3.5" /> Voltar
  </Button>
</a>
```

## Imports necessarios
- `Index.tsx`: adicionar `import { ArrowRight } from 'lucide-react'` e `import { Button } from '@/components/ui/button'`
- `CortesThumbBuilder.tsx`: adicionar `import { ArrowLeft } from 'lucide-react'` e `import { Button } from '@/components/ui/button'`
- `CortesHub.tsx`: ja importa `Button` e `ArrowLeft`

## Resultado
Os botoes herdao automaticamente o estilo `rounded-full` com `border border-white/80` do design system, ficando visiveis e consistentes com o restante da interface.

## O que NAO muda
- Nenhuma logica, canvas, preview ou download
- Nenhum modelo de thumb
- Nenhuma cor ou fonte do design system

