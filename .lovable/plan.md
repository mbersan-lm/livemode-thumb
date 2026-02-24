

# Atualizar presets do Quadrante 1 - Thumb Principal (Roda de Bobo)

## Resumo
Substituir as fotos atuais dos presets do Quadrante 1 por novas fotos fornecidas, adicionando o Beltrao que nao existia antes. As fotos serao usadas exatamente como enviadas, sem transformacoes.

## Mudancas

### 1. Substituir assets em `public/cortes/presets/`
- Apagar as 5 fotos atuais (caze.png, donan.png, igor.png, lff.png, simoes.png)
- Salvar as 6 novas fotos:
  - `beltrao.png` (de BELTRAO-QD1_-_Copia.png)
  - `lff.png` (de LFF-QD1-2.png)
  - `simoes.png` (de SIMOES-QD1-2.png)
  - `igor.png` (de IGOR-QD1-2.png)
  - `donan.png` (de DONAN-QD1-2.png)
  - `caze.png` (de CAZE-QD1-2.png)

### 2. Atualizar `src/components/cortes/CortesControls.tsx`
- Adicionar "Beltrao" ao array `QUADRANT_PRESETS`:
```text
const QUADRANT_PRESETS = [
  { label: 'Beltrao', url: '/cortes/presets/beltrao.png' },
  { label: 'LFF', url: '/cortes/presets/lff.png' },
  { label: 'Simoes', url: '/cortes/presets/simoes.png' },
  { label: 'Igor', url: '/cortes/presets/igor.png' },
  { label: 'Donan', url: '/cortes/presets/donan.png' },
  { label: 'Caze', url: '/cortes/presets/caze.png' },
];
```

### 3. Atualizar `src/components/cortes/CortesThumbBuilder.tsx`
- Remover as transformacoes pre-definidas do preset Caze (`PRESET_TRANSFORMS`), ja que as fotos devem ser usadas exatamente como estao, sem ajustes automaticos de posicao/escala
- O `PRESET_TRANSFORMS` ficara vazio: `{}`

### Resultado esperado
Ao selecionar um preset no Quadrante 1, a foto sera carregada exatamente como enviada, sem nenhuma transformacao aplicada, funcionando como uma "logo atras da logo".

