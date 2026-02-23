

# Traducao para Portugues + Botoes arredondados com borda branca

## Escopo
Apenas textos da interface e estilo dos botoes. Nenhuma alteracao em logica, modelos, preview ou download.

## 1. Botoes mais arredondados com borda branca de 1px

### Arquivo: `src/components/ui/button.tsx`
- Alterar o `border-radius` base de `rounded-md` para `rounded-full` (totalmente arredondado)
- Adicionar `border border-white/80` ao estilo base de todos os botoes
- Ajustar as variantes para manter consistencia com a borda branca

## 2. Traducao de textos em ingles para portugues

### Arquivo: `src/pages/Index.tsx`
| Texto atual | Novo texto |
|---|---|
| `Thumbnail Generator` | `Gerador de Thumbnails` |
| `Cortes →` | `Cortes →` (ja esta em PT) |

### Arquivo: `src/components/controls/ViewControls.tsx`
| Texto atual | Novo texto |
|---|---|
| `Thumbnail Ativa` | ja esta em PT |

### Arquivo: `src/components/controls/TemplateControls.tsx`
| Texto atual | Novo texto |
|---|---|
| `Select Template` | `Selecionar Template` |
| `Each template has its own:` | `Cada template possui:` |
| `Background design (KV)` | `Design de fundo (KV)` |
| `Team selection` | `Selecao de times` |
| `Score font style` | `Estilo da fonte do placar` |

### Arquivo: `src/components/controls/TeamControls.tsx`
| Texto atual | Novo texto |
|---|---|
| `Home Team` | `Time da Casa` |
| `Select home team` | `Selecionar time da casa` |
| `Away Team` | `Time Visitante` |
| `Select away team` | `Selecionar time visitante` |
| `Home Score` | `Placar Casa` |
| `Away Score` | `Placar Visitante` |
| `Home (menor)` | ja esta em PT |
| `Away (menor)` | `Visitante (menor)` |

### Arquivo: `src/components/controls/PhotoControls.tsx`
| Texto atual | Novo texto |
|---|---|
| `Upload Player Photo` | `Enviar Foto do Jogador` |
| `Position X:` | `Posicao X:` |
| `Position Y:` | `Posicao Y:` |
| `Uniform Zoom:` | `Zoom:` |
| `Quick Actions` | `Acoes Rapidas` |
| `AI Expand (1280x720)` | `Expandir com IA (1280x720)` |
| `Expandindo...` | ja esta em PT |
| `Center` | `Centralizar` |
| `Reset All` | `Redefinir Tudo` |

### Arquivo: `src/components/controls/ExportControls.tsx`
| Texto atual | Novo texto |
|---|---|
| `Export Settings` | `Configuracoes de Exportacao` |
| `Resolution: 1280 x 720 px` | `Resolucao: 1280 x 720 px` |
| `Format: JPG` | `Formato: JPG` |
| `Quality: 90%` | `Qualidade: 90%` |
| `Export Melhores Momentos` | `Exportar Melhores Momentos` |
| `Export Jogo Completo` | `Exportar Jogo Completo` |
| `Generating Melhores Momentos JPG...` | `Gerando JPG Melhores Momentos...` |
| `Generating Jogo Completo JPG...` | `Gerando JPG Jogo Completo...` |
| `Melhores Momentos JPG exported successfully!` | `JPG Melhores Momentos exportado!` |
| `Jogo Completo JPG exported successfully!` | `JPG Jogo Completo exportado!` |
| `Canvas not ready` | `Canvas nao esta pronto` |
| `Failed to export JPG` | `Falha ao exportar JPG` |
| `Failed to export Jogo Completo JPG` | `Falha ao exportar JPG Jogo Completo` |

### Arquivo: `src/components/cortes/CortesThumbBuilder.tsx`
| Texto atual | Novo texto |
|---|---|
| `Thumbnail Generator` (linha 343) | `Gerador de Thumbnails` |

### Arquivo: `src/components/cortes/PipAiGenerator.tsx`
| Texto atual | Novo texto |
|---|---|
| Ja esta todo em portugues | -- |

### Arquivo: `src/pages/NotFound.tsx`
| Texto atual | Novo texto |
|---|---|
| `404` | `404` |
| `Oops! Page not found` | `Pagina nao encontrada` |
| `Return to Home` | `Voltar ao Inicio` |

### Arquivo: `src/pages/Index.tsx` (tabs)
| Texto atual | Novo texto |
|---|---|
| `Template` | `Template` (manter) |
| `Photo` | `Foto` |
| `Teams` | `Times` |
| `Export` | `Exportar` |

## Arquivos alterados (total: 8)
1. `src/components/ui/button.tsx` -- estilo arredondado + borda branca
2. `src/pages/Index.tsx` -- traducao das tabs e subtitulo
3. `src/pages/NotFound.tsx` -- traducao
4. `src/components/controls/TemplateControls.tsx` -- traducao
5. `src/components/controls/TeamControls.tsx` -- traducao
6. `src/components/controls/PhotoControls.tsx` -- traducao
7. `src/components/controls/ExportControls.tsx` -- traducao
8. `src/components/cortes/CortesThumbBuilder.tsx` -- traducao do subtitulo

## O que NAO muda
- Nenhum canvas, preview ou logica de download
- Nenhum modelo de thumb
- Nenhuma edge function
- Nenhuma cor ou fonte (ja foram alteradas anteriormente)
