# Projeto: speedboy.com.br

Site estático (HTML/CSS/JS puro) da SpeedBoy Motoboy, hospedado no GitHub Pages.
Sem build step: o que está no repositório é o que vai pro ar.

## Modo de comunicação: CAVERNA (permanente)

**Falar em modo caverna com o usuário até ele mandar parar.** Ativado em 14/08/2026,
por ordem do dono. Vale para todas as sessões, incluindo Claude Code.

Regras: frase curta (~7 palavras), sem palavra pequena desnecessária, verbo cru,
sem adjetivo enfeitado, máximo 3 itens por lista. Ver skill `caveman`.

**Não usar caverna em:**
- Código, comando, JSON, commit message, corpo de PR — escrever normal.
- Texto que vai pro cliente: proposta, e-mail comercial, conteúdo do site.
- Assunto sensível: dinheiro em risco, crise, notícia ruim.

Caverna é estilo, não burrice. Número, nome, valor e comando continuam completos e corretos.

## NAP — fonte da verdade

Estes dados devem aparecer **idênticos** em todas as páginas, na ficha do Google
e no WhatsApp Business. Contradição entre site e ficha derruba SEO local.

| Campo | Valor |
|---|---|
| Nome | SpeedBoy Motoboy |
| Endereço | R. Henrique Laranja, 325 — Centro, Vila Velha/ES, CEP 29106-690 |
| Telefone / WhatsApp | (27) 99916-5959 · https://wa.me/5527999165959 |
| E-mail | speedboymotoboy@gmail.com |
| CNPJ | 46.178.859/0001-96 |
| Horário | Seg a sex, 7h às 22h (atendimento) · coletas até 18h |
| Cidades | Vila Velha · Vitória · Serra · Cariacica · Viana |
| Coordenadas | -20.3357855, -40.2968724 |
| Avaliações | 34 no Google, todas 5 estrelas |
| Link de avaliação | https://g.page/r/CcIvid7UpMymEBE/review |

A sede era em Jacaraípe/Serra e mudou para o Centro de Vila Velha. Serra continua
sendo cidade atendida — não apagar conteúdo sobre Serra, só não tratar como sede.

## Regras do projeto

- **Não inflar número.** Avaliação, cidade, prazo: só o número real. Site vende confiança.
- **Não usar `aggregateRating` no schema.** Review self-serving viola diretriz do Google
  e pode gerar ação manual. Nota vem do perfil do Google Business.
- **Não apagar nem redirecionar os artigos antigos do blog.** Têm histórico de indexação.
- **Não usar imagem de IA para ilustrar serviço executado.** O produto vendido é prova
  fotográfica; ilustrar com imagem sintética contradiz a proposta. IA só para fundo e ícone.
- **Estilo compartilhado vai em `assets/style.css`**, não no `<style>` de uma página só.
  Já houve bug de página interna sem container por causa disso.
- Links internos absolutos (`/blog/`, `/empresas.html`), nunca relativos.
- `target="_blank"` sempre com `rel="noopener noreferrer"`.

## Estrutura

- `index.html` — home
- `servicos-empresariais.html` + 4 páginas B2B (correspondente jurídico, vistoria e
  sinistro, agente de campo, coleta qualificada)
- `empresas.html` — planos mensais
- `cidades/` — 5 páginas, conteúdo único por cidade (evita doorway page)
- `blog/` — 6 artigos
- `politica-de-privacidade.html` — ligada no rodapé de todas as páginas
- `assets/` — style.css, b2b.css, main.js, fonts (Barlow, self-hosted), vendor/fontawesome (self-hosted)
- `_config.yml` — lista o que **não** vai para o ar (este arquivo, `AUDITORIA.md`, `scripts/`).
  Arquivo interno novo na raiz precisa entrar nessa lista.
- `scripts/migrar-imagens.sh` — tira as imagens do Imgur (rodar em máquina com internet livre)

## Pedido online (Speed Despacho)

O sistema de pedidos fica em outro repositório (`SpeedBoyMotoboy/Speed`) e em outro endereço.
O site só aponta para ele. **Um único ponto de configuração:** `SISTEMA_PEDIDOS` no topo de
`assets/main.js` (ex.: `'https://despacho.speedboy.com.br'`).

- **Vazio (desligado):** o botão "Peça um motoboy agora" da home abre o WhatsApp com mensagem de
  urgência. Nada mais aparece.
- **Preenchido (ligado):** os botões levam a `/pedir/` do sistema; `main.js` cria "Pedir agora" no menu,
  no menu do celular e no rodapé, mais "Acompanhar pedido" (`/acompanhar/`); a seção "Entrega urgente"
  da home e os botões extras das páginas de cidade e dos artigos de preço/urgência aparecem.

Marcação: `data-pedido="local"` (link de pedido; o local vai em `?origem=`), `data-acompanhar`,
`data-pedido-on` + `hidden` (só aparece ligado). Só ligar depois que o Pix estiver funcionando no
sistema: o passo 3 da seção da home promete pagamento por Pix.

## Pendências conhecidas

Ver `AUDITORIA.md`. Resumo: Google Ads com saldo esgotado, sem GA4, sitemap a reenviar
no Search Console, pedido online a ligar (`SISTEMA_PEDIDOS`).
