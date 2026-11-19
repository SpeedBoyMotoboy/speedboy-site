// ── ACOMPANHAR PEDIDO (/acompanhar/?c=CÓDIGO) ──
// Consulta o Speed (SISTEMA_URL, em main.js) e mostra as etapas e, quando liberado, o motoboy no mapa.
// Atualiza sozinho (10 s com mapa, 20 s sem).
(function () {
  const caixa = document.getElementById('acomp');
  if (!caixa) return;
  const API = (typeof SISTEMA_URL !== 'undefined' && SISTEMA_URL) || '';
  const $ = (id) => document.getElementById(id);
  const codigo = new URLSearchParams(location.search).get('c') || '';
  // Mapa com o motoboy: só quando o sistema manda a posição (depois da coleta, ou endereço único).
  // Leaflet vem do próprio Speed, carregado só quando precisa.
  let mapa = null;
  let camada = null;
  let leaflet = null;
  function carregarLeaflet() {
    if (leaflet) return leaflet;
    leaflet = new Promise((ok, falha) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = `${API}/vendor/leaflet/leaflet.css`;
      document.head.append(css);
      const s = document.createElement('script');
      s.src = `${API}/vendor/leaflet/leaflet.js`; s.onload = () => ok(window.L); s.onerror = falha;
      document.head.append(s);
    });
    return leaflet;
  }
  const pino = (L, txt, cor) => L.divIcon({ className: '', iconSize: [34, 34], iconAnchor: [17, 17],
    html: `<div style="width:34px;height:34px;border-radius:50%;background:${cor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)">${txt}</div>` });
  async function desenharMapa(p) {
    const caixaMapa = $('acomp-mapa');
    const m = p.motoboy;
    const ativo = m && m.lat != null && !p.entregue_em && p.status !== 'cancelada';
    caixaMapa.hidden = !ativo;
    $('acomp-mapa-info').hidden = !ativo;
    if (!ativo) return false;
    const min = m.ult_ts ? Math.max(0, Math.round((p.agora - m.ult_ts) / 60000)) : null;
    $('acomp-mapa-info').textContent = `${m.nome} ${p.status === 'atribuida' ? 'está indo buscar' : 'está a caminho da entrega'}${min == null ? '' : min < 1 ? ' (agora)' : ` (há ${min} min)`}. Atualiza sozinho.`;
    try {
      const L = await carregarLeaflet();
      if (!mapa) {
        mapa = L.map(caixaMapa, { zoomControl: false, attributionControl: true });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(mapa);
        camada = L.layerGroup().addTo(mapa);
      }
      camada.clearLayers();
      const pontos = [[m.lat, m.lon]];
      L.marker([m.lat, m.lon], { icon: pino(L, '🛵', '#002776'), zIndexOffset: 500 }).addTo(camada);
      // Indo buscar: destino é a coleta. Já coletado: a entrega.
      const destino = p.status === 'atribuida' && p.coleta.lat != null ? p.coleta : p.entrega;
      if (destino && destino.lat != null) {
        L.marker([destino.lat, destino.lon], { icon: pino(L, '🏁', '#333F22') }).addTo(camada);
        pontos.push([destino.lat, destino.lon]);
      }
      mapa.invalidateSize();
      mapa.fitBounds(pontos, { padding: [40, 40], maxZoom: 16 });
    } catch (e) { caixaMapa.hidden = true; }
    return true;
  }

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
      const fim = mostrar(p);
      const comMapa = await desenharMapa(p);
      if (!fim) setTimeout(buscar, comMapa ? 10000 : 20000);
    } catch (e) {
      $('acomp-msg').hidden = false;
      $('acomp-msg').textContent = e.message || 'Não foi possível consultar agora.';
    }
  }
  if (!API || codigo.length < 8) $('acomp-msg').textContent = 'Link de acompanhamento inválido. Use o link que veio com o seu pedido.';
  else buscar();
})();
