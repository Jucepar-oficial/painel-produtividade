const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Cadastro institucional incorporado ao conversor. A planilha mensal precisa
// conter somente a aba DADOS; nenhuma tabela auxiliar é exigida do usuário.
const cadastroVogais = new Map(Object.entries({
  'ADELE STIVAL CHENU SCHNEIDER': ['FEDERAÇÃO DA AGRICULTURA DO ESTADO DO PARANÁ - FAEP', 'FAEP'],
  'ALEXANDRE FAYZANO': ['FEDERAÇÃO DO COMÉRCIO DO ESTADO DO PARANÁ - FECOMÉRCIO', 'FECOMÉRCIO'],
  'ANADEJE MELISSA ALEXANDRE STRECHAR': ['FEDERAÇÃO DAS ASSOCIAÇÕES COMERCIAIS E EMPRESARIAIS DO PARANÁ', 'FACIAP'],
  'BEATRIZ SZPAK': ['GOVERNO DO ESTADO', 'GOVERNO DO ESTADO'],
  'BIANCA DOMAKOSKI': ['GOVERNO DO ESTADO', 'GOVERNO DO ESTADO'],
  'CASSIANA MARIA MEDEIROS FRAZÃO MELEK': ['FEDERAÇÃO DAS INDÚSTRIAS DO ESTADO DO PARANÁ - FIEP', 'FIEP'],
  'CELSO MACHADO': ['CONSELHO REGIONAL DE ECONOMIA - CORECON/PR', 'CORECON/PR'],
  'CLAUDIOMIRO SANTOS RODRIGUES': ['SINDICATO E ORGANIZAÇÃO DAS COOPERATIVAS DO ESTADO DO PARANÁ - OCEPAR', 'SISTEMA OCEPAR'],
  'ERCÍLIO SANTINONI': ['FEDERAÇÃO DAS ASSOCIAÇÕES DAS MICRO E PEQUENAS EMPRESAS DO ESTADO DO PARANÁ - FAMPEPAR', 'FAMPEPAR'],
  'FABIANA KONIG JUNKES': ['FEDERAÇÃO DAS EMPRESAS DE HOSPEDAGEM, GASTRONOMIA, ENTRETENIMENTO, LAZER E SIMILARES DO ESTADO DO PARANÁ', 'FETURISMO'],
  'FRANCISCO MISURELLI FERRO': ['ASSOCIAÇÃO COMERCIAL DO PARANÁ - ACP', 'ACP'],
  'GIOVANI CÁSSIO PIOVEZAN': ['ORDEM DOS ADVOGADOS DO BRASIL - SECÇÃO PARANÁ', 'OAB/PR'],
  'IVO ERICSSON CAMARGO DE LIMA': ['GOVERNO DO ESTADO', 'GOVERNO DO ESTADO'],
  'JAIR LEITE': ['GOVERNO DO ESTADO', 'GOVERNO DO ESTADO'],
  'JOSÉ GEORGEVAN GOMES DE ARAÚJO': ['FEDERAÇÃO DAS INDÚSTRIAS DO ESTADO DO PARANÁ - FIEP', 'FIEP'],
  'JOSÉ LUIZ VARGAS BUENO': ['FEDERAÇÃO DAS EMPRESAS DE TRANSPORTE DE PASSAGEIROS DOS ESTADOS DO PARANÁ E SANTA CATARINA - FEPASC', 'FEPASC'],
  'JOÃO PAULO ATILIO GODRI': ['UNIÃO FEDERAL', 'UNIÃO FEDERAL'],
  'JUÇARA MARQUES NEGREIROS': ['FEDERAÇÃO DAS EMPRESAS DE TRANSPORTE DE CARGAS DO ESTADO DO PARANÁ - FETRANSPAR', 'FETRANSPAR'],
  'MARIA AUGUSTA PISANI GEARA': ['GOVERNO DO ESTADO', 'GOVERNO DO ESTADO'],
  'NAIM AKEL NETO': ['GOVERNO DO ESTADO', 'GOVERNO DO ESTADO'],
  'SAMARA CRISTINA DOS SANTOS DE MEIRA': ['FEDERAÇÃO DAS EMPRESAS DE SERVIÇOS CONTÁBEIS E DAS EMPRESAS DE ASSESSORAMENTO, PERÍCIAS, INFORMAÇÕES E PESQUISAS - FENACON', 'FENACON'],
  'SÉRGIO PEREIRA LOBO': ['CONSELHO REGIONAL DE ADMINISTRAÇÃO DO PARANÁ - CRA/PR', 'CRA/PR']
}).map(([nome, [entidade, sigla]]) => [nome, { entidade, sigla }]));

const $ = id => document.getElementById(id);
const mes = $('conv-mes');
mes.innerHTML = meses.map((nome, indice) => `<option value="${indice + 1}">${nome}</option>`).join('');
mes.value = String(new Date().getMonth() || 1);
let arquivo = null;
let payload = null;

