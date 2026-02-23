

# Texto dentro do circulo central -- Thumb Principal (Roda de Bobo)

## Objetivo
No modelo **Thumb Principal** (exclusivo do Roda de Bobo), o texto atualmente aparece na parte inferior da tela com o layout padrao. A mudanca fara com que o texto fique **dentro do circulo escuro central**, abaixo da logo, como na referencia fornecida.

## O que sera feito

### 1. Adicionar circulo escuro central no preview (CortesCanvas.tsx)

- Renderizar um **circulo centralizado** (50% do centro horizontal e vertical do canvas) com fundo escuro (`#0C0C20` ou similar com leve transparencia) e borda clara (bege/dourado `#F1E8D5`, ~6px)
- O circulo tera diametro de aproximadamente **50%** da altura do canvas (~360px)
- Dentro do circulo, o texto sera renderizado centralizado, ocupando a metade inferior do circulo (abaixo da logo que ja esta posicionada via `logosImage`)
- O texto tera auto-fit (reduzindo fontSize ate caber) restrito a uma area circular

### 2. Ajustar o texto para ficar dentro do circulo no preview

- Quando `thumbModel === 'thumb-principal'`, o bloco de texto (Layer 5) sera substituido por um bloco posicionado **dentro do circulo central**
- A area de texto sera limitada a um retangulo inscrito na metade inferior do circulo
- O auto-fit continuara funcionando, mas com area reduzida

### 3. Replicar no export (CortesControls.tsx - handleExport)

- No Canvas 2D export, desenhar o circulo escuro com borda antes dos logos e texto
- Usar `ctx.arc()` para o circulo preenchido e a borda
- Limitar a area de texto ao retangulo inscrito na parte inferior do circulo
- A funcao `drawAutoFitText` sera chamada com coordenadas ajustadas para caber no circulo

## Detalhes tecnicos

### Circulo central (preview)
```text
Canvas: 1280x720
Centro: (640, 360)
Raio: ~280px (aprox. 39% da largura)
Fundo: #0C0C20 com opacidade ~0.85
Borda: #F1E8D5, 6px
```

### Area de texto dentro do circulo
O texto ocupara a metade inferior do circulo. A area retangular inscrita sera calculada para maximizar o espaco disponivel na parte inferior (abaixo do centro do circulo, onde a logo ocupa a parte superior).

### Arquivos modificados
- `src/components/cortes/CortesCanvas.tsx` -- adicionar circulo e reposicionar texto para modelo thumb-principal
- `src/components/cortes/CortesControls.tsx` -- replicar circulo e texto circular no export canvas

### O que NAO muda
- A grade 2x2 dos quadrantes com as fotos continua igual
- A logo (`logosImage`) continua sendo renderizada por cima (zIndex 5), ja posicionada no centro pela imagem PNG
- Os controles de quadrantes, upload e visibilidade permanecem iguais
- O gradiente inferior continua sendo aplicado
