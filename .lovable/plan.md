

## Plano: Remover opção "Jogo Completo" no template Libertadores

### Alterações

1. **`src/components/controls/ViewControls.tsx`**
   - Adicionar prop `template` ao componente
   - Quando `template === 'libertadores'`, esconder o tab "Jogo Completo" (mostrar apenas "Melhores Momentos" em coluna única)
   - Se o canvas ativo for `'jc'` e o template mudar para Libertadores, forçar volta para `'mm'`

2. **`src/pages/Index.tsx`**
   - Passar `state.template` como prop para `ViewControls`
   - Adicionar `useEffect` que reseta `activeCanvas` para `'mm'` quando o template mudar para `'libertadores'` e o canvas ativo for `'jc'`

