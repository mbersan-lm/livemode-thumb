

# Animacao de Abelhas Voando no Hub

## Objetivo
Adicionar abelhas animadas voando pelas laterais da tela no Hub inicial, sem sobrepor os botoes/cards centrais.

## Abordagem
Criar abelhas como elementos CSS animados posicionados nas laterais da tela (esquerda e direita), usando `position: fixed` com `pointer-events: none` para nao interferir nos cliques. As abelhas seguirao trajetorias curvas usando keyframes CSS.

## Mudancas

### 1. Criar componente `src/components/FlyingBees.tsx`
- Componente que renderiza multiplas abelhas (6-8) como emojis ou SVGs
- Cada abelha tera:
  - Posicao fixa nas laterais (left: 0-15% ou right: 0-15%), nunca no centro
  - Animacao de voo com keyframes personalizados (movimento vertical + leve oscilacao horizontal)
  - Tamanhos e velocidades variados para efeito natural
  - `pointer-events: none` para nao bloquear interacoes
  - `z-index` baixo para ficar atras dos cards

### 2. Atualizar `src/pages/Home.tsx`
- Importar e renderizar o componente `FlyingBees` dentro do container principal

### 3. Adicionar keyframes em `src/index.css`
- `bee-fly-left`: trajetoria de voo na lateral esquerda (sobe e desce com oscilacao)
- `bee-fly-right`: trajetoria de voo na lateral direita
- `bee-wobble`: pequena oscilacao lateral para simular batida de asas

## Detalhes Tecnicos

### Posicionamento das abelhas
As abelhas ficarao restritas as faixas laterais da tela:
- Lado esquerdo: `left: 2% a 12%`
- Lado direito: `right: 2% a 12%`
- Nunca no centro onde ficam os cards (area ~20%-80% da tela)

### Animacoes CSS
- Cada abelha tera `animation-duration` entre 8s e 15s para variedade
- `animation-delay` diferente para cada uma, evitando sincronia
- Movimento principal: subir e descer pela tela com curvas suaves
- Movimento secundario: leve rotacao e oscilacao horizontal

### Emoji vs SVG
Usaremos o emoji de abelha para simplicidade e compatibilidade.

