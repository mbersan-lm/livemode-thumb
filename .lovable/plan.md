
# Duas Alterações: Re-remoção de Fundo pós-Gemini + Layout 50/50

## 1. Re-remoção de fundo após Upscale do Gemini

### Problema
O Gemini devolve a imagem melhorada, mas pode adicionar um fundo (branco, preto, etc.) mesmo recebendo um PNG com transparência. O `personCutout` é substituído por essa imagem com fundo, quebrando a composição.

### Solução
Após receber a imagem do Gemini, chamar automaticamente a mesma função `removeBg` (Photoroom) antes de atualizar o `personCutout`.

**Arquivo:** `src/components/cortes/CortesThumbBuilder.tsx`

Fluxo atualizado do `handleUpscalePerson`:
```text
personCutout (sem fundo)
  → Gemini upscale (pode voltar com fundo)
  → Photoroom remove-bg (garante transparência)
  → setPersonCutout (imagem final limpa e melhorada)
```

O toast de loading muda para refletir as duas etapas:
- "Melhorando imagem..." (durante Gemini)
- "Removendo fundo..." (durante Photoroom)

Mesma lógica para `handleUpscalePerson2`.

---

## 2. Layout 50/50 entre Preview e Painel de Controles

### Problema atual
O painel de controles tem largura fixa de `380px` (`md:w-[380px]`), e o preview ocupa o restante com `flex-1`. Em telas grandes, o preview fica desproporcional.

### Solução
Mudar para layout 50/50 no desktop:
- Preview: `w-1/2`
- Painel de controles: `w-1/2`

O cálculo do `canvasScale` será atualizado para usar metade da largura da tela em vez de `window.innerWidth - 380`.

**Arquivo:** `src/components/cortes/CortesThumbBuilder.tsx`

Alterações no layout:
- Container do preview: de `flex-1` para `w-1/2`
- Container dos controles: de `md:w-[380px]` para `w-1/2`
- Cálculo do scale: `availableWidth = (window.innerWidth / 2) - 32` no desktop

No mobile, o layout continua empilhado (coluna) sem alteração.

---

## Arquivos modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/components/cortes/CortesThumbBuilder.tsx` | Layout 50/50 + re-remoção de fundo pós-Gemini |

## O que NAO muda
- Edge function `gemini-upscale` -- sem alteração
- `CortesControls.tsx` -- sem alteração
- Layout da pagina Index (Melhores Momentos) -- sem alteração
- Fluxo de upload e remoção de fundo manual -- intacto
