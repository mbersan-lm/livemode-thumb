

## Plano: Adicionar times da Kings League

### Alterações

1. **Copiar 10 escudos para `public/crests/`**
   - `CAPIM.png` → `public/crests/kl-capim.png`
   - `DENDELE.png` → `public/crests/kl-dendele.png`
   - `DESIMPAIN.png` → `public/crests/kl-desimpain.png`
   - `DIBRADOS.png` → `public/crests/kl-dibrados.png`
   - `FLUXO.png` → `public/crests/kl-fluxo.png`
   - `FUNKBOL.png` → `public/crests/kl-funkbol.png`
   - `FÚRIA.png` → `public/crests/kl-furia.png`
   - `G3X.png` → `public/crests/kl-g3x.png`
   - `LOUD.png` → `public/crests/kl-loud.png`
   - `NYVELADOS.png` → `public/crests/kl-nyvelados.png`

2. **`src/data/teamsKingsLeague.ts`**
   - Preencher array com os 10 times em ordem alfabética

3. **`src/components/controls/TeamControls.tsx`**
   - Adicionar import de `teamsKingsLeague` e mapeamento `template === 'kingsleague'` na lógica de seleção de times (atualmente cai no fallback `teamsLigue1`)

