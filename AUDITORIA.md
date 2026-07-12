# Auditoria Técnica Completa — speedboy.com.br

Data: 12/07/2026 · Escopo: SEO, infraestrutura, front-end, analytics, segurança, acessibilidade e engenharia.

---

## ✅ Status pós-correções (12/07/2026)

Correções já aplicadas neste branch:

| Item | Status |
|------|--------|
| 4. sitemap.xml + robots.txt + canonical em todas as páginas | ✅ Feito |
| 5. Artigo Shopee no índice do blog | ✅ Feito |
| 6. `aggregateRating` removido; schema enriquecido (`sameAs`, `areaServed`, horários, e-mail) + `FAQPage` na home + `BlogPosting` nos 4 artigos | ✅ Feito |
| 7. Fontes via `<link>` + preconnect (fim do `@import`); `charset` no topo do `<head>`; preload do hero; Font Awesome self-hosted (fim do cdnjs) | ✅ Feito |
| 10. `</div>` extra na home | ✅ Feito |
| 11. Acentuação do card Shopee | ✅ Feito |
| 12. Acessibilidade: hamburger e FAQ viram `<button>` com `aria-expanded`/`aria-label`, teclado funciona; estrelas com `aria-label` | ✅ Feito |
| 13. `rel="noopener noreferrer"` em todos os links externos; FA self-hosted elimina risco do CDN | ✅ Feito |
| 14. `404.html` personalizado | ✅ Feito |
| — | Extras: `og:url`/`og:type`/`og:locale`/twitter card em todas as páginas; links internos absolutos (fim do duplicado `/index.html`); ano do rodapé unificado | ✅ Feito |

Pendências que exigem ação do dono (não dá para fazer daqui):

1. **Google Ads (item 2 do P0):** conferir no painel do Ads se o rótulo de conversão é mesmo `whatsapp_click` — se não for, trocar em `assets/main.js` pelo snippet real. **Sem isso a campanha não registra conversões.**
2. **Imagens do Imgur (item 1):** rodar `bash scripts/migrar-imagens.sh` em uma máquina local (o ambiente desta sessão não tem acesso ao Imgur) e commitar o resultado.
3. **GA4 (item 3):** criar propriedade no Google Analytics e adicionar `gtag('config','G-XXXXXXX');` ao snippet no `<head>` das páginas.
4. **Search Console:** enviar `https://www.speedboy.com.br/sitemap.xml`.
5. **DNS:** confirmar que `speedboy.com.br` (sem www) redireciona para `www.speedboy.com.br` e que "Enforce HTTPS" está ativo nas configurações do GitHub Pages.
6. Futuro: migração para gerador estático (item 9), conteúdo único por cidade (item 16), banner LGPD (item 15).

O site é estático (HTML/CSS/JS puro) hospedado no GitHub Pages com domínio `www.speedboy.com.br`. A base é pequena (11 páginas) e bem construída visualmente, mas há riscos estruturais que podem derrubar tráfego, conversão e a própria aparência do site sem aviso. Abaixo, em ordem de prioridade.

---

## 🔴 P0 — Crítico (pode estar custando dinheiro/tráfego HOJE)

### 1. Todas as imagens dependem do Imgur (risco de o site "quebrar sozinho")
Favicon, logo, imagem do hero, galeria e `og:image` (preview no WhatsApp) apontam para `i.imgur.com`. O Imgur **proíbe uso como CDN** nos termos de serviço e costuma bloquear hotlink (erro 429) ou apagar imagens sem aviso. Se isso acontecer:
- O hero da home fica em branco;
- O preview do link no WhatsApp (canal nº 1 de vendas do negócio) some;
- O favicon desaparece do Google.

**Correção:** mover todas as imagens para `/assets/img/` no próprio repositório (GitHub Pages serve de graça), em formato WebP com dimensões otimizadas.

Arquivos afetados: todas as 11 páginas (`og:image`, `favicon`), `index.html:31` (hero), `index.html:415-417` (galeria), `assets/style.css:75` (page-hero).

### 2. Conversão do Google Ads provavelmente NÃO está sendo registrada
Em `assets/main.js:53`, a conversão é enviada para `AW-16976838076/whatsapp_click`. O rótulo de conversão do Google Ads é um **código gerado automaticamente** (algo como `AbC1dEfGhIjKlM2n`), não um nome escolhido. Se `whatsapp_click` não for o rótulo real copiado do painel do Ads, **nenhuma conversão está sendo contabilizada** — e a campanha está otimizando às cegas (pagando por cliques sem sinal de conversão).

