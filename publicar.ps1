# Cria o repositório no SEU GitHub, publica o código e liga o site do protótipo.
# Uso (PowerShell):  .\publicar.ps1                    -> repositório público "nexo-fluxo-main"
#                    .\publicar.ps1 meu-nome -Private   -> nome e visibilidade personalizados
param([string]$Repo = "nexo-fluxo-main", [switch]$Private)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
function Say($t) { Write-Host "`n> $t" -ForegroundColor Magenta }
foreach ($c in @("git","gh")) { if (-not (Get-Command $c -ErrorAction SilentlyContinue)) { Write-Host "Precisa do '$c' instalado (git-scm.com / cli.github.com)."; exit 1 } }

Say "Conferindo login no GitHub"
gh auth status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { gh auth login --web --git-protocol https }
$Owner = gh api user --jq .login
Write-Host "  Conta: $Owner"

Say "Preenchendo seu usuario nos links da documentacao"
Get-ChildItem -Recurse -File -Exclude "publicar.*" | Where-Object { $_.FullName -notmatch '\\.git\\' -and $_.Extension -in ".md",".json",".html",".yml",".js",".mjs" } | ForEach-Object {
  $txt = [IO.File]::ReadAllText($_.FullName)
  $new = $txt.Replace("SEU-USUARIO", $Owner).Replace("nexo-fluxo-main", $Repo)
  if ($new -ne $txt) { [IO.File]::WriteAllText($_.FullName, $new, (New-Object Text.UTF8Encoding $false)) }
}

Say "Criando o commit inicial"
if (-not (Test-Path .git)) { git init -q -b main }
git add -A
git -c user.name="$Owner" -c user.email="$Owner@users.noreply.github.com" commit -qm "feat: prototipo Nexo navegavel + sincronizacao com o Figma"

Say "Criando github.com/$Owner/$Repo e enviando os arquivos"
$vis = if ($Private) { "--private" } else { "--public" }
gh repo create "$Owner/$Repo" $vis --source=. --remote=origin --push --description "Prototipo navegavel do Nexo, sincronizado com o Figma" --homepage "https://$Owner.github.io/$Repo/web/"

Say "Ligando o GitHub Pages"
gh api -X POST "repos/$Owner/$Repo/pages" -f build_type=workflow 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { gh api -X PUT "repos/$Owner/$Repo/pages" -f build_type=workflow 2>$null | Out-Null }
Start-Sleep 2
gh workflow run pages.yml -R "$Owner/$Repo" 2>$null | Out-Null

$ans = Read-Host "`nConfigurar o token do Figma agora (atualiza as imagens das telas)? [s/N]"
if ($ans -match '^[sS]') { gh secret set FIGMA_TOKEN -R "$Owner/$Repo"; gh workflow run figma-snapshot.yml -R "$Owner/$Repo" 2>$null | Out-Null }

Write-Host "`nPronto!" -ForegroundColor Green
Write-Host "  Repositorio: https://github.com/$Owner/$Repo"
Write-Host "  Prototipo:   https://$Owner.github.io/$Repo/web/  (no ar em ~1 minuto)"
Write-Host "  Na sua maquina: git clone https://github.com/$Owner/$Repo.git; cd $Repo; npm start"
