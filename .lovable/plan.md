

## Stack Detection

This is a **Vite + React + TypeScript** SPA (no server-side rendering). It uses Supabase (Lovable Cloud) for backend. There is no Express/Node server -- it's a pure static frontend.

## Plan

### 1. Update `vite.config.ts`
- Add `preview.host` and `preview.port` to respect `PORT` env var for production serving:
```ts
preview: {
  host: "0.0.0.0",
  port: parseInt(process.env.PORT || "4173"),
},
```

### 2. Update `package.json` scripts
```json
"build": "vite build",
"start": "vite preview --host 0.0.0.0 --port $PORT",
"dev": "vite"
```

### 3. Create `Dockerfile`
Multi-stage Node 20 Dockerfile:
- Stage 1: `node:20-alpine` -- install deps + `npm run build`
- Stage 2: same image -- copy `dist/`, `node_modules`, `package.json`, `vite.config.ts` -- `CMD ["npm", "start"]`
- Expose `PORT` env var

### 4. Create `.env.example`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
PORT=3000
```

### 5. Create `DEPLOY_RAILWAY.md`
Step-by-step guide covering:
- Connecting Lovable to GitHub (sync)
- Creating Railway project from GitHub repo
- Generating domain
- Required env vars (from `.env.example`)
- Logs and common errors (PORT, build failures)
- Note about file uploads: this project uses Supabase Edge Functions for image processing (PhotoRoom, Gemini) -- no local file storage needed. Static assets in `public/` are bundled at build time.

### Files to create/modify

| File | Action |
|------|--------|
| `vite.config.ts` | Add `preview` config for PORT |
| `package.json` | Add `start` script |
| `Dockerfile` | Create (multi-stage Node 20) |
| `.env.example` | Create with placeholders |
| `DEPLOY_RAILWAY.md` | Create deployment guide |

### Final commands
- **Build**: `npm run build`
- **Start**: `npm start` (runs `vite preview --host 0.0.0.0 --port $PORT`)
- **Env vars for Railway**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `PORT` (auto-set by Railway)

