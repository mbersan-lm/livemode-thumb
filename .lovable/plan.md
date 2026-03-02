

## Plano: Export server-side via Playwright para TODAS as thumbs

### Resumo

Substituir todos os exports client-side (html2canvas e Native Canvas API) por um único fluxo server-side usando Playwright no Railway. O Playwright abre uma rota de renderização dedicada, injeta o estado do canvas e captura um screenshot pixel-perfect de 1280x720.

### Arquitetura

```text
Frontend (qualquer thumb)          Railway Server (Express + Playwright)
┌──────────────────────┐           ┌──────────────────────────────┐
│ Botão "Exportar"     │  POST     │  /api/export                 │
│  → coleta state JSON │ ────────▶ │  1. Abre /render/:type       │
│  → envia ao server   │           │  2. Injeta state via evaluate│
│  → recebe PNG blob   │ ◀──────── │  3. Screenshot #export-frame │
│  → download          │   PNG     │  4. Retorna image/png        │
└──────────────────────┘           └──────────────────────────────┘
```

### Tipos de thumb suportados

| Tipo | Rota render | Canvas component | State |
|------|------------|-----------------|-------|
| `cortes` | `/render/cortes` | `CortesCanvas` | thumbModel, images base64, transforms, textos, cores |
| `melhores-momentos` | `/render/mm` | `ThumbnailCanvas` | teams, scores, photo, template |
| `jogo-completo` | `/render/jc` | `ThumbnailCanvasJogoCompleto` | teams, photo, template |
| `ao-vivo` | `/render/ao-vivo` | `ThumbnailCanvasAoVivo` | teams, photos, gradients, template |

### Arquivos novos

#### 1. `src/pages/RenderExport.tsx`
- Página genérica que lê `type` do URL param
- Renderiza o canvas component correto em um `div#export-frame` (1280x720, sem UI)
- Escuta `window.__EXPORT_STATE__` via custom event
- Quando imagens/fontes carregam, seta `data-ready="true"` no `#export-frame`

#### 2. `server/index.mjs`
- Express servindo `dist/` como SPA
- `POST /api/export` recebe `{ type, state }`
- Abre Playwright Chromium headless em `http://localhost:PORT/render/:type`
- Injeta state, espera `data-ready`, screenshot `#export-frame`, retorna PNG

### Arquivos alterados

#### 3. `src/App.tsx`
- Adicionar rota `/render/:type` → `<RenderExport />`

#### 4. `src/components/cortes/CortesControls.tsx`
- Substituir `handleExport` (Native Canvas, ~650 linhas) por POST a `/api/export` com `{ type: 'cortes', state: currentCanvasProps }`
- Manter loading toast e download do blob recebido

#### 5. `src/components/controls/ExportControls.tsx`
- Substituir `handleExportMelhoresMomentos` e `handleExportJogoCompleto` (html2canvas) por POST a `/api/export` com tipo e state
- Precisará receber `matchData` + `state` como props

#### 6. `src/pages/AoVivo.tsx`
- Substituir `handleExportAoVivo` (Native Canvas, ~140 linhas) por POST a `/api/export` com `{ type: 'ao-vivo', state }`

#### 7. `Dockerfile`
- Base image: `mcr.microsoft.com/playwright:v1.49.1-jammy`
- Instalar dependências e copiar `server/`
- CMD: `node server/index.mjs`

#### 8. `package.json`
- Adicionar `express` e `playwright` como dependências
- Script `start`: `node server/index.mjs`

### Detalhes técnicos

- **Fontes**: A rota de render carrega as mesmas fontes que o SPA. O Playwright espera `document.fonts.ready` antes do screenshot.
- **Imagens base64**: Enviadas no body do POST (pode ser grande, ~5-10MB para cortes com múltiplas pessoas). O Express aceita body até 50MB.
- **Fallback**: No preview do Lovable (onde não há Playwright), o botão detecta o ambiente e exibe aviso para usar o deploy Railway.
- **Formato**: PNG (não JPG) para máxima fidelidade. Pode ser configurável futuramente.
- **Timeout**: Playwright timeout de 15s para evitar travamentos.

### Função utilitária compartilhada

Criar `src/lib/serverExport.ts` com uma função genérica:
```typescript
export async function exportViaServer(type: string, state: any, filename: string) {
  const resp = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, state }),
  });
  if (!resp.ok) throw new Error('Export failed');
  const blob = await resp.blob();
  // download blob...
}
```

Essa função substitui toda a lógica de export nos 4 pontos (Cortes, MM, JC, Ao Vivo).

