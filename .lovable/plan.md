
## Hub Inicial - Tela de Seleção de Modelo

Criar uma tela inicial (landing page) onde o usuário escolhe qual ferramenta deseja usar antes de entrar no editor.

### O que vai mudar

1. **Nova página `src/pages/Hub.tsx`** -- Tela inicial com 4 cards grandes para o usuário escolher entre:
   - **Melhores Momentos** (vai para `/melhores-momentos`)
   - **Jogo Completo** (vai para `/jogo-completo`)
   - **Ao Vivo** (vai para `/ao-vivo`)
   - **Cortes** (vai para `/cortes`)

   Cada card terá o nome do modelo, um icone representativo (usando Lucide icons) e uma breve descrição. Layout responsivo em grid (2x2 no desktop, 1 coluna no mobile).

2. **Atualização de rotas em `src/App.tsx`**:
   - `/` -- Nova página Hub (seleção de modelo)
   - `/melhores-momentos` -- Página Index com canvas "mm" pré-selecionado
   - `/jogo-completo` -- Página Index com canvas "jc" pré-selecionado
   - `/ao-vivo` -- Página Index com canvas "av" pré-selecionado
   - `/cortes` -- CortesHub (sem alteração)
   - `/cortes/:id` -- CortesProgramBuilder (sem alteração)

3. **Atualização de `src/pages/Index.tsx`**:
   - Receber o modelo ativo via parâmetro de rota ou prop
   - Remover o seletor "Thumbnail Ativa" (ViewControls), já que o modelo é definido pela rota escolhida no Hub
   - Adicionar botão "Voltar" para retornar ao Hub

4. **Atualização de `src/pages/CortesHub.tsx`**:
   - Trocar o link "Melhores Momentos" por um link "Voltar" apontando para `/`

### Detalhes Técnicos

- A página Hub usará `react-router-dom` `useNavigate` para navegar
- O `Index.tsx` usará `useParams` ou a rota atual para determinar qual `ActiveCanvas` exibir (`mm`, `jc` ou `av`)
- O componente `ViewControls` será removido da página Index, simplificando a interface
- Nenhuma dependencia nova necessaria
