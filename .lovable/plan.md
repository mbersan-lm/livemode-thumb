
## Adicionar retangulo glass preto na esquerda

Adicionar um novo retangulo com efeito glass no canto inferior esquerdo do canvas "Ao Vivo", conforme a imagem de referencia.

### O que sera feito

- Adicionar um novo `div` no componente `ThumbnailCanvasAoVivo.tsx` representando o retangulo preto com efeito glass
- O retangulo tera:
  - Cor de fundo preta com transparencia (`#00000033`)
  - Backdrop blur (efeito glass)
  - Stroke de 1px branco
  - Border radius de 12px (consistente com os outros paineis)
  - Posicionado no canto inferior esquerdo do canvas
- Baseado na imagem de referencia, o retangulo ocupa aproximadamente 280px de largura e 120px de altura, alinhado ao canto inferior esquerdo com pequena margem

### Detalhes tecnicos

**Arquivo:** `src/components/ThumbnailCanvasAoVivo.tsx`

Adicionar um novo elemento entre os paineis existentes (zIndex 16), com as seguintes propriedades:
- `left: '0px'`, `bottom: '0px'` (canto inferior esquerdo)
- `width: '280px'`, `height: '120px'`
- `backgroundColor: '#00000033'` (preto com transparencia)
- `backdropFilter: 'blur(20px)'`
- `border: '1px solid white'`
- `borderRadius: '12px'`
- `zIndex: 16`
