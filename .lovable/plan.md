

# Adicionar overlay "Som Ambiente" no modelo Ao Vivo

## O que sera feito

1. **Copiar o PNG enviado** para `public/kv/overlay-som-ambiente.png` -- sera usado como camada sobre todos os elementos do canvas.

2. **Adicionar estado `showSomAmbiente`** na pagina `Index.tsx` (boolean, default `false`).

3. **Passar a prop `showSomAmbiente` para o componente `ThumbnailCanvasAoVivo`** para controlar a exibicao do overlay.

4. **Renderizar o PNG no canvas** dentro de `ThumbnailCanvasAoVivo.tsx` com `zIndex: 100` (acima de todos os elementos existentes, incluindo escudos que estao em zIndex 50), ocupando 1280x720px, visivel apenas quando `showSomAmbiente === true`.

5. **Adicionar switch "Som ambiente"** no painel de controles do modelo Ao Vivo, usando o componente `Switch` ja existente. Sera posicionado junto aos controles exclusivos do Ao Vivo (proximo ao `AoVivoGradientControls` em `Index.tsx`), com label "Som ambiente" e logica on/off.

## Detalhes Tecnicos

**Arquivos modificados:**

- `public/kv/overlay-som-ambiente.png` -- novo arquivo (copia do upload)
- `src/components/ThumbnailCanvasAoVivo.tsx`:
  - Nova prop: `showSomAmbiente: boolean`
  - Nova camada `<img>` condicional com zIndex 100, src `/kv/overlay-som-ambiente.png`
- `src/pages/Index.tsx`:
  - Novo estado: `const [showSomAmbiente, setShowSomAmbiente] = useState(false)`
  - Passar prop `showSomAmbiente` ao `ThumbnailCanvasAoVivo`
  - Adicionar Switch com label "Som ambiente" na secao `activeCanvas === 'av'`, abaixo do `AoVivoGradientControls`

