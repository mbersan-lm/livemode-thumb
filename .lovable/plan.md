

## Plano: Normalizar escudos de Lens e Lorient no template Ligue 1

### Problema
Lens tem `maxSize: 590` e `jcMaxSize: 390`, Lorient tem `maxSize: 512` e `jcMaxSize: 338`. O padrão dos outros times é 216px (MM) e 322px (JC), tornando esses dois desproporcionalmente grandes.

### Alteração

**`src/data/teamsLigue1.ts`** — remover os overrides `maxSize` e `jcMaxSize` de Lens e Lorient para que usem os valores padrão (216px para MM, 322px para JC):

- Lens: remover `maxSize: 590, jcMaxSize: 390`
- Lorient: remover `maxSize: 512, jcMaxSize: 338`

