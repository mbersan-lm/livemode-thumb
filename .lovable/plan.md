

# Corrigir thumb "AO VIVO" para ficar identica a referencia

## Problema atual
A thumb "AO VIVO" tem fundo preto solido e nao usa a imagem de fundo (KV) do template selecionado. Na referencia, o fundo mostra a imagem do estadio (KV do template) por tras de tudo, incluindo por dentro dos paineis semi-transparentes.

## Diferencas entre a implementacao atual e a referencia

| Elemento | Atual | Referencia |
|---|---|---|
| Fundo | Preto solido (#000) | Imagem KV do template (estadio) |
| Paineis | Fundo semi-transparente simples | Transparentes deixando ver o fundo do estadio atras |
| Template prop | Nao recebe | Precisa para saber qual KV usar |
| Texto "AO VIVO" | 160px, top 36px | Correto, manter |

## Alteracoes

### 1. `src/data/templates.ts`
- Adicionar campo `kvAoVivoPath` em cada template, apontando para o KV correspondente (reutilizar o mesmo `kvPath` do "Melhores Momentos", pois o fundo do AO VIVO e o mesmo KV do template)

### 2. `src/components/ThumbnailCanvasAoVivo.tsx`
- Adicionar props `template` (TemplateType) e `matchData` (MatchData)
- Adicionar camada de fundo com a imagem KV do template selecionado (`templates[template].kvPath`), cobrindo o canvas inteiro (1280x720), com `object-fit: cover`, posicionada atras de tudo (z-index 0)
- Manter o fundo preto como fallback (`background: '#000'`)
- Os paineis continuam com `background: rgba(255,255,255,0.08)` e `border: 1px solid rgba(255,255,255,0.15)` para o efeito de vidro sobre o fundo

### 3. `src/pages/Index.tsx`
- Passar as props `template={state.template}` e `matchData={state.matchData}` para o componente `ThumbnailCanvasAoVivo`

## Resultado
A thumb "AO VIVO" passara a exibir a imagem de fundo do template selecionado (estadio), com os paineis semi-transparentes mostrando o fundo por tras, identico a imagem de referencia.
