
# Fix: Texto Minúsculo no Export

## Causa Raiz Identificada

Linha 485-486 em `CortesControls.tsx`:

```typescript
const fontFamily = (props.customFontFamily || "'Clash Grotesk', sans-serif")
  .replace(/^'|'$/g, '').split(',')[0].trim();
```

O regex `/^'|'$/g` só remove aspas no **início e fim da string inteira**. Com a string `"'Clash Grotesk', sans-serif"`:

- Remove `'` do início → `"Clash Grotesk', sans-serif"`
- O fim termina em `f`, não `'`, então a aspa interna fica: `"Clash Grotesk'"`
- `.split(',')[0]` retorna `"Clash Grotesk'"` (com aspa sobrando)

O Canvas API não reconhece `Clash Grotesk'` como fonte válida, usa o fallback padrão (Times New Roman), que é muito mais largo por caractere. Resultado: o `fitFontSize` reduz a fonte agressivamente porque o texto não cabe horizontalmente, chegando a ~20px.

## Solução

Trocar a ordem das operações — primeiro pegar só o nome da fonte, depois remover as aspas:

```typescript
// ANTES (quebrado):
.replace(/^'|'$/g, '').split(',')[0].trim()

// DEPOIS (correto):
.split(',')[0].trim().replace(/'/g, '')
```

Com isso:
1. `.split(',')[0]` → `"'Clash Grotesk'"`
2. `.trim()` → `"'Clash Grotesk'"`
3. `.replace(/'/g, '')` → `"Clash Grotesk"` (sem aspas, font name limpo)

O Canvas reconhece corretamente a fonte e `ctx.measureText` retorna as métricas reais de Clash Grotesk. O `fitFontSize` calcula o tamanho correto (igual ao preview).

## Arquivo a Modificar

**`src/components/cortes/CortesControls.tsx`** — apenas linha 486, mudança de 1 linha.
