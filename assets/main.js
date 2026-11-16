// ── SPEEDBOY MOTOBOY — SHARED JS ──

// ── SISTEMA DE PEDIDOS (Speed Despacho) ──
// Endereço do sistema, com https:// e sem barra no fim. Ex.: 'https://despacho.speedboy.com.br'
// Vazio = desligado: os botões "Peça um motoboy agora" abrem o WhatsApp e nada mais aparece.
// Preenchido = os botões levam à página de pedido (/pedir/), o menu e o rodapé ganham
// "Pedir agora" e "Acompanhar pedido", e a seção "Entrega urgente" da home aparece.
const SISTEMA_PEDIDOS = '';

// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
    closeMobile();
    if (hamburger) hamburger.focus();
  }
});
function closeMobile() {
  if (hamburger) {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menu');
  }
  if (mobileMenu) mobileMenu.classList.remove('open');
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
}

// FAQ accordion
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    const q = i.querySelector('.faq-question');
    if (q) q.setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

// ── CARROSSEL DE AVALIAÇÕES ──
const revTrack = document.getElementById('revTrack');
if (revTrack) {
  const gap = () => parseFloat(getComputedStyle(revTrack).columnGap) || 19;
  const step = () => {
    const card = revTrack.querySelector('.rev-card');
    return card ? card.offsetWidth + gap() : 340;
  };
  const atEnd = () => revTrack.scrollLeft + revTrack.clientWidth >= revTrack.scrollWidth - 8;
  const next = () => {
    if (atEnd()) revTrack.scrollTo({ left: 0, behavior: 'smooth' });
    else revTrack.scrollBy({ left: step(), behavior: 'smooth' });
  };
  const prev = () => {
    if (revTrack.scrollLeft <= 8) revTrack.scrollTo({ left: revTrack.scrollWidth, behavior: 'smooth' });
    else revTrack.scrollBy({ left: -step(), behavior: 'smooth' });
  };

  // Autoplay: avança sozinho, pausa com mouse/toque/foco e respeita reduced-motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = null;
  let resumeTimer = null;
  const play = () => { if (!reduced && !timer) timer = setInterval(next, 4000); };
  const stop = () => { clearInterval(timer); timer = null; };
  const pauseThenResume = () => {
    stop();
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(play, 8000);
  };

  const prevBtn = document.getElementById('revPrev');
  const nextBtn = document.getElementById('revNext');
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); pauseThenResume(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); pauseThenResume(); });

  revTrack.addEventListener('mouseenter', stop);
  revTrack.addEventListener('mouseleave', play);
  revTrack.addEventListener('touchstart', pauseThenResume, { passive: true });
  revTrack.addEventListener('wheel', pauseThenResume, { passive: true });
  revTrack.addEventListener('focusin', stop);
  revTrack.addEventListener('focusout', play);

  // contador "n / total" abaixo da trilha
  const counter = document.getElementById('revNow');
  const total = revTrack.querySelectorAll('.rev-card').length;
  if (counter) {
    let raf = null;
    const syncCount = () => {
      raf = null;
      const i = Math.round(revTrack.scrollLeft / step()) + 1;
      counter.textContent = Math.min(Math.max(i, 1), total);
    };
    revTrack.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(syncCount);
    }, { passive: true });
    syncCount();
  }

  // roda só quando a seção está visível na tela
  new IntersectionObserver((entries) => {
    entries[0].isIntersecting ? play() : stop();
  }, { threshold: 0.2 }).observe(revTrack);
}

// ── ORIGEM DO VISITANTE (anúncio do Google) ──
// Quem chega por anúncio traz ?gclid= (ou utm_campaign). Guardamos na sessão a
// campanha e marcamos a mensagem do WhatsApp, para saber de qual anúncio veio a conversa.
const origemAnuncio = (() => {
  const CHAVE = 'sb_origem';
  const nomeDaPagina = (path) => {
    if (path.includes('correspondente-juridico')) return 'jurídico';
    if (path.includes('empresas') || path.includes('servicos-empresariais')) return 'empresas';
    if (path.includes('/cidades/')) return 'cidade';
    return 'site';
  };
  let origem = null;
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = (params.get('utm_campaign') || '').replace(/[^\p{L}\p{N} _-]/gu, '').slice(0, 30);
    if (utm || params.has('gclid') || params.has('gbraid') || params.has('wbraid')) {
      origem = utm || nomeDaPagina(window.location.pathname);
    }
  } catch (e) { /* URL fora do padrão: segue sem origem */ }
  // sessionStorage pode estar bloqueado (aba anônima): a origem da página atual vale mesmo assim
  try {
    if (origem) sessionStorage.setItem(CHAVE, origem);
    else origem = sessionStorage.getItem(CHAVE);
  } catch (e) { /* sem armazenamento: vale só nesta página */ }
  return origem;
})();

