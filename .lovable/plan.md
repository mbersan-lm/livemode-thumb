

## Plano: Criar template "Libertadores" para Melhores Momentos

### O que será feito

Adicionar o template "Libertadores" seguindo exatamente o padrão dos templates europeus (Ligue 1, Bundesliga, Serie A, Europa League).

### Arquivos e alterações

**1. Copiar o KV enviado para o projeto**
- `public/kv/kv-libertadores.png` — KV de Melhores Momentos (imagem enviada)
- `public/kv/kv-jogo-completo-libertadores.png` — Será necessário um KV de Jogo Completo. Por ora, usarei o mesmo KV enviado até que um específico seja fornecido.

**2. `src/data/templates.ts`**
- Adicionar `'libertadores'` ao type `TemplateType`
- Adicionar entrada no objeto `templates` com:
  - Fonte: `Gilroy ExtraBold` (padrão europeu)
  - X: `Gilroy Medium` branco
  - KV paths apontando para os novos arquivos

**3. `src/data/teamsLibertadores.ts`** (novo arquivo)
- Criar lista de times da Libertadores usando os escudos do Brasileirão já existentes no projeto (Botafogo, Flamengo, Palmeiras, São Paulo, etc.)

**4. Atualizar seletores de times em 4 arquivos:**
- `src/components/ThumbnailCanvas.tsx` — adicionar case `'libertadores'`
- `src/components/ThumbnailCanvasJogoCompleto.tsx` — idem
- `src/components/controls/TeamControls.tsx` — idem

**5. `src/types/thumbnail.ts`**
- Adicionar `'libertadores'` ao union type do campo `template`

**6. Posicionamento e penalidades**
- Seguirá o padrão europeu: `top-[335px]` nos escudos de MM, `-top-[20px]` no JC
- Penalidades com `translateX(-3%)`

### Pergunta antes de implementar
Preciso saber quais times incluir na lista da Libertadores. Posso começar com os times brasileiros já presentes no projeto. Você tem uma lista específica de times?

