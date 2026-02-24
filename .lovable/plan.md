

# Corrigir distorcao das fotos de preset do Quadrante 1

## Problema
As imagens de preset do Quadrante 1 (Thumb Principal Roda de Bobo) estao sendo exibidas distorcidas/comprimidas horizontalmente. As fotos originais enviadas nao estao sendo preservadas fielmente.

## Solucao

### 1. Re-salvar as imagens exatamente como enviadas
Copiar novamente todas as 6 imagens de preset diretamente dos uploads originais, sem qualquer processamento ou compressao:
- `CAZE-QD1.png` para `public/cortes/presets/caze.png`
- `BELTRAO-QD1.png` para `public/cortes/presets/beltrao.png`
- `DONAN-QD1.png` para `public/cortes/presets/donan.png`
- `IGOR-QD1.png` para `public/cortes/presets/igor.png`
- `LFF-QD1.png` para `public/cortes/presets/lff.png`
- `SIMOES-QD1.png` para `public/cortes/presets/simoes.png`

### 2. Nenhuma alteracao de codigo
O CSS do canvas (`height: 240%`, `width: auto`) ja preserva a proporcao correta. O problema esta apenas nos arquivos de imagem, nao no codigo de renderizacao. Posicoes e proporcoes permanecem inalteradas.