$('conv-arquivo').addEventListener('change', evento => {
  arquivo = evento.target.files[0] || null;
  $('arquivo-nome').textContent = arquivo
    ? `${arquivo.name} — ${(arquivo.size / 1024 / 1024).toFixed(1)} MB`
    : 'Nenhum arquivo selecionado.';
});

$('conv-gerar').addEventListener('click', async () => {
  const box = $('conv-resultado');
  box.className = 'resultado';
  box.innerHTML = '<p>Processando a planilha…</p>';

  if (!arquivo) {
    erro('Selecione uma planilha antes de continuar.');
    return;
  }

  try {
    const ano = Number($('conv-ano').value);
    const numeroMes = Number(mes.value);
    const competencia = `${ano}-${String(numeroMes).padStart(2, '0')}`;
    const buffer = await arquivo.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    if (!workbook.Sheets.DADOS) {
      throw Error("A planilha deve conter a aba 'DADOS'.");
    }

    const dados = XLSX.utils.sheet_to_json(workbook.Sheets.DADOS, { header: 1, raw: true, defval: '' });
    if (!dados.length) throw Error("A aba 'DADOS' está vazia.");

    const cabecalho = dados[0].map(valor => String(valor).trim());
    const indices = {
      nome: cabecalho.indexOf('RELATOR'),
      tipo: cabecalho.indexOf('Tipo de Análise'),
      data: cabecalho.indexOf('Data'),
      decisao: cabecalho.indexOf('Situação')
    };
    if (Object.values(indices).some(indice => indice < 0)) {
      throw Error('As colunas RELATOR, Tipo de Análise, Data e Situação são obrigatórias.');
    }

    const grupos = new Map();
    const competencias = new Set();
    const naoCadastrados = new Set();
    let total = 0;

    for (const linha of dados.slice(1)) {
      const data = normalizarData(linha[indices.data]);
      if (!data) continue;

      const periodo = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      competencias.add(periodo);
      if (periodo !== competencia) continue;

      const nome = String(linha[indices.nome] || '').trim().toUpperCase();
      if (!cadastroVogais.has(nome)) {
        naoCadastrados.add(nome || '(sem nome)');
        continue;
      }

      const tipo = String(linha[indices.tipo] || '').trim();
      const decisao = String(linha[indices.decisao] || '').trim();
      const chave = JSON.stringify([nome, tipo, decisao]);
      grupos.set(chave, (grupos.get(chave) || 0) + 1);
      total++;
    }

    if (naoCadastrados.size) {
      throw Error(`Cadastro institucional não encontrado para: ${[...naoCadastrados].sort().join(', ')}. Atualize o conversor antes de gerar o arquivo.`);
    }
    if (!total) {
      throw Error(`Nenhum registro de ${competencia}. Competências encontradas: ${[...competencias].sort().join(', ') || 'nenhuma'}.`);
    }

    const registros = [...grupos].map(([chave, quantidade]) => {
      const [nome, tipoAnalise, decisao] = JSON.parse(chave);
      const cadastro = cadastroVogais.get(nome);
      return {
        vogal: nome,
        periodo: competencia,
        tipoAnalise,
        decisao,
        entidade: cadastro.entidade,
        siglaEntidade: cadastro.sigla,
        quantidade
      };
    }).sort((a, b) => a.vogal.localeCompare(b.vogal, 'pt-BR') || a.tipoAnalise.localeCompare(b.tipoAnalise, 'pt-BR') || a.decisao.localeCompare(b.decisao, 'pt-BR'));

    payload = {
      competencia,
      geradoEm: new Date().toISOString(),
      totalRegistros: total,
      totalCombinacoes: registros.length,
      registros
    };

    box.innerHTML = `<h3>Planilha validada</h3><dl><div><dt>Competência</dt><dd>${competencia}</dd></div><div><dt>Registros</dt><dd>${total.toLocaleString('pt-BR')}</dd></div><div><dt>Combinações</dt><dd>${registros.length.toLocaleString('pt-BR')}</dd></div></dl><p>O arquivo gerado não contém protocolos nem linhas individualizadas.</p><div class="acoes"><button class="botao principal" id="download-json">Baixar produtividade-${competencia}.json</button></div>`;
    $('download-json').onclick = () => baixar(payload, `produtividade-${competencia}.json`);
  } catch (e) {
    erro(e.message);
  }
});

function normalizarData(valor) {
  if (valor instanceof Date && !isNaN(valor)) return valor;
  if (typeof valor === 'number') {
    const partes = XLSX.SSF.parse_date_code(valor);
    return partes ? new Date(partes.y, partes.m - 1, partes.d) : null;
  }
  const data = new Date(valor);
  return isNaN(data) ? null : data;
}

function erro(mensagem) {
  const box = $('conv-resultado');
  box.className = 'resultado erro';
  box.innerHTML = `<h3>Não foi possível gerar</h3><p>${String(mensagem).replace(/[&<>]/g, caractere => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[caractere])}</p>`;
}

function baixar(objeto, nome) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(objeto)], { type: 'application/json' }));
  link.download = nome;
  link.click();
  URL.revokeObjectURL(link.href);
}
