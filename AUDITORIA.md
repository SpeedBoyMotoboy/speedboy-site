# Auditoria Técnica — speedboy.com.br

Data: 12/07/2026 · Atualizado em 14/08/2026 (mudança de sede) e em 02/09/2026 (expansão do blog).

---

## ✅ Status (14/08/2026)

### Mudança de sede — Jacaraípe/Serra → Centro de Vila Velha

Todo o site comunicava o endereço antigo, contradizendo a ficha do Google Business (que já estava atualizada). Corrigido:

| Item | Status |
|------|--------|
| NAP idêntico em todas as páginas (nome, endereço, telefone, horário) | ✅ |
| Endereço físico publicado no rodapé de todas as páginas e no bloco de contato | ✅ (antes não aparecia em lugar nenhum) |
| Horário: seg a sex, 7h–22h · coletas até 18h | ✅ |
| Cidades: Vila Velha, Vitória, Serra, Cariacica, Viana (removidas Aracruz, Colatina, Linhares) | ✅ |
| Mapa da home no endereço exato, zoom de rua | ✅ |
| Title, H1, meta description e Open Graph reposicionados | ✅ |
| Contadores honestos: 34 avaliações, 5 cidades; removido "100% pontualidade" | ✅ |
| Schema LocalBusiness com endereço postal, coordenadas (-20.3357855, -40.2968724) e horários | ✅ |
| Página de cidade para Viana | ✅ |
| Serra reposicionada como cidade atendida, sem menção a sede | ✅ |
| Vila Velha reforçada como território principal, com 15 bairros citados | ✅ |
| Conteúdo único por cidade (bairros, referências locais, distância da sede) | ✅ evita padrão de doorway page |
| CTA de avaliação no Google (link g.page) na seção de depoimentos | ✅ mais avaliações = fator nº 1 de ranqueamento local |

### Linha B2B (arquivos citados no checklist não existiam no repositório — foram criados)

`servicos-empresariais.html` (hub) · `correspondente-juridico.html` · `vistoria-e-sinistro.html` · `agente-de-campo.html` · `coleta-qualificada.html` · `assets/b2b.css`

Integradas ao menu principal, ao rodapé e à página de planos. Cada uma com `Service` + `BreadcrumbList` schema, escopo de atuação declarado (o que fazemos e o que é atividade privativa de outra profissão) e CTA próprio.

### Blog

Os 4 artigos antigos foram mantidos (têm histórico de indexação — apagar destruiria ranqueamento). Dois artigos novos, focados em Vila Velha e B2B:

- `correspondente-juridico-espirito-santo-como-funciona.html`
- `relatorio-fotografico-georreferenciado-o-que-e.html`

**02/09/2026 — seis artigos novos**, para cobrir as buscas de motoboy da região que o site
ainda não respondia (o blog saiu de 6 para 12 artigos, ~5.300 palavras novas):

| Artigo | Busca que ataca |
|---|---|
| `quanto-custa-motoboy-vila-velha-es.html` | "quanto custa motoboy vila velha", "preço motoboy ES" |
| `motoboy-urgente-mesmo-dia-grande-vitoria.html` | "motoboy urgente", "motoboy agora", "motoboy hoje" |
| `entrega-vila-velha-vitoria-terceira-ponte.html` | "entrega vila velha vitória", corredor da Terceira Ponte |
| `motoboy-proprio-ou-terceirizado-custo.html` | "vale a pena contratar motoboy CLT", decisão B2B |
| `cartorio-grande-vitoria-qual-serve-para-cada-documento.html` | "qual cartório", "cartório vila velha/vitória" |
| `motoboy-clinicas-laboratorios-exames.html` | "motoboy para clínica", "entrega de exames" |

Cada um com `BlogPosting` + `BreadcrumbList` + `FAQPage` e escopo declarado onde cabe
(o de clínicas diz explicitamente que **não** transportamos material biológico).
Ligação interna nos dois sentidos: as 5 páginas de cidade ganharam bloco "Leia antes de
pedir", `empresas.html` aponta para o artigo de custo, e o índice do blog ganhou schema `Blog`.
Nenhum artigo antigo foi apagado, movido ou redirecionado.

