

## Adicionar 4 times ao template Brasileirão

### Etapas

1. **Copiar os escudos** para `public/crests/`:
   - `CORITIBA-4.png` -> `public/crests/coritiba.png`
   - `ATHLÉTICO_PR_-_TRAÇADO-4.png` -> `public/crests/athleticopr.png`
   - `CHAPECOENSE-4.png` -> `public/crests/chapecoense.png`
   - `REMO-4.png` -> `public/crests/remo.png`

2. **Editar `src/data/teams.ts`** - adicionar os 4 times ao array `teamsBrasileirao` em ordem alfabética:
   - `{ id: '21', name: 'Athletico-PR', slug: 'athleticopr', crest_url: '/crests/athleticopr.png' }`
   - `{ id: '22', name: 'Chapecoense', slug: 'chapecoense', crest_url: '/crests/chapecoense.png' }`
   - `{ id: '23', name: 'Coritiba', slug: 'coritiba', crest_url: '/crests/coritiba.png' }`
   - `{ id: '24', name: 'Remo', slug: 'remo', crest_url: '/crests/remo.png' }`

### Detalhes Técnicos
- Os escudos serão salvos na pasta `public/crests/` seguindo o padrão existente
- IDs sequenciais a partir de 21 (último ID usado foi 20)
- Os times serão inseridos em ordem alfabética no array

