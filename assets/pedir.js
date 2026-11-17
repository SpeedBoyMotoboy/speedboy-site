// ── PEDIDO PELO SITE (/pedir/) ──
// O formulário mora no site. Ao enviar:
//   1) o pedido entra no Speed (SISTEMA_URL, em main.js), retido para aprovação;
//   2) abre o WhatsApp da empresa (WHATS_PEDIDOS) com o pedido escrito, para combinar o valor.
// Com GOOGLE_MAPS_CHAVE preenchida, endereço só vale se escolhido da lista do Google (com número).
(function () {
  const form = document.getElementById('pedido');
  if (!form) return;
  const API = (typeof SISTEMA_URL !== 'undefined' && SISTEMA_URL) || '';
  const CHAVE = (typeof GOOGLE_MAPS_CHAVE !== 'undefined' && GOOGLE_MAPS_CHAVE) || '';
  const WHATS = (typeof WHATS_PEDIDOS !== 'undefined' && WHATS_PEDIDOS) || '5527999165959';
  const $ = (id) => document.getElementById(id);
  const erro = $('erro');
  const enviar = $('enviar');
  const servico = $('servico');
  const detalhes = $('detalhes');
  const dica = $('dica-detalhes');
  const umLocal = $('um-local');
  const OUTROS = /^outros?$/i;
  const MIN_OUTROS = 20;
  const linkWhats = (texto) => `https://wa.me/${WHATS}?text=${encodeURIComponent(texto)}`;

  const indisponivel = (motivo) => {
    form.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'pedido-aviso';
    p.append(motivo + ' Fale com a gente pelo ');
    const a = document.createElement('a');
    a.href = linkWhats('Olá Luan, preciso de um motoboy agora.');
    a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'WhatsApp (27) 99916-5959';
    p.append(a, '.');
    form.append(p);
  };

  async function chamar(metodo, caminho, corpo) {
    const r = await fetch(API + caminho, {
      method: metodo,
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    const dados = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(dados.mensagem || 'Não foi possível enviar agora.'); e.dados = dados; throw e; }
    return dados;
  }

  // ── Tipo de serviço ──
  const ehOutros = () => OUTROS.test(servico.selectedOptions[0]?.textContent.trim() || '');
  function ajustarDetalhes() {
    if (ehOutros()) {
      detalhes.placeholder = 'Conte o que precisa: o que fazer, onde, com quem falar, horário, se precisa esperar ou voltar';
      dica.textContent = `Em "Outros", descreva bem a demanda (pelo menos ${MIN_OUTROS} letras) para avaliarmos.`;
    } else {
      detalhes.placeholder = 'O que vamos levar, com quem falar, horário, se precisa esperar ou voltar';
      dica.textContent = 'Quanto mais detalhe, mais rápido passamos o valor.';
    }
  }
  servico.addEventListener('change', ajustarDetalhes);

  // ── Um endereço só (o motoboy mais perto vai até lá) ──
  function ajustarLocais() {
    const so = umLocal.checked;
    $('bloco-coleta').hidden = so;
    $('coleta').required = !so;
    $('rotulo-entrega').textContent = so ? 'Endereço do serviço' : 'Onde entregamos?';
  }
  umLocal.addEventListener('change', ajustarLocais);

  // ── Endereço com sugestões do Google (Places API New) ──
  const escolhido = { coleta: null, entrega: null }; // { endereco, lat, lon }
  let places = null;
  let sessao = null;

  function carregarGoogle() {
    if (!CHAVE) return Promise.resolve(null);
    return new Promise((ok) => {
      window.__speedMaps = () => ok(true);
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(CHAVE)}&libraries=places&language=pt-BR&region=BR&loading=async&callback=__speedMaps`;
      s.async = true;
      s.onerror = () => ok(null);
      document.head.append(s);
    }).then(async (carregou) => {
      if (!carregou) return null;
      try { places = await google.maps.importLibrary('places'); return places; } catch (e) { return null; }
    });
  }

  function ligarEndereco(campo) {
    const input = $(campo);
    const lista = $('sug-' + campo);
    let espera = null;
    let itens = [];
    let ativo = -1;
    const fechar = () => { lista.hidden = true; lista.innerHTML = ''; itens = []; ativo = -1; };

    input.addEventListener('input', () => {
      escolhido[campo] = null;
      input.classList.remove('endereco-ok');
      clearTimeout(espera);
      const texto = input.value.trim();
      if (!places || texto.length < 4) { fechar(); return; }
      espera = setTimeout(async () => {
        try {
          if (!sessao) sessao = new places.AutocompleteSessionToken();
          const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: texto, sessionToken: sessao, language: 'pt-BR', region: 'br', includedRegionCodes: ['br'],
            locationBias: { center: { lat: -20.3357855, lng: -40.2968724 }, radius: 50000 },
          });
          lista.innerHTML = '';
          itens = (suggestions || []).map((s) => s.placePrediction).filter(Boolean).slice(0, 6);
          itens.forEach((p, i) => {
            const li = document.createElement('li');
            li.textContent = p.text.toString();
            li.addEventListener('mousedown', (ev) => { ev.preventDefault(); escolher(i); });
            lista.append(li);
          });
          if (itens.length) {
            const r = document.createElement('li');
            r.className = 'rodape-google'; r.textContent = 'Sugestões do Google';
            lista.append(r);
          }
          lista.hidden = !itens.length;
          ativo = -1;
        } catch (e) { fechar(); }
      }, 250);
    });

    input.addEventListener('keydown', (ev) => {
      if (lista.hidden || !itens.length) return;
      const lis = [...lista.querySelectorAll('li:not(.rodape-google)')];
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        ativo = (ativo + (ev.key === 'ArrowDown' ? 1 : -1) + itens.length) % itens.length;
        lis.forEach((li, i) => li.classList.toggle('ativo', i === ativo));
      } else if (ev.key === 'Enter' && ativo >= 0) {
        ev.preventDefault(); escolher(ativo);
      } else if (ev.key === 'Escape') fechar();
    });
    input.addEventListener('blur', () => setTimeout(fechar, 150));

    async function escolher(i) {
      const pred = itens[i];
      fechar();
      if (!pred) return;
      try {
        const lugar = pred.toPlace();
        await lugar.fetchFields({ fields: ['formattedAddress', 'location', 'addressComponents'] });
        sessao = null; // a sessão do Google termina na escolha
        const temNumero = (lugar.addressComponents || []).some((c) => (c.types || []).includes('street_number'));
        input.value = lugar.formattedAddress || pred.text.toString();
        if (!temNumero) {
          erro.textContent = 'Esse endereço está sem número. Digite a rua com o número e escolha de novo.';
          input.focus();
          return;
        }
        erro.textContent = '';
        escolhido[campo] = { endereco: input.value, lat: lugar.location.lat(), lon: lugar.location.lng() };
        input.classList.add('endereco-ok');
      } catch (e) {
        erro.textContent = 'Não consegui confirmar esse endereço. Tente de novo.';
      }
    }
  }
  ligarEndereco('coleta');
  ligarEndereco('entrega');

  // ── CNPJ (opcional, para a nota fiscal) ──
  function cnpjValido(c) {
    if (!/^\d{14}$/.test(c) || /^(\d)\1+$/.test(c)) return false;
    const dv = (b, pesos) => { const s = pesos.reduce((t, p, i) => t + Number(b[i]) * p, 0) % 11; return s < 2 ? 0 : 11 - s; };
    return dv(c, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(c[12]) && dv(c, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(c[13]);
  }
  const fmtCnpj = (c) => c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

  // Lembra nome, WhatsApp e CNPJ de quem já pediu (só neste navegador).
  try {
    const g = JSON.parse(localStorage.getItem('speed_pedido') || '{}');
    if (g.nome) $('nome').value = g.nome;
    if (g.telefone) $('telefone').value = g.telefone;
    if (g.cnpj) $('cnpj').value = g.cnpj;
  } catch (e) { /* sem armazenamento */ }

  async function iniciar() {
    if (!API) return indisponivel('Pedido pelo site em manutenção.');
    let info;
    try { info = await chamar('GET', '/api/publico/info'); } catch (e) { return indisponivel('Pedido pelo site indisponível agora.'); }
    if (info.ativo === false) return indisponivel('Pedido pelo site indisponível agora.');
    if (info.fechado) return indisponivel(`Estamos fechados agora (atendimento: ${info.fechado}).`);
    const lista = Array.isArray(info.servicos) ? info.servicos : [];
    servico.innerHTML = '';
    const vazio = document.createElement('option');
    vazio.value = ''; vazio.textContent = 'Escolha uma opção';
    servico.append(vazio);
    lista.forEach((s) => {
      const o = document.createElement('option');
      o.value = String(s.id); o.textContent = s.nome;
      servico.append(o);
    });
    if (!lista.length) { servico.required = false; form.querySelector('label[for="servico"]').hidden = true; servico.hidden = true; }
    ajustarDetalhes();
    ajustarLocais();
    carregarGoogle();
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    erro.textContent = '';
    const so = umLocal.checked;
    const campos = ['servico', 'coleta', 'entrega', 'detalhes', 'nome', 'telefone'].map($).filter((c) => c.required && !c.hidden);
    const falta = campos.find((c) => !c.value.trim());
    if (falta) { erro.textContent = 'Preencha: ' + (form.querySelector(`label[for="${falta.id}"]`)?.textContent || 'campo obrigatório') + '.'; falta.focus(); return; }
    if (places) {
      for (const campo of so ? ['entrega'] : ['coleta', 'entrega']) {
        if (!escolhido[campo]) { erro.textContent = 'Escolha o endereço na lista de sugestões (com número).'; $(campo).focus(); return; }
      }
    }
    if (ehOutros() && detalhes.value.trim().length < MIN_OUTROS) { erro.textContent = 'Em "Outros", descreva melhor a demanda.'; detalhes.focus(); return; }
    const cnpj = $('cnpj').value.replace(/\D/g, '');
    if (cnpj && !cnpjValido(cnpj)) { erro.textContent = 'CNPJ inválido. Confira os números ou deixe em branco.'; $('cnpj').focus(); return; }

    const ponto = (campo) => {
      const e = escolhido[campo];
      const compl = $(campo + '-compl').value.trim();
      const base = e ? e.endereco : $(campo).value.trim();
      return { endereco: compl ? `${base} — ${compl}` : base, lat: e ? e.lat : null, lon: e ? e.lon : null };
    };
    const entrega = { ...ponto('entrega'), contato: $('recebe').value.trim() };
    const coleta = so ? { endereco: entrega.endereco, lat: entrega.lat, lon: entrega.lon } : ponto('coleta');
    const nomeServico = servico.value ? servico.selectedOptions[0].textContent.trim() : '';
    const tamanho = $('requisito').selectedOptions[0].textContent;
    const desc = [(ehOutros() ? 'OUTROS: ' : '') + detalhes.value.trim(), cnpj ? `CNPJ: ${fmtCnpj(cnpj)}` : '', so ? 'Um endereço só' : '']
      .filter(Boolean).join(' | ');
    const corpo = {
      nome: $('nome').value.trim(),
      telefone: $('telefone').value.trim(),
      descricao: desc,
      requisito: $('requisito').value,
      servico_id: servico.value ? Number(servico.value) : undefined,
      site: form.querySelector('[name="site"]').value,
      coleta, entrega,
    };
    enviar.disabled = true;
    try {
      let r;
      try {
        r = await chamar('POST', '/api/publico/pedidos', corpo);
      } catch (e) {
        // A conferência achou outro tipo de serviço: troca e reenvia uma vez.
        if (e.dados?.erro !== 'servico_diferente' || !e.dados.servico_id) throw e;
        servico.value = String(e.dados.servico_id);
        r = await chamar('POST', '/api/publico/pedidos', { ...corpo, servico_id: e.dados.servico_id });
      }
      try { localStorage.setItem('speed_pedido', JSON.stringify({ nome: corpo.nome, telefone: corpo.telefone, cnpj: cnpj ? fmtCnpj(cnpj) : '' })); } catch (e) { /* sem armazenamento */ }
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pedido_site_enviado', { event_category: 'conversion', event_label: nomeServico || 'sem_tipo' });
      }
      const msg = [
        `Olá! Fiz o pedido #${r.id} pelo site 🛵`,
        nomeServico && `*Serviço:* ${nomeServico}`,
        so ? `*Endereço:* ${entrega.endereco}` : `*Coleta:* ${coleta.endereco}\n*Entrega:* ${entrega.endereco}`,
        `*Detalhes:* ${detalhes.value.trim()}`,
        `*Tamanho:* ${tamanho}`,
        entrega.contato && `*Quem recebe:* ${entrega.contato}`,
        `*Nome:* ${corpo.nome}`,
        cnpj && `*CNPJ:* ${fmtCnpj(cnpj)}`,
        'Pode me passar o valor?',
      ].filter(Boolean).join('\n');
      const link = linkWhats(msg);
      form.hidden = true;
      $('pronto-texto').textContent = `Seu pedido #${r.id} foi registrado. Agora envie a mensagem no WhatsApp da SpeedBoy: passamos o valor ali e, com o seu ok, o motoboy sai.`;
      $('pronto-whats').href = link;
      $('pronto').hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => { window.location.href = link; }, 600);
    } catch (e) {
      erro.textContent = e.message || 'Não foi possível enviar agora. Tente de novo ou chame no WhatsApp.';
      enviar.disabled = false;
    }
  });

  iniciar();
})();
