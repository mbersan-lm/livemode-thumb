

## Problema

Os arquivos de escudo para Athletico-PR, Chapecoense, Coritiba e Remo ja existiam na pasta `public/crests/` com imagens incorretas (provavelmente de outros projetos ou times europeus com nomes similares). A copia anterior pode nao ter sobrescrito corretamente os arquivos.

## Solucao

Re-copiar os 4 escudos enviados pelo usuario com nomes novos e unicos, e atualizar as referencias no `src/data/teams.ts`.

### Passo 1 - Copiar os escudos com novos nomes

Copiar os uploads originais para `public/crests/` com nomes diferentes para evitar qualquer conflito de cache:

- `user-uploads://ATHLÉTICO_PR_-_TRAÇADO-5.png` → `public/crests/athleticopr-new.png`
- `user-uploads://CHAPECOENSE-5.png` → `public/crests/chapecoense-new.png`
- `user-uploads://CORITIBA-5.png` → `public/crests/coritiba-new.png`
- `user-uploads://REMO-5.png` → `public/crests/remo-new.png`

### Passo 2 - Atualizar `src/data/teams.ts`

Atualizar os caminhos dos 4 times para apontar para os novos arquivos:

- Athletico-PR: `crest_url: '/crests/athleticopr-new.png'`
- Chapecoense: `crest_url: '/crests/chapecoense-new.png'`
- Coritiba: `crest_url: '/crests/coritiba-new.png'`
- Remo: `crest_url: '/crests/remo-new.png'`

### Detalhes Tecnicos

Arquivos modificados:
- `public/crests/athleticopr-new.png` (novo)
- `public/crests/chapecoense-new.png` (novo)
- `public/crests/coritiba-new.png` (novo)
- `public/crests/remo-new.png` (novo)
- `src/data/teams.ts` (linhas 9, 13, 15, 24 - atualizar crest_url)

