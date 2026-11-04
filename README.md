<div align="center">

<img src="docs/screens/03-painel.png" alt="Painel do Nexo" width="760">

# Nexo · Fluxo Main

**Protótipo navegável de um sistema de gestão (login + painel), desenhado no Figma e sincronizado com este repositório.**

[![Protótipo no ar](https://img.shields.io/badge/▶_abrir_protótipo-4F46E5?style=for-the-badge)](https://SEU-USUARIO.github.io/nexo-fluxo-main/web/)
[![Figma](https://img.shields.io/badge/Figma-protótipo-0F172A?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/proto/T00OQ9bu7XArjEOzYAA5xP/Fluxo-main?node-id=4-2&starting-point-node-id=4%3A2&scaling=scale-down&hide-ui=1)
[![Publicação](https://github.com/SEU-USUARIO/nexo-fluxo-main/actions/workflows/pages.yml/badge.svg)](https://github.com/SEU-USUARIO/nexo-fluxo-main/actions/workflows/pages.yml)

</div>

---

## Links rápidos

| Para quê | Link |
|---|---|
| Apresentar ao cliente (site, sem Figma) | https://SEU-USUARIO.github.io/nexo-fluxo-main/web/ |
| Apresentar no Figma (modo apresentação) | [Protótipo no Figma](https://www.figma.com/proto/T00OQ9bu7XArjEOzYAA5xP/Fluxo-main?node-id=4-2&starting-point-node-id=4%3A2&scaling=scale-down&hide-ui=1) |
| Editar o design | [Arquivo no Figma](https://www.figma.com/design/T00OQ9bu7XArjEOzYAA5xP/Fluxo-main) |
| Abrir na sua máquina | `git clone https://github.com/SEU-USUARIO/nexo-fluxo-main.git && cd nexo-fluxo-main && npm start` |

## Rodando na sua máquina

Você só precisa do [Node.js](https://nodejs.org) 18 ou mais novo. Não há dependências para instalar.

```bash
git clone https://github.com/SEU-USUARIO/nexo-fluxo-main.git
cd nexo-fluxo-main
npm start
```

O navegador abre sozinho em `http://localhost:4321/web/`. Para usar outra porta: `PORT=5000 npm start`.

> Abrir o `web/index.html` com duplo clique não funciona, porque o navegador bloqueia a leitura dos arquivos `design/*.json` fora de um servidor. Use o `npm start`.

## O fluxo

```mermaid
flowchart LR
    L["Login"] -->|"Entrar ou Enter"| E["Entrando…<br/>(1,6 s)"]
    E -->|"automático"| P["Painel"]
    L -->|"Esqueci minha senha"| R(["Modal: Recuperar senha"])
    R -->|"Enviar link"| S(["Modal: E-mail enviado"])
    P -->|"+ Novo registro ou tecla N"| D(["Drawer: Novo registro"])
    D -->|"Salvar registro"| PS["Painel<br/>com registro salvo + aviso"]
    P -->|"Sair"| L
    PS -->|"Sair"| L
```

| Tela | Imagem |
|---|---|
| Login | <img src="docs/screens/01-login.png" width="380"> |
| Entrando (carregamento) | <img src="docs/screens/02-entrando.png" width="380"> |
| Painel | <img src="docs/screens/03-painel.png" width="380"> |
| Painel com registro salvo | <img src="docs/screens/04-painel-registro-salvo.png" width="380"> |
| Recuperar senha | <img src="docs/screens/05-overlay-recuperar-senha.png" width="380"> |
| E-mail enviado | <img src="docs/screens/06-overlay-email-enviado.png" width="380"> |
| Novo registro | <img src="docs/screens/07-overlay-novo-registro.png" width="380"> |

O roteiro completo de apresentação, com todas as interações, está em **[docs/interacoes.md](docs/interacoes.md)**.

## Sincronização Git ⇄ Figma

Os **textos** e as **cores** do protótipo vivem em dois arquivos, que são a fonte única da verdade:

| Arquivo | O que controla |
|---|---|
| [`design/tokens.json`](design/tokens.json) | Paleta de cores (16 tokens), raios de borda e fonte |
| [`design/content.json`](design/content.json) | Todos os textos: login, painel, métricas por período, tabela, notificações |

```mermaid
flowchart LR
    G[("GitHub<br/>design/*.json")]
    F["Figma<br/>Fluxo Main"]
    W["Site do protótipo<br/>(GitHub Pages)"]
    G -- "Plugin Nexo Sync<br/>⬇ Puxar do GitHub" --> F
    F -- "Plugin Nexo Sync<br/>⬆ Enviar para o GitHub" --> G
    G -- "Deploy automático<br/>a cada push" --> W
    F -. "Action diária<br/>imagens das telas" .-> G
```

- **Mudou no Git?** Edite o JSON, faça o commit e, no Figma, rode **Plugins → Development → Nexo Sync → ⬇ Puxar do GitHub**. O site se atualiza sozinho.
- **Mudou no Figma?** Rode **⬆ Enviar para o GitHub** no mesmo plugin. Ele faz o commit e o site se atualiza.

Passo a passo de instalação do plugin, como gerar os tokens e o que é e o que não é sincronizado: **[docs/sincronizacao.md](docs/sincronizacao.md)**.

## Estrutura

```
nexo-fluxo-main/
├── design/
│   ├── tokens.json          # cores, raios, fonte (fonte da verdade)
│   └── content.json         # textos das telas (fonte da verdade)
├── web/                     # protótipo navegável (HTML + CSS + JS puro)
├── figma-plugin/            # plugin "Nexo Sync" (GitHub ⇄ Figma)
├── scripts/
│   ├── serve.mjs            # npm start
│   ├── validate.mjs         # npm run validate
│   └── figma-snapshot.mjs   # npm run snapshot (exporta PNGs do Figma)
├── docs/
│   ├── interacoes.md        # roteiro de apresentação
│   ├── sincronizacao.md     # como o Git ⇄ Figma funciona
│   ├── design-system.md     # tokens e componentes
│   └── screens/             # imagens das telas
├── .github/workflows/
│   ├── pages.yml            # publica o site a cada push
│   └── figma-snapshot.yml   # atualiza as imagens a partir do Figma
└── publicar.sh / .ps1       # cria o repositório no GitHub (uso único)
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm start` | Sobe o protótipo em `localhost:4321` e abre o navegador |
| `npm run validate` | Confere se `design/*.json` estão completos (também roda antes de cada publicação) |
| `FIGMA_TOKEN=… npm run snapshot` | Baixa do Figma as imagens atualizadas das telas para `docs/screens/` |

## Design system

Documentação dos tokens de cor, tipografia e dos componentes interativos do Figma: **[docs/design-system.md](docs/design-system.md)**.

---

<sub>Desenhado no Figma · Protótipo em HTML, CSS e JavaScript sem dependências · Licença MIT</sub>
