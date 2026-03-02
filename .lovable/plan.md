## Plano: Export server-side via Playwright — IMPLEMENTADO ✅

Todos os exports (Cortes, Melhores Momentos, Jogo Completo, Ao Vivo) agora usam `exportViaServer()` que faz POST para `/api/export` no Railway. O servidor Express + Playwright abre a rota `/render/:type`, injeta o estado e captura um screenshot PNG de 1280x720.

### Arquivos criados
- `src/lib/serverExport.ts` — Função utilitária compartilhada
- `src/pages/RenderExport.tsx` — Página de renderização sem UI
- `server/index.mjs` — Express + Playwright server

### Arquivos alterados
- `src/App.tsx` — Rota `/render/:type`
- `src/components/cortes/CortesControls.tsx` — Export via server (removido ~650 linhas de Native Canvas)
- `src/components/controls/ExportControls.tsx` — Export via server (removido html2canvas)
- `src/pages/AoVivo.tsx` — Export via server (removido ~140 linhas de Native Canvas)
- `Dockerfile` — Playwright base image
- `package.json` — express + playwright deps, start script
