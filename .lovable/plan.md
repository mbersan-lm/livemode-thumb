

## Plano: Configurar URL do Railway no export

### Problema

A variável `VITE_EXPORT_API_BASE` é lida em **build-time** pelo Vite (`import.meta.env`). O arquivo `.env` do projeto é gerenciado automaticamente pelo Lovable Cloud e não pode ser editado manualmente. Secrets do projeto ficam disponíveis apenas para edge functions, não para o build do Vite.

### Solução

Hardcodar a URL do Railway diretamente em `src/lib/serverExport.ts` como fallback default. Isso garante que funcione tanto no preview do Lovable quanto em produção no Railway.

### Lógica

```
Se VITE_EXPORT_API_BASE estiver definida → usa ela
Senão, se estiver rodando no Railway (mesmo domínio) → usa '' (relativo)
Senão (preview Lovable) → usa a URL hardcoded do Railway
```

### Arquivo alterado

**`src/lib/serverExport.ts`** — trocar a linha do `API_BASE` por:

```ts
const RAILWAY_URL = 'https://livemode-thumb-production.up.railway.app';

const API_BASE = (
  import.meta.env.VITE_EXPORT_API_BASE ||
  (window.location.hostname.includes('railway.app') ? '' : RAILWAY_URL)
).replace(/\/$/, '');
```

Isso faz:
- No **Railway** (produção): chama `/api/export` relativo (mesmo domínio)
- No **preview do Lovable** ou qualquer outro ambiente: chama o Railway diretamente

