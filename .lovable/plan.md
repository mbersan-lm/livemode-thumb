

## Plano: Label "Imagem PIP (centro)" → "PIP esquerdo" quando PIP dividido ativo

### Alteração

**`src/components/cortes/CortesControls.tsx`** — Linha 1449: mudar o Label estático `Imagem PIP (centro)` para usar a condição `pipMeioDividido`:

```tsx
<Label className="font-semibold">{pipMeioDividido ? 'PIP esquerdo' : 'Imagem PIP (centro)'}</Label>
```

### Arquivo alterado
- `src/components/cortes/CortesControls.tsx` (1 linha)

