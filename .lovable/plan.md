
# Auto-zoom do PIP para preencher o frame

## Objetivo

Quando o usuario faz upload de uma imagem PIP, calcular automaticamente o zoom necessario para que a imagem preencha todo o frame PIP, sem cortar (continua usando `objectFit: contain`). O zoom e calculado com base na proporcao da imagem vs proporcao do frame.

## Logica

Com `objectFit: contain`, a imagem se encaixa dentro do frame mantendo proporcao, deixando barras em um dos lados. Para preencher sem cortar, basta aplicar um zoom igual a razao entre os aspect ratios:

```text
containerRatio = frameWidth / frameHeight
imageRatio     = imgNaturalWidth / imgNaturalHeight
zoom = max(containerRatio / imageRatio, imageRatio / containerRatio)
```

Isso garante que o lado "sobrando" seja expandido ate preencher o frame.

## Mudancas

### Arquivo: `src/components/cortes/CortesThumbBuilder.tsx`

**1. Modificar `handlePipUpload`** (linhas 41-45):

Em vez de simplesmente setar a imagem, carregar um objeto `Image` para obter as dimensoes naturais, calcular o zoom necessario e aplicar no `pipTransform.scale`:

```text
const handlePipUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    setPipImage(dataUrl);

    // Calcular zoom para preencher o frame
    const img = new Image();
    img.onload = () => {
      const containerW = pipFrame.width;
      const containerH = pipFrame.height;
      const containerRatio = containerW / containerH;
      const imageRatio = img.naturalWidth / img.naturalHeight;
      const autoScale = Math.max(
        containerRatio / imageRatio,
        imageRatio / containerRatio
      );
      setPipTransform(prev => ({ ...prev, scale: autoScale }));
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
};
```

**2. Atualizar o reset do PIP transform** no `handleClear` (linha ~77) e no botao de reset dos controles:

O `DEFAULT_PIP_TRANSFORM` continua com `scale: 1` porque o auto-zoom so faz sentido quando ha uma imagem carregada. O reset volta para `scale: 1` normalmente.

### Arquivo: `src/components/cortes/CortesControls.tsx`

Nenhuma mudanca necessaria -- o reset ja usa `scale: 1`, e o slider continua funcionando normalmente para ajustes manuais apos o auto-zoom.

## Resultado

- Upload de imagem PIP -> zoom automatico para preencher o frame
- Slider de zoom continua funcionando para ajuste fino
- Botao de reset volta para zoom 1 (sem auto-fill)
- Nenhuma mudanca visual no contain -- a imagem nao e cortada, apenas ampliada via transform scale
