

# Menu de Template para o modelo Ao Vivo

## O que sera feito

Adicionar um seletor de template exclusivo para o modelo "Ao Vivo" com duas opcoes: **Europa League** e **Conference League**. O template Conference League reutiliza toda a estrutura visual (paineis, gradientes, KV), mas **sem escudos** e **sem a logo** (serao adicionados depois pelo usuario).

## Alteracoes

### 1. Novo estado `aoVivoTemplate` no Index

- Criar um estado `aoVivoTemplate` com tipo `'europaleague' | 'conferenceleague'`, valor inicial `'europaleague'`.
- Passar esse valor para o `ThumbnailCanvasAoVivo`.

### 2. Seletor de template no painel de controles (Index.tsx)

- Dentro do bloco `{activeCanvas === 'av' && (...)}`, adicionar um seletor (Select ou ToggleGroup) com as opcoes "Europa League" e "Conference League", acima dos controles de gradiente.
- Ao trocar de template, limpar os times selecionados (`homeTeamId: null, awayTeamId: null`).

### 3. ThumbnailCanvasAoVivo.tsx

- Receber uma nova prop `aoVivoTemplate` (ou reutilizar `template` com os novos valores).
- Condicionar a exibicao dos **escudos** (home/away crests) apenas quando `aoVivoTemplate === 'europaleague'`.
- Condicionar a exibicao da **logo** (`logos-ao-vivo-europa.png`) apenas quando `aoVivoTemplate === 'europaleague'`.
- No modo Conference League, os espacos de escudo e logo ficam vazios (prontos para receber novos assets futuramente).

### 4. TeamControls - esconder seletor de times no Conference League

- Quando `aoVivoTemplate === 'conferenceleague'`, esconder tambem o seletor de times (ja que nao ha escudos). Ou manter visivel se o usuario quiser adicionar escudos depois -- **por padrao, esconder os seletores de time no Conference League** ate que os novos escudos sejam anexados.

## Detalhes Tecnicos

**Arquivos modificados:**

1. **`src/pages/Index.tsx`**:
   - Novo estado: `const [aoVivoTemplate, setAoVivoTemplate] = useState<'europaleague' | 'conferenceleague'>('europaleague')`
   - Adicionar Select/ToggleGroup no bloco `activeCanvas === 'av'`
   - Passar `aoVivoTemplate` como prop para `ThumbnailCanvasAoVivo`

2. **`src/components/ThumbnailCanvasAoVivo.tsx`**:
   - Nova prop ou reutilizacao de `template` para distinguir europa/conference
   - Envolver escudos (linhas 228-258) com `{template === 'europaleague' && ...}`
   - Envolver logo (linhas 262-268) com `{template === 'europaleague' && ...}`

3. **`src/components/controls/TeamControls.tsx`**:
   - Esconder seletores de time quando ao vivo + conference league (opcional, dependendo se o usuario quer manter)

