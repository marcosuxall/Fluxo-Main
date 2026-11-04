# Sincronização Git ⇄ Figma

## A ideia

Os dois arquivos em `design/` são a **fonte única da verdade** para cores e textos:

- `design/tokens.json` → no Figma vira a coleção de variáveis **Tokens** (`color/primary`, `color/text`…). Todas as cores do arquivo estão ligadas a essas variáveis, então mudar uma variável recolore o design inteiro.
- `design/content.json` → no Figma, cada camada cujo nome começa com `#` recebe o valor daquele caminho do JSON. Exemplos:

| Camada no Figma | Tipo | Caminho no JSON |
|---|---|---|
| `#login.title` | Texto | `login.title` |
| `#dashboard.greeting` | Texto | `dashboard.greeting` |
| `#metrics.30d.0` | Instância de *Stat Card* | `metrics["30d"][0]` → `{ Label, Valor, Variação }` |
| `#table.rows.2` | Instância de *Linha da tabela* | `table.rows[2]` → `{ Cliente, Status, Valor }` |
| `#notifications.1.title` | Texto | `notifications[1].title` |

Em instâncias, cada chave do objeto preenche a propriedade de mesmo nome do componente. Isso vale para texto (`Cliente`, `Valor`) e para variantes (`Status: "Pago" | "Pendente"`).

## Instalar o plugin Nexo Sync (uma vez)

O plugin fica neste repositório, em `figma-plugin/`. Plugins locais só funcionam no **app de desktop do Figma**.

1. Clone o repositório (veja o README).
2. No Figma Desktop, abra o arquivo **Fluxo-main**.
3. Menu **Plugins → Development → Import plugin from manifest…** e escolha `figma-plugin/manifest.json`.
4. Rode em **Plugins → Development → Nexo Sync**.
5. Preencha **usuário**, **repositório** e **branch** (`main`).

### Token do GitHub (para enviar)

Puxar de um repositório público não exige token. Para **enviar**, crie um token *fine-grained*:

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. *Repository access*: **Only select repositories** → este repositório.
3. *Permissions → Repository permissions → Contents*: **Read and write**.
4. Cole o token no campo do plugin. Ele fica salvo só no seu computador (`figma.clientStorage`).

## Fluxos do dia a dia

### Mudei no GitHub → quero no Figma

1. Edite `design/content.json` ou `design/tokens.json`, pelo próprio site do GitHub ou no seu editor.
2. Faça o commit. O site do protótipo é republicado sozinho (~1 min).
3. No Figma: **Nexo Sync → ⬇ Puxar do GitHub**. O plugin mostra quantas cores e camadas mudaram.

### Mudei no Figma → quero no GitHub

1. Altere um texto marcado com `#`, uma propriedade de instância marcada com `#` ou uma variável da coleção **Tokens**.
2. **Nexo Sync → ⬆ Enviar para o GitHub**. O plugin compara com o que está no repositório e só faz commit se algo mudou (`sync(figma): …`).
3. O site se atualiza sozinho.

### Imagens das telas

A action **Atualizar imagens das telas** (`.github/workflows/figma-snapshot.yml`) baixa PNGs das telas do Figma para `docs/screens/` nos dias úteis, ou quando você roda manualmente em **Actions → Run workflow**. Ela precisa do secret `FIGMA_TOKEN`:

1. Figma → **Settings → Security → Personal access tokens** → gere um token com leitura de *File content*.
2. GitHub → repositório → **Settings → Secrets and variables → Actions → New repository secret** → nome `FIGMA_TOKEN`.

## O que sincroniza e o que não

| Sincroniza | Não sincroniza |
|---|---|
| Cores (variáveis da coleção **Tokens**) | Layout, tamanhos e posições |
| Textos de camadas nomeadas com `#` | Criação ou remoção de telas e componentes |
| Propriedades de texto e variante de instâncias `#` | Interações do protótipo |
| | Raios e fonte (documentados em `tokens.json`, aplicados só no site) |

Mudanças de **estrutura** (uma tela nova, outro componente, nova interação) precisam ser feitas nos dois lados. O jeito mais rápido é pedir ao Claude, que tem acesso ao Figma e consegue replicar a mudança. Para colocar um texto novo na sincronização, renomeie a camada no Figma para `#caminho.no.json` e adicione a chave em `content.json`.

## Conflitos

O plugin sempre lê a versão atual do GitHub antes de enviar e usa o `sha` do arquivo, então o GitHub recusa o envio se alguém mudou o arquivo no meio do caminho. Nesse caso, **puxe primeiro** e envie de novo.
