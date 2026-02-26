# Deploy no Railway via GitHub

## 1. Conectar o projeto ao GitHub (via Lovable)

1. No editor do Lovable, vá em **Settings → GitHub → Connect project**
2. Autorize o Lovable GitHub App
3. Selecione a conta/organização do GitHub
4. Clique em **Create Repository** — o código será sincronizado automaticamente

## 2. Criar projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **New Project → Deploy from GitHub repo**
3. Selecione o repositório criado pelo Lovable
4. O Railway vai detectar o `Dockerfile` automaticamente

## 3. Configurar variáveis de ambiente

No painel do Railway, vá em **Variables** e adicione:

| Variável | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sua anon key |
| `VITE_SUPABASE_PROJECT_ID` | ID do projeto |
| `PORT` | **Não precisa configurar** — o Railway define automaticamente |

> ⚠️ As variáveis `VITE_*` são usadas **em tempo de build**. Certifique-se de que estão definidas antes do primeiro deploy.

## 4. Gerar domínio

1. No painel do serviço, vá em **Settings → Networking → Generate Domain**
2. Você receberá uma URL como `seu-app.up.railway.app`

## 5. Comandos de produção

| Comando | Descrição |
|---------|-----------|
| `npm run build` | Gera o bundle em `dist/` |
| `npm start` | Serve o `dist/` via `vite preview` na porta `$PORT` |

## 6. Logs e erros comuns

### Ver logs
No painel do Railway, clique no serviço → **Logs** (ou **Deploy Logs** para ver o build)

### Erros comuns

| Erro | Solução |
|------|---------|
| `port already in use` | Não defina `PORT` manualmente — o Railway atribui automaticamente |
| Build falha com `vite: not found` | Verifique se `node_modules` foi instalado (o Dockerfile já cuida disso) |
| Variáveis `VITE_*` vazias no app | As variáveis precisam existir **antes do build**. Faça redeploy após adicioná-las |
| `Cannot find module` | Rode `npm ci` localmente para verificar se o `package-lock.json` está atualizado |

## 7. Sobre uploads de arquivos

Este projeto **não depende de storage local**. O processamento de imagens (remoção de fundo, IA) é feito via Edge Functions do backend. Os assets estáticos em `public/` são incluídos no bundle durante o build.

Portanto, **não é necessário** configurar volumes ou storage externo no Railway.
