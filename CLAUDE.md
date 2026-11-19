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
- **Imagem de IA liberada pelo dono (17/11/2026)** para capas, fundos e blog. A **galeria de fotos**
  continua só com fotos reais de serviço feito. Prompts em `Imagens do site — prompts Nano Banana` (doc).
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
- `assets/` — style.css, b2b.css, main.js, vendor/fontawesome (self-hosted)
- `scripts/migrar-imagens.sh` — tira as imagens do Imgur (rodar em máquina com internet livre)

## Sistema de pedidos (Speed Despacho)

Sistema separado, no repositório `SpeedBoyMotoboy/Speed`. Páginas públicas dele: `/pedir/`
(pedido urgente) e `/acompanhar/?c=código`. O site só aponta para lá.

- Endereço do sistema fica em **um lugar só**: `SISTEMA_URL`, no topo de `assets/main.js`.
  Vazio = desligado, e os botões abrem o WhatsApp.
- Botão que chama o sistema: `<a data-sistema="pedir" href="(link do WhatsApp)">`. O `href`
  do WhatsApp é o reserva; o JS troca pelo sistema quando `SISTEMA_URL` está preenchido.
- Página nova do sistema: incluir em `SISTEMA_ROTAS` e usar `data-sistema="nome"`.
- **Pedido mora no site:** `/pedir/` (`pedir/index.html` + `assets/pedir.js`) é formulário próprio que
  chama a API pública do sistema (`/api/publico/info` e `/api/publico/pedidos`; o sistema libera CORS para
  speedboy.com.br). `PAGINAS_SITE` em `main.js` faz os botões `data-sistema="pedir"` abrirem essa página.
  Pedido entra retido e o cliente é levado ao WhatsApp da empresa (`WHATS_PEDIDOS`) com o pedido escrito
  ("Fiz o pedido #N pelo site"); o valor é passado ali. Cliente aceitou → n8n fecha o pedido no sistema
  (`/api/entrada/demandas/:id/fechar`) e ele vai para o motoboy. Tipo "Outros" exige descrição maior.
  Opções: "só um endereço" (coleta = entrega), complemento, CNPJ para NF (validado).
- `GOOGLE_MAPS_CHAVE` em `main.js`: chave de navegador (Maps JavaScript API + Places API New), restrita a
  speedboy.com.br. Preenchida, o endereço só vale se escolhido da lista do Google e com número.
- Texto perto do botão tem que ser verdade nos dois modos. Não prometer Pix antes de estar funcionando no sistema.
- **Prazo liberado pelo dono (18/11/2026):** no `/pedir/` a chave "Entrega urgente" (desligada = entrega normal,
  na rota, mais barata; ligada = motoboy em até 30 minutos, valor maior). `?urgente=1` abre com a chave ligada
  (página de destino do Google Ads). O pedido vai com `urgente` e a modalidade na descrição e na mensagem.
  Outras páginas: não prometer prazo sem o dono pedir.
- **Lojistas — NÃO mostrar no site.** `/lojista/` existe (noindex, sem link no site) e leva ao pedido de lojas do
  sistema (`SISTEMA_ROTAS.lojista` = `/loja/`). O dono manda o link direto para cada loja. Não criar botão/menu para ela.
- O menu passa a hambúrguer até 1024px (9 itens não cabem abaixo disso).

## Pendências conhecidas

Ver `AUDITORIA.md`. Resumo: Google Ads com saldo esgotado, imagens ainda no Imgur,
sem GA4, sitemap a reenviar no Search Console.
