# Design system

## Cores

Definidas em [`design/tokens.json`](../design/tokens.json). No Figma, ficam na coleção de variáveis **Tokens** (`color/<nome>`); no site, viram variáveis CSS (`--<nome>`).

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#4F46E5` | Ações principais, painel da marca, foco |
| `primary-hover` | `#4338CA` | Hover e estado de carregamento do botão principal |
| `primary-soft` | `#EEEFFF` | Item ativo da navegação, chips selecionados |
| `primary-border` | `#C7C7FA` | Borda de card em hover |
| `text` | `#0F172A` | Texto principal, aviso (toast), fundo dos overlays a 50% |
| `text-muted` | `#64748B` | Texto de apoio |
| `text-subtle` | `#99A6B8` | Ícone de fechar do aviso |
| `border` | `#E2E8F0` | Bordas e divisores |
| `surface` | `#FFFFFF` | Cards, campos, sidebar |
| `background` | `#F8FAFC` | Fundo do painel, hover de linha |
| `surface-hover` | `#F1F4F8` | Hover de botão secundário, trilho do filtro |
| `success` / `success-soft` | `#16A34A` / `#DCFCE7` | Status "Pago", variação positiva |
| `warning` / `warning-soft` | `#B45309` / `#FEF3C7` | Status "Pendente" |
| `danger` | `#DC2626` | Badge de notificação, "Sair da conta" |

## Tipografia

**Inter**, nos pesos 400, 500, 600 e 700.

| Papel | Tamanho / peso |
|---|---|
| Título do painel da marca | 44 / Bold |
| Títulos de tela | 28 / Bold |
| Valor das métricas | 28 / Bold |
| Títulos de modal | 20 / Bold |
| Títulos de seção | 16 / Semi Bold |
| Corpo | 14–15 / Regular |
| Rótulos e apoio | 12–13 / Medium |

## Componentes no Figma

Todos ficam na seção **Componentes** da página *Fluxo Main*.

| Componente | Variantes | Interação embutida |
|---|---|---|
| Button | Tipo: Primário, Secundário · Estado: Padrão, Hover, Carregando | Hover; o estado Carregando contém o Loader |
| Loader | Passo 1, 2, 3 | Loop automático a cada 0,25 s |
| Input | Padrão, Focado | Clique alterna o foco |
| Checkbox | Marcado: Sim, Não | Clique alterna |
| Nav Item | Padrão, Hover, Ativo | Hover |
| Stat Card | Padrão, Hover | Hover (elevação) |
| Linha da tabela | Status: Pago, Pendente · Estado: Padrão, Hover | Hover |
| Bloco de métricas | Período: Hoje, 7 dias, 30 dias | Filtro segmentado troca a variante |
| Notificações | Fechado, Aberto | Dropdown; "Marcar como lidas" altera a variável `temNotificacoes` |
| Menu do usuário | Fechado, Aberto | Menu abre para cima; "Sair da conta" reseta a variável e navega |
| Seletor de status | Seleção: Pago, Pendente | Radio |
| Toast | Visível, Oculto | Some sozinho em 3 s ou ao clicar no X |
| Modal — Recuperar senha / E-mail enviado | Entrada, Aberto | Animação de entrada |
| Drawer — Novo registro | Entrada, Aberto | Animação de entrada |

## Variáveis de protótipo

| Variável | Tipo | Uso |
|---|---|---|
| `temNotificacoes` (coleção *Protótipo*) | Boolean | Controla a visibilidade do badge e dos pontos de "não lida" |
