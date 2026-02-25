
## Objetivo
Corrigir definitivamente o efeito glass (desfoque) dos retângulos dos escudos no endpoint de geração “Ao Vivo”, para que o resultado do webhook fique visualmente igual ao export do site.

## Diagnóstico (com base no código atual)
1. O tamanho dos escudos já está correto (isso foi resolvido).
2. O edge function já tenta aplicar blur com:
   - `ctx.filter = "blur(20px)"`
   - `ctx.drawImage(tempCanvas, 0, 0)`
3. Mesmo assim, no resultado do webhook o blur não aparece.
4. Causa mais provável: no runtime do canvas usado no backend (`deno.land/x/canvas@v1.4.2`), o `ctx.filter` não está sendo aplicado de forma confiável para esse caso (sem erro explícito, mas sem efeito visual).

## Estratégia de correção
Substituir a dependência de `ctx.filter` por um blur manual (determinístico), que funciona mesmo quando `filter` não é suportado no backend.

```text
Hoje:
clip -> ctx.filter blur(20px) -> drawImage(snapshot) -> fill semitransparente -> borda

Depois:
clip -> blur manual por múltiplas amostras deslocadas do snapshot -> fill semitransparente -> borda
```

## Alterações planejadas (arquivo único)
### Arquivo
- `supabase/functions/generate-ao-vivo/index.ts`

### Mudanças
1. **Adicionar helper de blur manual para backdrop**
   - Criar função utilitária que desenha o `tempCanvas` várias vezes com pequenos offsets (kernel), com `globalAlpha` distribuído.
   - Isso simula blur real dentro da área clipada sem depender de `ctx.filter`.

2. **Atualizar `drawGlassPanel`**
   - Manter `roundRect + clip`.
   - Trocar bloco `ctx.filter = "blur(20px)"` por chamada ao helper de blur manual.
   - Manter preenchimento `color + "33"` e borda.

3. **Paridade visual exata da borda inferior**
   - Preservar borda dos painéis centrais como `rgba(255,255,255,0.35)`.
   - Garantir painel inferior preto com borda branca sólida (como no preview/export do site).

4. **Não alterar restante da pipeline**
   - Manter lógica de:
     - payload simplificado (`nomeTimeA`, `nomeTimeB`, `competicao`, `modelo`)
     - lookup interno de escudos
     - tamanhos dinâmicos dos escudos
     - overlays (`sem narracao` / `som ambiente`)
     - upload no storage público e retorno `{ url }`.

## Detalhes técnicos (seção técnica)
- O blur manual será feito no contexto já clipado do painel.
- Técnica:
  - usar snapshot (`tempCanvas`) feito antes de desenhar os painéis.
  - desenhar N amostras deslocadas (ex.: offsets em grade radial) para simular raio ~20px.
  - normalizar alpha total para evitar escurecimento/clareamento.
- Vantagens:
  - comportamento consistente no backend.
  - independência de suporte parcial do `ctx.filter`.
  - resultado visual previsível entre chamadas do webhook.

## Plano de validação
1. **Teste E2E obrigatório (webhook vs site)**  
   Gerar a mesma thumb pelos dois fluxos e comparar visualmente os painéis glass.
2. Testar com `modelo: "sem narracao"` e com modelo padrão.
3. Testar confronto com escudos grandes e pequenos (incluindo override de tamanho).
4. Confirmar:
   - blur visível dentro dos 2 painéis centrais;
   - borda correta dos painéis;
   - posicionamento e tamanho dos escudos preservados;
   - resposta JSON e URL pública sem regressão.

## Critérios de aceite
- O desfoque dos retângulos dos escudos fica perceptível e equivalente ao export do site.
- Não há regressão no tamanho/posição dos escudos.
- Fluxo do webhook permanece com o payload simplificado e resposta pública idêntica.
- Sem alterações em frontend, banco ou migrations.
