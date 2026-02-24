

# Hub Inicial - Seletor de Modelo

## Objetivo

Criar uma pagina inicial (hub) que sera a primeira tela do site. O usuario escolhe entre 4 modelos: **Melhores Momentos**, **Jogo Completo**, **Ao Vivo** e **Cortes**. Ao clicar, ele e redirecionado para o editor correspondente.

## Estrutura

Atualmente, a rota `/` carrega o `Index.tsx` que contem os 3 primeiros modelos juntos (com um switcher interno). A rota `/cortes` leva ao hub de Cortes.

### Mudancas planejadas:

1. **Criar pagina `src/pages/Home.tsx`** -- o novo hub inicial com 4 cards grandes para selecionar o modelo.

2. **Criar pagina `src/pages/MelhoresMomentos.tsx`** -- mover a logica atual de "Melhores Momentos" (activeCanvas = 'mm') para sua propria rota, sem o ViewControls switcher.

3. **Criar pagina `src/pages/JogoCompleto.tsx`** -- mover a logica de "Jogo Completo" (activeCanvas = 'jc') para sua propria rota.

4. **Criar pagina `src/pages/AoVivo.tsx`** -- mover a logica de "Ao Vivo" (activeCanvas = 'av') para sua propria rota.

5. **Atualizar `src/App.tsx`** -- novas rotas:

```text
/              -> Home (hub de selecao)
/melhores-momentos -> MelhoresMomentos
/jogo-completo     -> JogoCompleto
/ao-vivo           -> AoVivo
/cortes            -> CortesHub (sem mudanca)
/cortes/:id        -> CortesProgramBuilder (sem mudanca)
```

6. **Remover `src/pages/Index.tsx`** -- o conteudo sera distribuido entre as 3 novas paginas.

7. **Remover `src/components/controls/ViewControls.tsx`** -- o switcher de thumbnail ativa nao sera mais necessario, ja que cada modelo tera sua propria pagina.

## Design do Hub (Home.tsx)

- Tela com fundo escuro, titulo centralizado ("Gerador de Thumbnails")
- Grid 2x2 (ou 1 coluna em mobile) com 4 cards:
  - **Melhores Momentos** -- icone + descricao curta -> navega para `/melhores-momentos`
  - **Jogo Completo** -- icone + descricao curta -> navega para `/jogo-completo`
  - **Ao Vivo** -- icone + descricao curta -> navega para `/ao-vivo`
  - **Cortes** -- icone + descricao curta -> navega para `/cortes`
- Cards com hover effect, usando cores do design system existente
- Cada card tera um botao de voltar (ArrowLeft) no header da pagina do editor, levando de volta ao hub `/`

## Detalhes Tecnicos

### Home.tsx
- Componente simples com `useNavigate` do react-router-dom
- Cards usando componentes shadcn/ui existentes (Card, Button)
- Icones do lucide-react (Play, Film, Radio, Scissors ou similares)

### Paginas dos editores (MelhoresMomentos, JogoCompleto, AoVivo)
- Cada pagina herda o state e handlers relevantes do Index.tsx atual
- Remove o ViewControls e fixa o `activeCanvas` correspondente
- Adiciona botao "Voltar" no header linkando para `/`
- A pagina AoVivo mantem os controles especificos (template selector, gradient controls, som ambiente)
- As paginas MelhoresMomentos e JogoCompleto mantem as abas Template, Foto, Times e Exportar

### Limpeza
- Remover o arquivo `Index.tsx` e o `ViewControls.tsx`
- Remover o tipo `ActiveCanvas` exportado de ViewControls (ou mover se ainda necessario internamente)
- Atualizar os links de navegacao existentes (ex: botao "Cortes" no header do Index apontava para `/cortes`, agora cada editor tera botao voltando para `/`)

