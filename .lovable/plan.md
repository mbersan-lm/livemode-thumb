
# Ajustes no auto-zoom do PIP

## Mudancas

### 1. Adicionar +0.5x ao zoom calculado no upload

**Arquivo: `src/components/cortes/CortesThumbBuilder.tsx`**

Na funcao `handlePipUpload`, apos calcular o `autoScale`, adicionar 0.5 antes de aplicar:

```
const autoScale = Math.max(...) + 0.5;
```

### 2. Guardar o zoom calculado para uso no reset

Criar um novo state `pipBaseScale` que armazena o valor calculado (com o +0.5). Quando o botao "Redefinir" for clicado, ele volta para esse valor ao inves de `scale: 1`.

**Arquivo: `src/components/cortes/CortesThumbBuilder.tsx`**

- Adicionar state: `const [pipBaseScale, setPipBaseScale] = useState(1);`
- No `handlePipUpload`, apos calcular `autoScale + 0.5`, salvar em `pipBaseScale`
- Passar `pipBaseScale` como nova prop para `CortesControls`

**Arquivo: `src/components/cortes/CortesControls.tsx`**

- Receber nova prop `pipBaseScale: number`
- No botao de reset do PIP transform (linha 150), trocar `scale: 1` por `scale: pipBaseScale`

### 3. Reset geral (Limpar tudo)

No `handleClear`, o `pipBaseScale` volta para `1` ja que nao ha imagem carregada.

## Resultado

- Upload PIP: zoom = calculo automatico + 0.5x
- Botao "Redefinir" do PIP: volta para o zoom calculado + 0.5x (nao para 1x)
- "Limpar tudo": reseta tudo para os valores padrao
