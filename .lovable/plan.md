

## Plano: Adicionar Barcelona SC ao template Libertadores

### Alterações

**1. Copiar escudo**
- Copiar `user-uploads://BARCELONA_EQU_1.png` para `public/crests/barcelona-sc.png`

**2. `src/data/teamsLibertadores.ts`**
- Adicionar Barcelona SC à lista, mantendo Botafogo:
```ts
export const teamsLibertadores: Team[] = [
  { id: 'lib-4', name: 'Botafogo', slug: 'botafogo', crest_url: '/crests/botafogo.png' },
  { id: 'lib-17', name: 'Barcelona SC', slug: 'barcelona-sc', crest_url: '/crests/barcelona-sc.png' },
];
```

