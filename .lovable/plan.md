

## Plano: Export Server-Side via Playwright (Railway) ✅ IMPLEMENTADO

### Contexto

Atualmente existem 3 fluxos de exportação separados usando html2canvas ou Canvas 2D no cliente, que geram diferenças visuais. O objetivo é unificar tudo em um endpoint `POST /api/export` que renderiza a thumb exata via Playwright headless no servidor (Railway).

### Arquitetura

```text
Frontend (click "Exportar")
  → POST /api/export { type, state }
  → Express server (Railway)
     → Playwright abre /render/:type
     → page.evaluate(state) → window.__EXPORT_STATE__
     → Aguarda data-ready="true"
     → Screenshot #export-frame (1280×720)
     → Retorna JPG blob
  → Frontend baixa o arquivo
```

### Arquivos criados/alterados
- `src/pages/Render.tsx` (novo) ✅
- `src/lib/serverExport.ts` (novo) ✅
- `server.js` (novo) ✅
- `src/App.tsx` (nova rota) ✅
- `src/components/controls/ExportControls.tsx` (usar serverExport) ✅
- `src/pages/AoVivo.tsx` (usar serverExport) ✅
- `src/components/cortes/CortesControls.tsx` (usar serverExport) ✅
- `Dockerfile` (Playwright + Express) ✅
- `package.json` (deps + start script) ✅

### Notas técnicas
- **Só funciona em produção (Railway)** — no preview do Lovable o endpoint retornará 404 porque não há servidor Express
- As fotos são passadas como base64 no body do POST; Playwright as injeta no DOM normalmente
- O `Render.tsx` reutiliza os mesmos componentes de canvas existentes, garantindo 100% de paridade visual
