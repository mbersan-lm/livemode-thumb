

## Plano: Adicionar CORS ao server.js

### Problema
O servidor Express no Railway não retorna headers CORS. Chamadas cross-origin do preview Lovable são bloqueadas pelo navegador ("Failed to fetch").

### Solução
Adicionar middleware CORS antes do endpoint `/api/export` em `server.js`:

```js
// CORS — allow cross-origin requests from Lovable preview
app.use('/api/export', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
```

Inserir entre a linha `app.use(express.json(...))` (linha 13) e o endpoint `app.post('/api/export', ...)` (linha 19).

### Arquivo alterado
- `server.js`

### Importante
Depois de alterar, sera necessario fazer um novo deploy no Railway para que a mudanca tenha efeito.

