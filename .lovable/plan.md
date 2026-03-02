

## Plano: Mover "PIP esquerdo" para dentro do toggle PIP dividido

### Alteração

**`src/components/cortes/CortesControls.tsx`** (linhas 1447-1493):

Reorganizar a estrutura para que:
- Quando `pipMeioDividido` é **false**: o bloco "Imagem PIP (centro)" + upload fica **antes** do switch (como já está).
- Quando `pipMeioDividido` é **true**: o bloco "Imagem PIP (centro)" some de cima, e dentro do toggle aparecem "PIP esquerdo" e "PIP direito" lado a lado ou em sequência.

Concretamente:
1. O bloco de upload PIP central (linhas 1447-1456) fica condicional a `!pipMeioDividido`.
2. Dentro do bloco `{pipMeioDividido && (...)}` (linha 1466), adicionar o upload "PIP esquerdo" **antes** do "PIP direito", movendo o conteúdo de upload + botão para lá.

```tsx
{/* PIP central — só quando NÃO dividido */}
{!pipMeioDividido && (
  <div className="space-y-2">
    <Label className="font-semibold">Imagem PIP (centro)</Label>
    <input ... />
    <Button ...>Upload PIP</Button>
  </div>
)}

{/* Switch PIP dividido */}
<div className="flex ...">
  <Label>PIP dividido</Label>
  <Switch ... />
</div>

{/* Conteúdo dentro do toggle */}
{pipMeioDividido && (
  <>
    <div className="space-y-2">
      <Label className="font-semibold">PIP esquerdo</Label>
      <input ... /> {/* mesmo pipInputRef */}
      <Button ...>Upload PIP esquerdo</Button>
    </div>
    <div className="space-y-2">
      <Label className="font-semibold">PIP direito</Label>
      ...
    </div>
  </>
)}
```

### Arquivo alterado
- `src/components/cortes/CortesControls.tsx`

