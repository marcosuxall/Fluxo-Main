# Roteiro de interações

Este roteiro vale para as duas versões do protótipo: **o site** (`web/`) e **o protótipo do Figma**. As interações são as mesmas.

> No Figma, abra o link com `hide-ui=1` e escolha o fluxo **"Fluxo de Login"**. No site, abra `…/web/` (ou `…/web/#painel` para pular o login).

## 1. Login

| # | Ação | O que acontece | Tipo de interação no Figma |
|---|---|---|---|
| 1 | Clicar em um campo | Borda e brilho roxos de foco | Componente interativo (`On click → Change to`) |
| 2 | Marcar **Lembrar de mim** | Checkbox liga e desliga | Componente interativo (alternância) |
| 3 | Passar o mouse em qualquer botão | Botão escurece | `While hovering` em variante |
| 4 | **Esqueci minha senha** | Modal abre com fundo escuro e o card sobe | Overlay + `After delay → Change to` (Smart Animate) |
| 5 | **Enviar link** | Troca para o modal "Verifique seu e-mail" | `Swap overlay` |
| 6 | **X**, **Cancelar**, clique fora ou **Esc** | Fecha o modal | `Close overlay` + gatilho de teclado |
| 7 | **Entrar** ou tecla **Enter** | Botão vira "Entrando…" com pontos animados | `On click` / `Key Enter → Navigate` |
| 8 | Esperar 1,6 s | Painel abre sozinho | `After delay → Navigate` (Smart Animate) |

## 2. Painel

| # | Ação | O que acontece | Tipo de interação no Figma |
|---|---|---|---|
| 9 | Mouse na sidebar, cards e linhas | Destaque, card elevado, seta na linha | `While hovering` |
| 10 | **Hoje / 7 dias / 30 dias** | Números dos cards mudam | Variantes do "Bloco de métricas" |
| 11 | Clicar no **sino** | Dropdown de notificações | Componente interativo |
| 12 | **Marcar como lidas** | Badge vermelho e pontos de "não lida" somem | **Variável** `temNotificacoes = false` |
| 13 | Clicar em **Ana Souza** | Menu do usuário abre para cima | Componente interativo |
| 14 | **+ Novo registro** ou tecla **N** | Drawer de cadastro abre na direita | Overlay + gatilho de teclado |
| 15 | Clicar em **Pago / Pendente** | Seleção troca | Componente interativo (radio) |
| 16 | **Salvar registro** | Nova linha entra no topo e aparece um aviso | `Navigate` (Smart Animate) |
| 17 | Esperar 3 s ou clicar no **X** do aviso | Aviso desaparece | `After delay → Change to` |
| 18 | **Sair** (botão ou menu) | Volta ao login e reseta as notificações | Ações múltiplas: `Set variable` + `Navigate` |

## Atalhos de teclado

| Tecla | Onde | Ação |
|---|---|---|
| `Enter` | Login | Entrar |
| `N` | Painel | Abrir "Novo registro" |
| `Esc` | Modais, drawer e menus | Fechar |

## Dica para a apresentação

Faça uma passada completa em uma aba anônima antes da reunião. Ao clicar em **Sair**, o protótipo volta ao estado inicial (notificações não lidas, tabela original), pronto para a próxima demonstração.