### Bugs encontrados e corrigidos no caminho

- `.sw` / `.sw-inner` (containers que centralizam o conteúdo) existiam **apenas** no `<style>` da home — todas as páginas internas renderizavam com o texto colado nas bordas da tela. Movidos para `assets/style.css`.
- Links para `motoboy-aracruz-es.html`, `motoboy-colatina-es.html` e `motoboy-linhares-es.html` apontavam para páginas que nunca existiram: 404 em todas as páginas de cidade.
- `empresas.html` e `blog/index.html` não tinham nenhum JSON-LD.
- **(02/09)** O botão de WhatsApp dentro do `.cta-inline` de **todos** os artigos era laranja
  com texto laranja — ilegível, e é o CTA principal de conversão do blog. Causa: `.article-body a`
  (especificidade 0,1,1) vencia `.btn-primary` (0,1,0). Corrigido em `assets/style.css`.
- **(02/09)** O CSS de artigo (`.article-body`, `.highlight-box`, `.related-card`…) vivia duplicado
  no `<style>` de cada artigo. Movido para `assets/style.css`, como manda a regra do projeto.

### Correções da auditoria original (12/07)

Canonical, sitemap, robots.txt, Open Graph completo, remoção do `aggregateRating` self-serving, FAQPage, BlogPosting, fontes via `<link>`, Font Awesome self-hosted, charset no topo, preload do hero, acessibilidade (hamburger e FAQ como `<button>`, navegáveis por teclado), `rel="noopener"`, 404 personalizado, carrossel de avaliações.

---

## ⏳ Pendências que exigem ação sua

**Fora do site (mais urgente que qualquer código):**

1. **Google Ads — saldo esgotado.** O anúncio não está rodando. Além disso, confira se o rótulo de conversão em `assets/main.js` (`AW-16976838076/whatsapp_click`) é o real do painel — rótulos são códigos gerados, tipo `AbC1dEfG...`. Se estiver errado, a campanha nunca registrou conversão.
2. **Ficha do Google:** confirmar aprovação das edições de horário, área de cobertura e chat.
3. **Instagram:** bio ainda diz "na Serra" — atualizar nome e bio para Vila Velha.
4. **Responder a avaliação da Cynthia Lyrio** (única pendente).
5. **Search Console:** reenviar `https://www.speedboy.com.br/sitemap.xml` e pedir indexação
   das 8 páginas da mudança de sede **e dos 6 artigos novos de 02/09** (o sitemap já está atualizado).

**No site:**

6. **Imagens do Imgur:** rodar `bash scripts/migrar-imagens.sh` numa máquina com internet livre (este ambiente não alcança o Imgur) e commitar. Os nomes de arquivo já saem descritivos (`motoboy-vila-velha-es.jpg` etc.).
7. **GA4:** criar propriedade e adicionar `gtag('config','G-XXXXXXX');` — hoje não existe analytics nenhum.
8. **Fotos reais da galeria:** substituir pelas novas conforme a pauta fotográfica. Não usar imagem de IA para ilustrar serviço executado — o produto vendido é prova fotográfica.
9. **DNS:** confirmar que `speedboy.com.br` sem `www` redireciona e que "Enforce HTTPS" está ativo.

**Futuro:**

10. Migrar para gerador estático (Eleventy/Astro) — o site tem 18 páginas HTML com nav, rodapé e schema duplicados em cada uma. Já corrigi as divergências duas vezes; a terceira é questão de tempo.
11. Banner de consentimento LGPD (Consent Mode v2).
12. Próximas pautas do blog (as três primeiras já eram da lista antiga e continuam de pé):
    diligência de protocolo em Vila Velha; quanto custa um correspondente no ES; coleta em
    galpão e entrega em agência; motoboy para imobiliária (chaves, contratos, vistoria de
    locação); motoboy para restaurante e delivery próprio; guia de bairros de Vila Velha.
