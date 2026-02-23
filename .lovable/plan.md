
# Remover "Foto de fundo" de todos os modelos exceto "Lettering Simples"

## O que muda

Atualmente o campo "Foto de fundo" aparece em todos os modelos. Precisa aparecer **apenas** no modelo `so-lettering` (Lettering Simples).

## Arquivo: `src/components/cortes/CortesControls.tsx`

### 1. Bloco do "duas-pessoas" (linhas ~1122-1142)

Remover o bloco de upload de fundo que aparece dentro do `thumbModel === 'duas-pessoas'`.

### 2. Bloco geral (linhas ~1365-1387)

Alterar a condicao de `thumbModel !== 'duas-pessoas'` para `thumbModel === 'so-lettering'`, restringindo o campo apenas ao Lettering Simples. O label tambem perde o "(opcional)" ja que agora so aparece nesse modelo.

**Antes:**
```
{thumbModel !== 'duas-pessoas' && (
  <div className="space-y-2">
    <Label className="font-semibold">
      Foto de fundo{thumbModel === 'so-lettering' ? '' : ' (opcional)'}
    </Label>
    ...
  </div>
)}
```

**Depois:**
```
{thumbModel === 'so-lettering' && (
  <div className="space-y-2">
    <Label className="font-semibold">Foto de fundo</Label>
    ...
  </div>
)}
```

## Resultado

- "Foto de fundo" aparece **somente** no modelo "Lettering Simples"
- Todos os outros modelos (PIP, Duas pessoas, Meio a meio, Jogo v1, PIP duplo) nao mostram mais esse campo
- Nenhum outro arquivo e modificado
