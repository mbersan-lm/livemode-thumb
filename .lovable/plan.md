

## Plano: Usar `VITE_EXPORT_API_BASE` no `serverExport`

### Alteração

Apenas **1 arquivo** precisa mudar: `src/lib/serverExport.ts`.

Adicionar no topo a leitura da variável de ambiente e usá-la na construção da URL. Todos os 3 pontos de chamada (`ExportControls.tsx`, `AoVivo.tsx`, `CortesControls.tsx`) já usam `serverExport()` — ficam automaticamente cobertos.

```ts
const API_BASE = (import.meta.env.VITE_EXPORT_API_BASE || '').replace(/\/$/, '');

export async function serverExport(type: string, state: object, filename: string) {
  const url = `${API_BASE}/api/export`;
  const toastId = toast.loading('Gerando JPG via servidor...');
  try {
    const res = await fetch(url, { ... });
    // resto igual, mas com alert amigável no catch
  }
}
```

### Detalhes
- **Preview do Lovable**: setar `VITE_EXPORT_API_BASE=https://<app>.up.railway.app` para chamar o Railway remotamente
- **Railway (produção)**: deixar vazio → chama `/api/export` no próprio domínio
- O `.env.example` será atualizado com a nova variável documentada
- Manter toast de loading + erro amigável com status e mensagem

### Arquivos alterados
- `src/lib/serverExport.ts`
- `.env.example`