**Correção:** no Google Ads → Metas → Conversões → abrir a conversão de clique no WhatsApp → copiar o snippet real do `send_to` e substituir no `main.js`. Verificar no painel se há conversões registradas nos últimos 30 dias.

### 3. Não existe Google Analytics (GA4) — zero visibilidade de tráfego
Só existe a tag do Google Ads (`AW-`). O evento GA4 `whatsapp_click` disparado em `main.js:59` **não vai para lugar nenhum**, porque não há propriedade `G-XXXXXXX` configurada. Hoje é impossível saber: quantas visitas o site recebe, de onde vêm, quais páginas convertem.

**Correção:** criar propriedade GA4 (gratuito), adicionar `gtag('config','G-XXXXXXX')` ao snippet existente. Vincular GA4 ↔ Google Ads.

### 4. SEO técnico básico ausente: sem sitemap.xml, sem robots.txt, sem canonical
- **Nenhuma página tem `<link rel="canonical">`**. Os links internos apontam para `index.html` explicitamente, então o Google enxerga `/` e `/index.html` como duas URLs (conteúdo duplicado). O mesmo vale para todas as páginas.
- **Sem `sitemap.xml`**: as páginas de cidade e do blog (justamente as feitas para SEO local) dependem só de descoberta por link. Sem sitemap no Search Console, indexação fica mais lenta e sem diagnóstico.
- **Sem `robots.txt`**: inofensivo hoje, mas é onde se declara o sitemap.

**Correção:** criar `sitemap.xml` com as 10 páginas + `robots.txt` apontando para ele + canonical em cada página. Enviar o sitemap no Search Console (a verificação já está feita).

### 5. Artigo do blog órfão: página da Shopee não aparece no índice do blog
`blog/coleta-shopee-mercado-livre-serra-es.html` aparece na home, mas **não está listado em `blog/index.html`** (que mostra só 3 dos 4 artigos). Sintoma do problema estrutural do item 9 (tudo é copiado e colado à mão, e as páginas já divergiram).

---

## 🟠 P1 — Importante (risco de penalização e perda de performance)

### 6. Schema `aggregateRating` auto-declarado viola as diretrizes do Google
`index.html:23` e as 4 páginas de cidade declaram `LocalBusiness` com `aggregateRating` de 5 estrelas/50 avaliações. O Google **proíbe explicitamente** review markup "self-serving" (a empresa avaliando a si mesma na própria página) para `LocalBusiness`. O risco é uma **ação manual de dados estruturados** no Search Console, que derruba rich results do site inteiro.
As notas devem vir do perfil do Google Business (que já existe e já exibe as estrelas no Maps).

**Correção:** remover `aggregateRating` do JSON-LD; manter `LocalBusiness` e enriquecer com `sameAs` (Instagram + link do perfil no Google Maps), `priceRange`, `areaServed` e `openingHoursSpecification`. Adicionar `FAQPage` schema na seção de FAQ e `BlogPosting` nos artigos.

### 7. Performance de carregamento (LCP) comprometida — pesa no ranking mobile
- **Google Fonts via `@import` dentro do CSS** (`assets/style.css:2`): é a pior forma de carregar fonte — cria cadeia bloqueante (HTML → CSS → fonte). Trocar por `<link rel="preconnect">` + `<link rel="stylesheet">` no `<head>`.
- **Font Awesome completo (~100 KB de CSS + webfonts)** para ~30 ícones. Trocar por SVGs inline ou subset.
- **Imagem do hero sem `preload`** e vinda do Imgur: o LCP (elemento principal) chega tarde. Com a imagem local + `<link rel="preload">` + WebP, o LCP melhora drasticamente.
- **iframe do Google Maps** (`index.html:440`) carrega ~1 MB de JS de terceiros; usar fachada (imagem estática clicável que só carrega o mapa ao interagir).

### 8. Scripts do gtag antes do `<meta charset>`
Em todas as páginas, os `<script>` do Google vêm **antes** do `<meta charset="UTF-8">`. O charset precisa estar nos primeiros 1024 bytes e idealmente ser a primeira coisa do `<head>`; com acentuação em pt-BR isso é pedir problema de encoding. Mover charset/viewport para o topo do `<head>`.

### 9. Engenharia: duplicação total de código — o site já está divergindo
Nav, menu mobile, footer, botão flutuante do WhatsApp, snippet do gtag e boa parte do CSS estão **copiados e colados em 11 arquivos**. Consequências já visíveis:
- Footer diz `© 2026` na home e `© 2025` em empresas/blog;
- Blog index esqueceu o 4º artigo;
- A meta de verificação do Google está só em `blog/index.html` (deveria estar na home ou em todas — hoje só funciona porque existe o arquivo de verificação na raiz).

