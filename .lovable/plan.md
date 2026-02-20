
# Resetar Tamanho dos Escudos da Europa League

## O que será feito

Remover a condição especial `template === 'europaleague' ? 'max-w-[600px] max-h-[600px]'` que foi adicionada anteriormente, deixando os escudos da Europa League com o mesmo tamanho padrão dos outros templates.

Os nomes dos times em `src/data/teamsEuropaLeague.ts` **não serão alterados**.

## Arquivos que serão modificados

### 1. `src/components/ThumbnailCanvas.tsx` (Melhores Momentos)
- **Linha 102** — Home Crest: remover a condicional europaleague, manter sempre `max-w-[216px] max-h-[216px]`
- **Linha 130** — Away Crest: remover a condicional europaleague, manter sempre `max-w-[216px] max-h-[216px]`

**Antes:**
```
className={`h-auto w-auto object-contain -mr-[42px] ${template === 'europaleague' ? 'max-w-[600px] max-h-[600px]' : 'max-w-[216px] max-h-[216px]'}`}
```
**Depois:**
```
className="h-auto w-auto object-contain -mr-[42px] max-w-[216px] max-h-[216px]"
```

### 2. `src/components/ThumbnailCanvasJogoCompleto.tsx` (Jogo Completo)
- **Linha 102** — Home Crest: remover a condicional europaleague, manter sempre `max-w-[322px] max-h-[322px]`
- **Linha 110** — Away Crest: remover a condicional europaleague, manter sempre `max-w-[322px] max-h-[322px]`

**Antes:**
```
className={`h-auto w-auto object-contain ${template === 'europaleague' ? 'max-w-[600px] max-h-[600px]' : 'max-w-[322px] max-h-[322px]'}`}
```
**Depois:**
```
className="h-auto w-auto object-contain max-w-[322px] max-h-[322px]"
```

## O que NÃO será alterado
- `src/data/teamsEuropaLeague.ts` — nomes e slugs dos 36 times permanecem intactos
- Nenhuma lógica de template ou KV será modificada
- Os arquivos de escudo existentes em `public/crests/` serão substituídos quando você enviar os novos PNGs