// ── BOTÕES DE PEDIDO ONLINE ──
// Marcação nas páginas:
//   data-pedido="local"   link que vira a página de pedido (o "local" vai junto, para medir de onde veio)
//   data-acompanhar       link que vira a página de acompanhamento
//   data-pedido-on        elemento que só aparece com o sistema ligado (vem com hidden no HTML)
// Roda antes do bloco do WhatsApp para estes links não contarem como conversa de WhatsApp.
const sistemaPedidos = (() => {
  try {
    const u = new URL(SISTEMA_PEDIDOS);
    return u.protocol === 'https:' ? u.origin : null;
  } catch (e) { return null; }
})();
if (sistemaPedidos) {
  const urlPedido = (local) => {
    const u = new URL('/pedir/', sistemaPedidos);
    u.searchParams.set('origem', local || 'site');
    if (origemAnuncio) u.searchParams.set('campanha', origemAnuncio);
    return u.href;
  };
  const criarLink = (classe, icone, texto) => {
    const a = document.createElement('a');
    if (classe) a.className = classe;
    const i = document.createElement('i');
    i.className = icone;
    i.setAttribute('aria-hidden', 'true');
    a.append(i, ' ' + texto);
    return a;
  };

  // Menu do topo, menu do celular e rodapé: criados aqui para não repetir em cada página
  const navCta = document.querySelector('.nav-links .nav-cta');
  if (navCta) {
    const a = criarLink('nav-pedir', 'fas fa-bolt', 'Pedir agora');
    a.dataset.pedido = 'menu';
    navCta.before(a);
  }
  if (mobileMenu && mobileMenu.lastElementChild) {
    const a = criarLink('menu-pedir', 'fas fa-bolt', 'Pedir motoboy agora');
    a.dataset.pedido = 'menu-celular';
    mobileMenu.lastElementChild.before(a);
  }
  const colunaRodape = document.querySelector('footer .footer-col');
  if (colunaRodape) {
    const pedir = criarLink('', 'fas fa-bolt', 'Pedir motoboy agora');
    pedir.dataset.pedido = 'rodape';
    const acompanhar = criarLink('', 'fas fa-location-dot', 'Acompanhar pedido');
    acompanhar.dataset.acompanhar = '';
    colunaRodape.append(pedir, acompanhar);
  }

  document.querySelectorAll('[data-pedido-on]').forEach((el) => { el.hidden = false; });
  document.querySelectorAll('a[data-pedido]').forEach((link) => {
    const local = link.dataset.pedido;
    link.href = urlPedido(local);
    link.removeAttribute('target');
    link.addEventListener('click', () => {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pedido_click', {
          'event_category': 'engagement',
          'event_label': local || window.location.pathname,
          'origem_anuncio': origemAnuncio || 'organico'
        });
      }
    });
  });
  document.querySelectorAll('a[data-acompanhar]').forEach((link) => {
    link.href = new URL('/acompanhar/', sistemaPedidos).href;
    link.removeAttribute('target');
  });
}

// ── WHATSAPP CLICK TRACKING (Google Ads + GA4) ──
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
  if (origemAnuncio) {
    try {
      const url = new URL(link.href);
      const texto = url.searchParams.get('text') || 'Olá Luan, gostaria de fazer um orçamento.';
      // encodeURIComponent gera %20 (e não "+"), que o WhatsApp lê como espaço em qualquer aparelho
      link.href = url.origin + url.pathname + '?text=' +
        encodeURIComponent(texto + '\n\n(Ref.: anúncio Google · ' + origemAnuncio + ')');
    } catch (e) { /* link fora do padrão: mantém como está */ }
  }
  link.addEventListener('click', () => {
    // Google Ads conversion — ação "Contato WhatsApp - Site" (rótulo real do painel)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        'send_to': 'AW-16976838076/K-P2CK_K4ukcELz7l58_',
        'value': 1.0,
        'currency': 'BRL'
      });
      // GA4 event
      gtag('event', 'whatsapp_click', {
        'event_category': 'engagement',
        'event_label': window.location.pathname,
        'origem_anuncio': origemAnuncio || 'organico'
      });
    }
  });
});
