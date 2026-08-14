#!/usr/bin/env bash
# Migra as imagens do Imgur para o repositório e atualiza as referências.
#
# Por que: o Imgur proíbe hotlink como CDN e pode bloquear/apagar as imagens
# a qualquer momento — favicon, hero, galeria e preview do WhatsApp quebrariam.
#
# Como usar (na raiz do repositório, em uma máquina com internet livre):
#   bash scripts/migrar-imagens.sh
#   git add -A && git commit -m "Migrar imagens do Imgur para o repositório" && git push
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p assets/img

declare -A IMAGENS=(
  [speedboy-logo.png]="https://i.imgur.com/R6T1goC.png"
  [motoboy-vila-velha-es.jpg]="https://i.imgur.com/mUsPz90.jpeg"
  [entrega-documentos-vila-velha.jpg]="https://i.imgur.com/uobtZ3a.jpeg"
  [motoboy-entrega-grande-vitoria.jpg]="https://i.imgur.com/ILupMOh.jpeg"
  [motoboy-atendimento-vila-velha.jpg]="https://i.imgur.com/eVGM97i.jpeg"
  [cliente-entrega-speedboy.jpg]="https://i.imgur.com/mJqAraw.jpeg"
)

echo "Baixando imagens do Imgur..."
for nome in "${!IMAGENS[@]}"; do
  curl -fsSL --retry 3 -o "assets/img/$nome" "${IMAGENS[$nome]}"
  echo "  ok assets/img/$nome"
done

echo "Atualizando referências nos arquivos HTML/CSS..."
# URL absoluta em tudo: og:image e JSON-LD exigem URL completa,
# e para CSS/<img> a URL absoluta também funciona.
ARQUIVOS=$(git ls-files '*.html' '*.css')
for nome in "${!IMAGENS[@]}"; do
  url="${IMAGENS[$nome]}"
  for f in $ARQUIVOS; do
    sed -i.bak "s|$url|https://www.speedboy.com.br/assets/img/$nome|g" "$f" && rm -f "$f.bak"
  done
done

echo
echo "Pronto! Confira com 'git diff' e faça o commit."
echo "Opcional (recomendado): converta para WebP e otimize com:"
echo "  npx @squoosh/cli --webp auto assets/img/*.jpg"
