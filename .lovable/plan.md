

## Plan: Diminuir escudo Lecce em 10% no modelo Melhores Momentos

### O que será feito
Reduzir o tamanho do escudo do Lecce em 10% no modelo "Melhores Momentos", adicionando a propriedade `maxSize` ao time.

### Alteração técnica

**Arquivo: `src/data/teamsSerieA.ts`**
- Adicionar `maxSize: 194` ao objeto do Lecce (90% do padrão de 216px)
- A linha atual:
  ```typescript
  { id: 'lecce', name: 'Lecce', slug: 'lecce', crest_url: '/crests/lecce.png', jcMaxSize: 290 }
  ```
- Ficará:
  ```typescript
  { id: 'lecce', name: 'Lecce', slug: 'lecce', crest_url: '/crests/lecce.png', maxSize: 194, jcMaxSize: 290 }
  ```

