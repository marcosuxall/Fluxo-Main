#!/usr/bin/env bash
# Cria o repositório no SEU GitHub, publica o código e liga o site do protótipo.
# Uso:  ./publicar.sh                      (repositório público "nexo-fluxo-main")
#       ./publicar.sh meu-nome --private   (nome e visibilidade personalizados)
set -euo pipefail
cd "$(dirname "$0")"

REPO="${1:-nexo-fluxo-main}"
VIS="${2:---public}"

say() { printf "\n\033[1;35m▸ %s\033[0m\n" "$1"; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "✖ Precisa do '$1' instalado. $2"; exit 1; }; }

need git "Baixe em https://git-scm.com"
need gh  "Baixe em https://cli.github.com (é o GitHub oficial no terminal)"

say "Conferindo login no GitHub"
gh auth status >/dev/null 2>&1 || gh auth login --web --git-protocol https
OWNER="$(gh api user --jq .login)"
echo "  Conta: $OWNER"

say "Preenchendo seu usuário nos links da documentação"
grep -rlI --exclude-dir=.git --exclude='publicar.*' -e 'SEU-USUARIO' -e 'nexo-fluxo-main' . | while read -r f; do
  perl -pi -e "s/SEU-USUARIO/$OWNER/g; s/nexo-fluxo-main/$REPO/g" "$f"
done

say "Criando o commit inicial"
[ -d .git ] || git init -q -b main
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-$OWNER}" -c user.email="${GIT_AUTHOR_EMAIL:-$OWNER@users.noreply.github.com}" \
  commit -qm "feat: protótipo Nexo navegável + sincronização com o Figma" || true

say "Criando github.com/$OWNER/$REPO e enviando os arquivos"
gh repo create "$OWNER/$REPO" "$VIS" --source=. --remote=origin --push \
  --description "Protótipo navegável do Nexo (login + painel), sincronizado com o Figma" \
  --homepage "https://$OWNER.github.io/$REPO/web/"

say "Ligando o GitHub Pages (site do protótipo)"
gh api -X POST "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
  || gh api -X PUT "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
  || echo "  ! Não deu para ligar automaticamente. Ative em Settings → Pages → Source: GitHub Actions."
sleep 2
gh workflow run pages.yml -R "$OWNER/$REPO" >/dev/null 2>&1 || true

say "Token do Figma (opcional: atualiza as imagens das telas sozinho)"
read -r -p "  Configurar agora? [s/N] " ans
case "$ans" in [sS]*)
  echo "  Gere em Figma → Settings → Security → Personal access tokens (escopo: File content, leitura)."
  gh secret set FIGMA_TOKEN -R "$OWNER/$REPO"
  gh workflow run figma-snapshot.yml -R "$OWNER/$REPO" >/dev/null 2>&1 || true ;;
esac

cat <<MSG

✔ Pronto!
  Repositório:  https://github.com/$OWNER/$REPO
  Protótipo:    https://$OWNER.github.io/$REPO/web/   (fica no ar em ~1 minuto)
  Na sua máquina:
      git clone https://github.com/$OWNER/$REPO.git && cd $REPO && npm start
MSG
