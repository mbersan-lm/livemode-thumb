

# Ajustar Escudos no Modelo Ao Vivo

## O que sera feito

1. **Subir todos os escudos em 10px** - Alterar o `top` de `537px` para `527px` em ambos os escudos (home e away).

2. **Diminuir escudos do Brann e Celta de Vigo em 70%** - Adicionar logica condicional para que, quando o time selecionado for Brann (id: `av5`) ou Celta de Vigo (id: `av6`), o escudo tenha `maxWidth` e `maxHeight` de `150px` (30% de 500px) em vez dos `500px` padrao.

## Detalhes Tecnicos

**Arquivo:** `src/components/ThumbnailCanvasAoVivo.tsx`

1. Linhas 232 e 249: alterar `top: '537px'` para `top: '527px'`

2. Adicionar logica para calcular tamanho do escudo com base no time:
   - IDs afetados: `av5` (Brann) e `av6` (Celta de Vigo)
   - Times com esses IDs terao `maxWidth/maxHeight: '150px'`
   - Demais times mantem `maxWidth/maxHeight: '500px'`

3. Aplicar a mesma logica para ambos os escudos (home e away), verificando o ID do time correspondente

