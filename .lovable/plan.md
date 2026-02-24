

# Corrigir exportacao do texto em todos os modelos com "Texto da thumbnail"

## Problema
O JPG exportado esta cortando o texto (faltando o `"` final) porque ha diferencas entre o preview (HTML/CSS) e o export (Canvas API). Isso afeta o modelo **Thumb Principal** e potencialmente outros modelos.

## Diferencas encontradas

| Propriedade | Preview (CSS) | Export (Canvas) |
|---|---|---|
| Largura texto (Thumb Principal) | 380px | 360px |
| Altura texto (Thumb Principal) | 200px | 190px |
| Line-height | 1.15 | 1.2 (fixo) |
| Font size inicial (Thumb Principal) | auto-fit grande | 120px |

Essas diferencas fazem com que o auto-fit calcule um tamanho de fonte diferente no export, resultando em texto que nao cabe e e cortado.

## Correcao

### Arquivo: `src/components/cortes/CortesControls.tsx`

**1. Funcao `drawAutoFitText` (linha ~230):**
- Adicionar parametro opcional `lineHeightRatio` (default `1.2`)
- Usar esse parametro em vez do valor fixo `1.2` na linha 238

**2. Thumb Principal export (linhas 886-899):**
- Mudar `textW` de `360` para `380` (igualar ao preview)
- Mudar `textH` de `190` para `200` (igualar ao preview)
- Mudar `startFontSize` de `120` para `200` (mesmo ponto de partida do auto-fit)
- Passar `lineHeightRatio: 1.15` para igualar ao CSS do preview

**3. Modelo padrao (linhas 872-883):**
- Verificar se o line-height do preview tambem e `1.15` e, se for, passar o mesmo ratio na chamada

## Resultado
O export passara a usar as mesmas dimensoes e proporcoes do preview, garantindo que o texto completo (incluindo aspas e caracteres finais) apareca no JPG exportado em todos os modelos.
