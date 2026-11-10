// ── SPEEDBOY MOTOBOY — SHARED JS ──

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
