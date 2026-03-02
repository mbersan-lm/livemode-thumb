

## Plano: Export Server-Side via Playwright (Railway)

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

### Alterações

#### 1. Nova página `/render/:type` (`src/pages/Render.tsx` + rota no App.tsx)
- Componente que lê `type` da URL (`melhores-momentos`, `jogo-completo`, `ao-vivo`, `cortes`)
- Escuta `window.__EXPORT_STATE__` para receber o estado completo (incluindo fotos em base64)
- Renderiza o canvas correspondente em 1280×720 **sem escala**, dentro de `<div id="export-frame">`
- Quando tudo carregou (fontes + imagens), seta `data-ready="true"` no container
- Background preto, sem UI extra

#### 2. Servidor Express + Playwright (`server.js` na raiz)
- Serve estáticos de `dist/`
- `POST /api/export` recebe `{ type, state }`
- Abre `http://localhost:PORT/render/${type}` em Playwright Chromium headless
- Viewport 1280×720, `deviceScaleFactor: 1`
- Injeta state via `page.evaluate(s => window.__EXPORT_STATE__ = s, state)`
- Espera `[data-ready="true"]` no `#export-frame`
- Captura screenshot JPG (quality 90) do elemento `#export-frame`
- Retorna a imagem como `image/jpeg`

#### 3. Atualizar Dockerfile
- Base image: `node:20` (não alpine, para Playwright deps)
- Instalar `playwright` + `express` como dependências de produção
- `npx playwright install --with-deps chromium`
- CMD: `node server.js`

#### 4. Atualizar `package.json`
- Adicionar `express` e `playwright` como dependencies
- Alterar script `start` para `node server.js`

#### 5. Atualizar handlers de exportação (3 arquivos)
- **`ExportControls.tsx`**: ambos `handleExportMelhoresMomentos` e `handleExportJogoCompleto` fazem POST com `{ type, state }` e baixam o blob
- **`AoVivo.tsx`**: `handleExportAoVivo` faz POST com `{ type: "ao-vivo", state }` incluindo fotos, gradientes, template, times, showSomAmbiente
- **`CortesControls.tsx`**: `handleExport` faz POST com `{ type: "cortes", state }` incluindo todas as imagens, transforms, texto, modelo

Criar um helper compartilhado `src/lib/serverExport.ts` para evitar duplicação:
```ts
export async function serverExport(type: string, state: object, filename: string) {
  const res = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, state }),
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  // download blob as filename
}
```

#### 6. Rota no `App.tsx`
- Adicionar `<Route path="/render/:type" element={<Render />} />`

### Notas técnicas
- **Só funciona em produção (Railway)** — no preview do Lovable o endpoint retornará 404 porque não há servidor Express
- As fotos são passadas como base64 no body do POST; Playwright as injeta no DOM normalmente
- O `Render.tsx` reutiliza os mesmos componentes de canvas existentes, garantindo 100% de paridade visual

### Arquivos criados/alterados
- `src/pages/Render.tsx` (novo)
- `src/lib/serverExport.ts` (novo)
- `server.js` (novo)
- `src/App.tsx` (nova rota)
- `src/components/controls/ExportControls.tsx` (usar serverExport)
- `src/pages/AoVivo.tsx` (usar serverExport)
- `src/components/cortes/CortesControls.tsx` (usar serverExport)
- `Dockerfile` (Playwright + Express)
- `package.json` (deps + start script)

