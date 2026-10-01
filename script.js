// Atualiza o Relógio Digital e Data por Extenso
function atualizarRelogio() {
  const agora = new Date();
  document.getElementById('relogio').innerText = agora.toLocaleTimeString('pt-BR');
  
  const opcoesData = { weekday: 'long', day: 'numeric', month: 'long' };
  const dataFormatada = agora.toLocaleDateString('pt-BR', opcoesData).toUpperCase();
  document.getElementById('data-extenso').innerText = dataFormatada;
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();

// Define data padrão no input e carrega dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('dataConsulta').value = hoje;
  buscarPontoPorData();
  calcularTotaisDoMes();
});

// Ícones correspondentes a cada marcação
const icones = {
  'ENTRADA': 'fa-solid fa-right-to-bracket',
  'Saída Almoço': 'fa-solid fa-utensils',
  'Volta Almoço': 'fa-regular fa-clock',
  'Saída Final': 'fa-solid fa-right-from-bracket'
};

// Marcar Ponto
function marcarPonto(tipo) {
  const agora = new Date();
  const dataChave = agora.toISOString().split('T')[0];
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let pontos = JSON.parse(localStorage.getItem('pontosTrabalho')) || {};

  if (!pontos[dataChave]) {
    pontos[dataChave] = [];
  }

  pontos[dataChave].push({ tipo, hora });
  localStorage.setItem('pontosTrabalho', JSON.stringify(pontos));

  buscarPontoPorData();
  calcularTotaisDoMes();
}

// Buscar Ficheiro por Data Selecionada
function buscarPontoPorData() {
  const dataSelecionada = document.getElementById('dataConsulta').value;
  const container = document.getElementById('resultadoFicheiro');

  if (!dataSelecionada) {
    container.innerHTML = '<p style="font-size: 0.8rem; color: #6b7280;">Selecione uma data.</p>';
    return;
  }

  const pontos = JSON.parse(localStorage.getItem('pontosTrabalho')) || {};
  const registros = pontos[dataSelecionada];
  const [ano, mes, dia] = dataSelecionada.split('-');
  const dataExibicao = `${dia}/${mes}/${ano}`;

  if (!registros || registros.length === 0) {
    container.innerHTML = `<p style="font-size: 0.8rem; color: #6b7280; margin-top: 8px;">Nenhum registro em <strong>${dataExibicao}</strong>.</p>`;
    return;
  }

  let html = `<div class="registro-titulo">Registros de ${dataExibicao}</div>`;

  registros.forEach(reg => {
    const iconeClass = icones[reg.tipo] || 'fa-regular fa-clock';
    html += `
      <div class="registro-item">
        <div class="registro-esq">
          <i class="${iconeClass}"></i>
          <span>${reg.tipo}</span>
        </div>
        <span class="registro-hora">${reg.hora}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Calcular Totais de Horas do Mês
function calcularTotaisDoMes() {
  const dataSelecionada = document.getElementById('dataConsulta').value || new Date().toISOString().split('T')[0];
  const [ano, mes] = dataSelecionada.split('-');
  
  const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  document.getElementById('tituloTotais').innerText = `Totais de ${nomesMeses[parseInt(mes, 10) - 1]}`;

  const pontos = JSON.parse(localStorage.getItem('pontosTrabalho')) || {};
  let totalMinutosMes = 0;
  let diasTrabalhados = 0;

  Object.keys(pontos).forEach(dataKey => {
    if (dataKey.startsWith(`${ano}-${mes}`)) {
      const regs = pontos[dataKey];
      const minutosDia = calcularMinutosDoDia(regs);
      if (minutosDia > 0) {
        totalMinutosMes += minutosDia;
        diasTrabalhados++;
      }
    }
  });

  const horas = Math.floor(totalMinutosMes / 60);
  const minutos = totalMinutosMes % 60;
  document.getElementById('totalHoras').innerText = `${horas}h ${minutos < 10 ? '0' : ''}${minutos}m`;

  if (diasTrabalhados > 0) {
    const mediaMinutos = Math.round(totalMinutosMes / diasTrabalhados);
    const mediaH = Math.floor(mediaMinutos / 60);
    const mediaM = mediaMinutos % 60;
    document.getElementById('mediaDiaria').innerText = `${mediaH}h ${mediaM < 10 ? '0' : ''}${mediaM}m`;
  } else {
    document.getElementById('mediaDiaria').innerText = `0h 00m`;
  }
}

// Função auxiliar para calcular horas trabalhadas no dia
function calcularMinutosDoDia(registros) {
  let entrada = null;
  let saidaAlmoco = null;
  let voltaAlmoco = null;
  let saidaFinal = null;

  registros.forEach(r => {
    if (r.tipo === 'ENTRADA') entrada = r.hora;
    if (r.tipo === 'Saída Almoço') saidaAlmoco = r.hora;
    if (r.tipo === 'Volta Almoço') voltaAlmoco = r.hora;
    if (r.tipo === 'Saída Final') saidaFinal = r.hora;
  });

  let totalMinutos = 0;

  if (entrada && saidaAlmoco) {
    totalMinutos += diferencaEmMinutos(entrada, saidaAlmoco);
  }
  if (voltaAlmoco && saidaFinal) {
    totalMinutos += diferencaEmMinutos(voltaAlmoco, saidaFinal);
  } else if (entrada && saidaFinal && !saidaAlmoco) {
    totalMinutos += diferencaEmMinutos(entrada, saidaFinal);
  }

  return totalMinutos;
}

function diferencaEmMinutos(horaInicio, horaFim) {
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFim.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}
