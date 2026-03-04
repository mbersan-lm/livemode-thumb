

## Diagnóstico: Escudos ausentes na exportação do template Kings League

### Causa raiz

A exportação funciona via servidor externo no Railway (`livemode-thumb-production.up.railway.app`). Esse servidor usa uma **build antiga** do projeto (pasta `dist/`) que ainda não contém os arquivos dos escudos da Kings League nem o código atualizado dos componentes.

O fluxo de exportação é:
1. O app envia o estado (template, times, placar) para o servidor Railway
2. O servidor abre a rota `/render/melhores-momentos` usando Playwright
3. Playwright renderiza o canvas e tira um screenshot

Como o servidor Railway está com uma versão desatualizada, os escudos `kl-*.png` não existem no `dist/` dele, e o componente pode não ter o mapeamento para `teamsKingsLeague`.

### Solução

**Re-deploy do servidor Railway** com o código atual. Isso garantirá que:
- Os 10 arquivos de escudo (`public/crests/kl-*.png`) estejam no `dist/`
- Os componentes `ThumbnailCanvas.tsx` e `ThumbnailCanvasJogoCompleto.tsx` com o mapeamento Kings League estejam compilados
- O `kv-kingsleague.png` esteja disponível

### Ação necessária

Não há alteração de código — o código já está correto. É necessário fazer um novo deploy no Railway para que o servidor de exportação use a build atualizada.

