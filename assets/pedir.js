// ── PEDIDO PELO SITE (/pedir/) ──
// O formulário mora no site; os dados vão direto para o Speed Despacho (SISTEMA_URL, em main.js).
// O pedido entra retido: a equipe confere e confirma o valor com o cliente pelo WhatsApp.
(function () {
  const form = document.getElementById('pedido');
  if (!form) return;
  const API = (typeof SISTEMA_URL !== 'undefined' && SISTEMA_URL) || '';
  const $ = (id) => document.getElementById(id);
  const erro = $('erro');
  const enviar = $('enviar');
  const servico = $('servico');
  const detalhes = $('detalhes');
  const dica = $('dica-detalhes');
  const WHATS = 'https://wa.me/5527999165959?text=' + encodeURIComponent('Olá Luan, preciso de um motoboy agora.');
  const OUTROS = /^outros?$/i;
  const MIN_OUTROS = 20;

  const indisponivel = (motivo) => {
    form.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'pedido-aviso';
    p.append(motivo + ' Fale com a gente pelo ');
    const a = document.createElement('a');
    a.href = WHATS; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'WhatsApp (27) 99916-5959';
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

  const ehOutros = () => OUTROS.test(servico.selectedOptions[0]?.textContent.trim() || '');
  function ajustarDetalhes() {
    if (ehOutros()) {
      detalhes.placeholder = 'Conte o que precisa: o que fazer, onde, com quem falar, horário, se precisa esperar ou voltar';
      dica.textContent = `Em "Outros", descreva bem a demanda (pelo menos ${MIN_OUTROS} letras) para avaliarmos.`;
    } else {
      detalhes.placeholder = 'O que vamos levar, com quem falar, horário, se precisa esperar ou voltar';
      dica.textContent = 'Quanto mais detalhe, mais rápido confirmamos.';
    }
  }
  servico.addEventListener('change', ajustarDetalhes);

  // Lembra nome e WhatsApp de quem já pediu (só neste navegador).
  try {
    const g = JSON.parse(localStorage.getItem('speed_pedido') || '{}');
    if (g.nome) $('nome').value = g.nome;
    if (g.telefone) $('telefone').value = g.telefone;
    if (g.coleta) $('coleta').value = g.coleta;
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
    if (!lista.length) { servico.required = false; servico.closest('form').querySelector('label[for="servico"]').hidden = true; servico.hidden = true; }
    ajustarDetalhes();
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    erro.textContent = '';
    const campos = ['servico', 'coleta', 'entrega', 'detalhes', 'nome', 'telefone'].map($).filter((c) => c.required && !c.hidden);
    const falta = campos.find((c) => !c.value.trim());
    if (falta) { erro.textContent = 'Preencha: ' + (form.querySelector(`label[for="${falta.id}"]`)?.textContent || 'campo obrigatório') + '.'; falta.focus(); return; }
    if (ehOutros() && detalhes.value.trim().length < MIN_OUTROS) { erro.textContent = 'Em "Outros", descreva melhor a demanda.'; detalhes.focus(); return; }

    const nomeServico = servico.value ? servico.selectedOptions[0].textContent.trim() : '';
    const corpo = {
      nome: $('nome').value.trim(),
      telefone: $('telefone').value.trim(),
      descricao: (ehOutros() ? 'OUTROS: ' : '') + detalhes.value.trim(),
      requisito: $('requisito').value,
      servico_id: servico.value ? Number(servico.value) : undefined,
      site: form.querySelector('[name="site"]').value,
      coleta: { endereco: $('coleta').value.trim() },
      entrega: { endereco: $('entrega').value.trim(), contato: $('recebe').value.trim() },
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
      try { localStorage.setItem('speed_pedido', JSON.stringify({ nome: corpo.nome, telefone: corpo.telefone, coleta: corpo.coleta.endereco })); } catch (e) { /* sem armazenamento */ }
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pedido_site_enviado', { event_category: 'conversion', event_label: nomeServico || 'sem_tipo' });
      }
      form.hidden = true;
      $('pronto-texto').textContent = `Seu pedido #${r.id} chegou para a nossa equipe. Vamos conferir e chamar você no WhatsApp ${corpo.telefone} para confirmar o valor. O motoboy só sai depois da sua confirmação.`;
      $('pronto').hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      erro.textContent = e.message || 'Não foi possível enviar agora. Tente de novo ou chame no WhatsApp.';
      enviar.disabled = false;
    }
  });

  iniciar();
})();
