// ── ACOMPANHAR PEDIDO (/acompanhar/?c=CÓDIGO) ──
// Consulta o Speed (SISTEMA_URL, em main.js) e mostra as etapas. Atualiza sozinho a cada 20 s.
(function () {
  const caixa = document.getElementById('acomp');
  if (!caixa) return;
  const API = (typeof SISTEMA_URL !== 'undefined' && SISTEMA_URL) || '';
  const $ = (id) => document.getElementById(id);
  const codigo = new URLSearchParams(location.search).get('c') || '';
  const hora = (ts) => (ts ? new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');

  function mostrar(p) {
    $('acomp-msg').hidden = true;
    $('acomp-titulo').hidden = false;
    $('acomp-titulo').textContent = `Pedido #${p.id}`;
    const cancelado = p.status === 'cancelada';
    const etapas = cancelado
      ? [['Pedido recebido', hora(p.criada_em), true], ['Pedido cancelado', hora(p.cancelada_em), true]]
      : [
        ['Pedido recebido', hora(p.criada_em), true],
        ['Pedido confirmado', p.retida ? 'Aguardando a confirmação do valor' : '', !p.retida],
        ['Motoboy a caminho da coleta', p.motoboy ? `${p.motoboy.nome} · ${hora(p.atribuida_em)}` : hora(p.atribuida_em), Boolean(p.atribuida_em)],
        ['Coletado, a caminho da entrega', hora(p.coletada_em), Boolean(p.coletada_em)],
        ['Entregue', p.entregue_em ? `${hora(p.entregue_em)}${p.recebedor ? ` · recebido por ${p.recebedor}` : ''}` : '', Boolean(p.entregue_em)],
      ];
    const lista = $('acomp-etapas');
    lista.hidden = false;
    lista.innerHTML = '';
    const ultima = etapas.map((e) => e[2]).lastIndexOf(true);
    etapas.forEach(([titulo, detalhe, feita], i) => {
      const li = document.createElement('li');
      if (feita) li.classList.add('feita');
      if (i === ultima && !p.entregue_em && !cancelado) li.classList.add('atual');
      li.append(titulo);
      if (detalhe) { const s = document.createElement('small'); s.textContent = detalhe; li.append(s); }
      lista.append(li);
    });
    const dados = $('acomp-dados');
    dados.hidden = false;
    dados.innerHTML = '';
    const linha = (rotulo, valor) => { if (!valor) return; const d = document.createElement('div'); const b = document.createElement('strong'); b.textContent = rotulo + ' '; d.append(b, valor); dados.append(d); };
    const umLocal = p.coleta.endereco === p.entrega.endereco;
    if (umLocal) linha('Endereço:', p.entrega.endereco);
    else { linha('Coleta:', p.coleta.endereco); linha('Entrega:', p.entrega.endereco); }
    linha('Serviço:', p.servico);
    if (p.valor != null) linha('Valor:', `R$ ${Number(p.valor).toFixed(2).replace('.', ',')}`);
    return Boolean(p.entregue_em) || cancelado;
  }

  async function buscar() {
    try {
      const r = await fetch(`${API}/api/publico/pedido?c=${encodeURIComponent(codigo)}`);
      const p = await r.json();
      if (!r.ok) throw new Error(p.mensagem || 'Pedido não encontrado.');
      if (!mostrar(p)) setTimeout(buscar, 20000);
    } catch (e) {
      $('acomp-msg').hidden = false;
      $('acomp-msg').textContent = e.message || 'Não foi possível consultar agora.';
    }
  }
  if (!API || codigo.length < 8) $('acomp-msg').textContent = 'Link de acompanhamento inválido. Use o link que veio com o seu pedido.';
  else buscar();
})();
