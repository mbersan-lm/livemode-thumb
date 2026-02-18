
# Ajustes no Builder de Cortes

## 1. PIP: imagem preencher o frame por padrao (fill)

Atualmente a imagem PIP usa `objectFit: 'contain'`, o que deixa barras pretas quando a proporcao nao bate. Mudar para `objectFit: 'cover'` faz a imagem preencher todo o frame, cortando o excesso. Assim, ao redefinir os parametros, a imagem sempre aparece preenchendo o PIP.

### Arquivo: `src/components/cortes/CortesCanvas.tsx`
- Linha 100: trocar `objectFit: 'contain'` por `objectFit: 'cover'`

---

## 2. Espaco visual entre pontuacao e texto vermelho

O problema: quando o usuario escreve `É,*GIGANTE*`, a virgula gruda no texto vermelho. A solucao e adicionar um espaco fino (hair space ou margem) automaticamente no render, sem alterar o conteudo do textarea.

### Arquivo: `src/components/cortes/CortesCanvas.tsx`

Substituir a logica de render do texto (linhas 170-174) por uma funcao que:

1. Faz o split normal por `*...*`
2. Para cada trecho em vermelho, adiciona uma pequena margem CSS (`marginLeft` e `marginRight` de ~0.15em) no `<span>` vermelho
3. Isso cria separacao visual entre pontuacao e a palavra colorida sem mexer no textarea

Logica do render atualizado:

```text
thumbText.split(/(\*[^*]+\*)/g).map((part, i) => {
  if (part.startsWith('*') && part.endsWith('*')) {
    return <span key={i} style={{
      color: '#D02046',
      marginLeft: '0.15em',
      marginRight: '0.15em'
    }}>{part.slice(1, -1)}</span>
  }
  return part;
})
```

A margem de 0.15em e proporcional ao tamanho da fonte e cria um espacamento sutil que evita a colagem da pontuacao sem ser exagerado. O textarea permanece inalterado -- o usuario continua digitando normalmente sem espacos extras.

### Arquivos modificados:
- `src/components/cortes/CortesCanvas.tsx` (2 mudancas: objectFit e margem no span vermelho)
