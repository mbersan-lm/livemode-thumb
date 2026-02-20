
# Correção de Tamanho de Escudos — Maccabi e 5 Times no Jogo Completo

## Problemas a Corrigir

### Problema 1 — Maccabi (Melhores Momentos + Jogo Completo)
O escudo do Maccabi aparece desproporcional em relação aos outros — muito grande — e está invadindo a área dos números do placar. O PNG do escudo provavelmente tem dimensões ou padding diferente dos outros times.

**Solução:** Definir um tamanho máximo menor especificamente para o Maccabi, sem precisar de um novo arquivo de imagem.

### Problema 2 — Basel, Estrela Vermelha, FSCB, Nottingham Forest, Red Bull Salzburg (Jogo Completo)
O container dos escudos no Jogo Completo inicia em `-top-[20px]` (20px acima da borda superior do canvas). Escudos mais altos ultrapassam o topo visível.

**Solução:** Reduzir o `maxHeight` individualmente para esses 5 escudos no contexto do Jogo Completo.

---

## Estratégia de Implementação

Adicionar dois campos opcionais na interface `Team` do arquivo `src/data/teams.ts`:
- `maxSize?: number` — tamanho máximo (px) para Melhores Momentos
- `jcMaxSize?: number` — tamanho máximo (px) para Jogo Completo

Esses campos sobrescrevem o padrão (216px / 322px) apenas quando definidos.

---

## Arquivos que serão modificados

### 1. `src/data/teams.ts`
Adicionar os campos opcionais `maxSize` e `jcMaxSize` na interface `Team`:
```typescript
export interface Team {
  id: string;
  name: string;
  slug: string;
  crest_url: string;
  maxSize?: number;    // sobrescreve max-w e max-h em Melhores Momentos
  jcMaxSize?: number;  // sobrescreve max-w e max-h em Jogo Completo
}
```

### 2. `src/data/teamsEuropaLeague.ts`
Aplicar os valores customizados nos times afetados:

**Maccabi** — tamanho reduzido em ambas as thumbs:
```typescript
{ id: 'el20', name: 'MACCABI', slug: 'maccabi', crest_url: '/crests/maccabi.png', maxSize: 140, jcMaxSize: 200 },
```

**5 times que vazam no Jogo Completo** — apenas `jcMaxSize` reduzido:
```typescript
{ id: 'el2',  name: 'BASEL',              ..., jcMaxSize: 260 },
{ id: 'el9',  name: 'ESTRELA VERMELHA',   ..., jcMaxSize: 260 },
{ id: 'el14', name: 'FSCB',               ..., jcMaxSize: 260 },
{ id: 'el24', name: 'NOTTINGHAM FOREST',  ..., jcMaxSize: 260 },
{ id: 'el30', name: 'RED BULL SALZBURG',  ..., jcMaxSize: 260 },
```
*(o valor 260px será ajustado fino conforme o resultado visual — pode ser 240px se ainda sobrar)*

### 3. `src/components/ThumbnailCanvas.tsx` (Melhores Momentos)
Usar `homeTeam.maxSize` e `awayTeam.maxSize` quando disponíveis:
```typescript
// Home Crest
className={`h-auto w-auto object-contain -mr-[42px]`}
style={{ 
  maxWidth: `${homeTeam.maxSize ?? 216}px`, 
  maxHeight: `${homeTeam.maxSize ?? 216}px` 
}}

// Away Crest
className={`h-auto w-auto object-contain -ml-[42px]`}
style={{ 
  maxWidth: `${awayTeam.maxSize ?? 216}px`, 
  maxHeight: `${awayTeam.maxSize ?? 216}px` 
}}
```

### 4. `src/components/ThumbnailCanvasJogoCompleto.tsx` (Jogo Completo)
Usar `homeTeam.jcMaxSize` e `awayTeam.jcMaxSize` quando disponíveis:
```typescript
// Home Crest
style={{ 
  maxWidth: `${homeTeam.jcMaxSize ?? 322}px`, 
  maxHeight: `${homeTeam.jcMaxSize ?? 322}px` 
}}

// Away Crest
style={{ 
  maxWidth: `${awayTeam.jcMaxSize ?? 322}px`, 
  maxHeight: `${awayTeam.jcMaxSize ?? 322}px` 
}}
```

---

## Resultado esperado

| Time | Melhores Momentos | Jogo Completo |
|------|------------------|---------------|
| Maccabi | Reduzido (≤140px) — proporcional aos outros | Reduzido (≤200px) — com espaço |
| Basel | Sem alteração (216px) | Reduzido (≤260px) — dentro do canvas |
| Estrela Vermelha | Sem alteração | Reduzido (≤260px) |
| FSCB | Sem alteração | Reduzido (≤260px) |
| Nottingham Forest | Sem alteração | Reduzido (≤260px) |
| Red Bull Salzburg | Sem alteração | Reduzido (≤260px) |
| Todos os outros | Sem alteração (216px) | Sem alteração (322px) |

## O que NÃO muda
- Nomes dos times
- Slugs e caminhos dos escudos
- Layout geral das thumbs
- Outros templates (Brasileirão, Ligue 1, etc.)
- Nenhum arquivo de imagem precisa ser substituído