**Correção recomendada:** migrar para um gerador estático (Eleventy ou Astro — deploy continua no GitHub Pages via Action) com layouts/partials. Custo: algumas horas. Benefício: alterar o telefone/menu/footer em 1 lugar só.

### 10. HTML inválido na home
`index.html:285-288`: há um `</div>` extra na seção de serviços (o botão de orçamento ficou fora da grid mas sobrou um fechamento). Browsers toleram, mas é bug latente de layout.

### 11. Erros de acentuação no conteúdo
`index.html:397-398`: "Coleto seus pacotes", "galpoes", "pra voce" — sem acentos e com concordância estranha ("Coleto" → "Coletamos"). Afeta profissionalismo e SEO on-page.

---

## 🟡 P2 — Melhorias (fazer quando possível)

### 12. Acessibilidade (também é fator de qualidade para o Google)
- Hamburger do menu é `<div>` sem `role="button"`, sem `aria-label`, sem suporte a teclado — inacessível via Tab;
- FAQ usa `<div onclick>` — mesmo problema; usar `<button>` + `aria-expanded`;
- Estrelas dos reviews (`★★★★★`) são texto puro sem `aria-label` ("Avaliação 5 de 5 estrelas");
- Elementos `.reveal` ficam com `opacity:0` se o JavaScript falhar — conteúdo invisível sem JS.

### 13. Segurança (superfície pequena, mas há ajustes baratos)
- `target="_blank"` sem `rel="noopener noreferrer"` em todos os links externos (browsers modernos mitigam, mas a correção é trivial);
- Font Awesome via cdnjs **sem SRI** (`integrity=`): se o CDN for comprometido, injeta CSS/JS no site. Melhor: self-host;
- GitHub Pages não permite headers de segurança (CSP, HSTS custom) — conferir se **"Enforce HTTPS" está ativado** nas configurações do repositório. Se um dia quiser headers/redirects de verdade, Cloudflare (grátis) na frente resolve;
- Nenhum segredo exposto no repositório (telefone, CNPJ e ID do gtag são públicos por natureza — ok).

### 14. Infra/DNS
- Conferir se o domínio raiz `speedboy.com.br` (sem www) resolve e redireciona para `www.speedboy.com.br` (registros A `185.199.108.153`…`111.153` no apex + CNAME no www). Se o apex estiver morto, quem digitar sem www não chega ao site;
- Criar `404.html` personalizado (hoje aparece a página 404 genérica do GitHub);
- Adicionar um GitHub Action simples de CI: validação de HTML + checagem de links quebrados a cada push.

### 15. LGPD
O gtag cria cookies de publicidade sem consentimento. Para um site desse porte o risco prático é baixo, mas o correto é um banner de consentimento simples com Google Consent Mode v2 (que o Ads inclusive já exige na Europa e tende a exigir no Brasil).

### 16. Conteúdo/SEO local (oportunidade, não defeito)
- As 4 páginas de cidade têm estrutura idêntica — para não parecerem "doorway pages", diferenciar o texto de cada uma (bairros atendidos, cartórios da cidade, tempo médio de entrega, casos reais);
- Cadastrar/otimizar o perfil no **Google Business Profile** com link para o site e posts semanais — para "motoboy serra es", o pacote local do Maps vale mais que qualquer outra otimização;
- Faltam `og:url` e `og:image` dimensionada (1200×630) nas páginas internas; adicionar também Twitter Cards.

---

## Resumo executivo — o que fazer primeiro

| # | Ação | Esforço | Impacto |
|---|------|---------|---------|
| 1 | Verificar rótulo de conversão do Google Ads no `main.js` | 15 min | 💰 Campanha paga otimizando às cegas |
| 2 | Migrar imagens do Imgur para o repositório | 1 h | Site pode quebrar a qualquer momento |
| 3 | Criar GA4 e adicionar ao snippet | 30 min | Zero visibilidade hoje |
| 4 | sitemap.xml + robots.txt + canonical em todas as páginas | 1 h | Indexação das páginas de SEO local |
| 5 | Remover `aggregateRating` self-serving do schema | 15 min | Risco de penalização |
| 6 | Adicionar artigo Shopee ao índice do blog | 5 min | Página órfã |
| 7 | Corrigir fontes (`@import` → link), preload do hero, charset no topo | 1 h | Core Web Vitals / ranking mobile |
| 8 | Migrar para Eleventy/Astro (elimina duplicação) | 3–5 h | Estanca a divergência entre páginas |

Itens 1–6 são o "estanca-sangramento". Item 8 é o investimento que evita que tudo volte a divergir.
