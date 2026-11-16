const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors({ origin: /^http:\/\/(localhost|127\.0\.0\.1):\d+$/ }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});


const LIMITE_DIARIO_SEG = 40 * 60;

const OPERACOES_VALIDAS = ['adicao', 'subtracao', 'multiplicacao', 'divisao', 'comparacao'];

function tempoUsadoHoje(idPerfil, idSessaoAtual) {
  const linha = db
    .prepare(`
      SELECT COALESCE(SUM(tempo_utilizado_seg), 0) AS total
      FROM registro_sessao
      WHERE id_perfil = ?
        AND id_sessao <> ?
        AND date(data_inicio, 'localtime') = date('now', 'localtime')
    `)
    .get(idPerfil, idSessaoAtual);
  return linha.total;
}


function nivelDe(pontos) {
  return Math.floor(pontos / 50) + 1;
}

function nomeDificuldade(nivel) {
  return nivel <= 2 ? 'Fácil' : nivel <= 5 ? 'Médio' : 'Difícil';
}


function garantirProgresso(idPerfil) {
  db.prepare('INSERT OR IGNORE INTO progresso_matematica (id_perfil) VALUES (?)').run(idPerfil);
  return db.prepare('SELECT * FROM progresso_matematica WHERE id_perfil = ?').get(idPerfil);
}

app.get('/', (req, res) => {
  res.send('Oi! v2 - O backend do EducaPlay está funcionando!');
});


app.post('/api/responsaveis', (req, res) => {
  const { nome, email, senha, pin } = req.body;

  if (!nome || !email || !senha || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ erro: 'Informe nome, e-mail, senha e um PIN de 4 dígitos.' });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);
  const pinHash = bcrypt.hashSync(pin, 10);

  try {
    const resultado = db
      .prepare('INSERT INTO responsavel (nome, email, senha_hash, pin_seguranca) VALUES (?, ?, ?, ?)')
      .run(nome, email.toLowerCase(), senhaHash, pinHash);

    res.status(201).json({ idResponsavel: resultado.lastInsertRowid, nome, email });
  } catch (erro) {
    res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  }
});


app.post('/api/responsaveis/login', (req, res) => {
  const { email, senha, pin } = req.body;

  const responsavel = db
    .prepare('SELECT * FROM responsavel WHERE email = ?')
    .get((email || '').toLowerCase());

  const dadosCorretos =
    responsavel &&
    bcrypt.compareSync(senha || '', responsavel.senha_hash) &&
    bcrypt.compareSync(pin || '', responsavel.pin_seguranca);

  if (!dadosCorretos) {
    return res.status(401).json({ erro: 'E-mail, senha ou PIN incorretos.' });
  }

  res.json({
    idResponsavel: responsavel.id_responsavel,
    nome: responsavel.nome,
    email: responsavel.email
  });
});


app.post('/api/perfis/entrar', (req, res) => {
  const nome = ((req.body && req.body.nome) || '').trim();

  if (!nome) {
    return res.status(400).json({ erro: 'Escreva o seu nome para jogarmos!' });
  }

  let perfil = db
    .prepare('SELECT * FROM perfil_infantil WHERE lower(nome) = lower(?)')
    .get(nome);

  if (!perfil) {
    const responsavel = db
      .prepare('SELECT id_responsavel FROM responsavel ORDER BY id_responsavel LIMIT 1')
      .get();

    const resultado = db
      .prepare('INSERT INTO perfil_infantil (id_responsavel, nome) VALUES (?, ?)')
      .run(responsavel ? responsavel.id_responsavel : null, nome);

    perfil = db
      .prepare('SELECT * FROM perfil_infantil WHERE id_perfil = ?')
      .get(resultado.lastInsertRowid);
  }

  res.json({
    idPerfil: perfil.id_perfil,
    nome: perfil.nome,
    faixaEtaria: perfil.faixa_etaria,
    saldoEstrelas: perfil.saldo_estrelas
  });
});


app.post('/api/sessoes', (req, res) => {
  const idPerfil = Number(req.body && req.body.idPerfil);

  const perfil = db
    .prepare('SELECT 1 FROM perfil_infantil WHERE id_perfil = ?')
    .get(idPerfil);

  if (!perfil) {
    return res.status(404).json({ erro: 'Perfil não encontrado.' });
  }

  const resultado = db
    .prepare('INSERT INTO registro_sessao (id_perfil, data_inicio) VALUES (?, ?)')
    .run(idPerfil, new Date().toISOString());

  res.status(201).json({
    idSessao: resultado.lastInsertRowid,
    idPerfil,
    tempoUtilizadoSeg: 0
  });
});

app.put('/api/sessoes/:id', (req, res) => {
  const sessao = db
    .prepare('SELECT * FROM registro_sessao WHERE id_sessao = ?')
    .get(req.params.id);

  if (!sessao) {
    return res.status(404).json({ erro: 'Sessão não encontrada.' });
  }

  const enviado = Math.floor(Number(req.body && req.body.tempoUtilizadoSeg) || 0);
  const tempo = Math.max(sessao.tempo_utilizado_seg, enviado);

  const totalHoje = tempoUsadoHoje(sessao.id_perfil, sessao.id_sessao) + tempo;
  const bloqueou = totalHoje >= LIMITE_DIARIO_SEG ? 1 : sessao.bloqueou_por_timer;

  db.prepare('UPDATE registro_sessao SET tempo_utilizado_seg = ?, bloqueou_por_timer = ? WHERE id_sessao = ?')
    .run(tempo, bloqueou, sessao.id_sessao);

  res.json({
    idSessao: sessao.id_sessao,
    tempoUtilizadoSeg: tempo,
    bloqueouPorTimer: bloqueou === 1,
    usadoHojeSeg: totalHoje,
    limiteDiarioSeg: LIMITE_DIARIO_SEG
  });
});


app.post('/api/perfis/:id/desafios', (req, res) => {
  const idPerfil = Number(req.params.id);
  const { operacao, acertou, pontos } = req.body;

  if (!OPERACOES_VALIDAS.includes(operacao) || typeof acertou !== 'boolean') {
    return res.status(400).json({
      erro: 'Informe operacao (adicao, subtracao, multiplicacao, divisao ou comparacao) e acertou (true ou false).'
    });
  }

  const perfil = db.prepare('SELECT 1 FROM perfil_infantil WHERE id_perfil = ?').get(idPerfil);
  if (!perfil) {
    return res.status(404).json({ erro: 'Perfil não encontrado.' });
  }


  const ganho = acertou ? Math.max(0, Math.floor(Number(pontos) || 5)) : 0;
  garantirProgresso(idPerfil);

  db.prepare('INSERT INTO desafio (id_perfil, operacao, acertou, pontos, data) VALUES (?, ?, ?, ?, ?)')
    .run(idPerfil, operacao, acertou ? 1 : 0, ganho, new Date().toISOString());

  db.prepare(`UPDATE progresso_matematica
              SET total_acertos = total_acertos + ?, pontuacao_total = pontuacao_total + ?, operacao_atual = ?
              WHERE id_perfil = ?`)
    .run(acertou ? 1 : 0, ganho, operacao, idPerfil); 

  db.prepare('UPDATE perfil_infantil SET saldo_estrelas = saldo_estrelas + ? WHERE id_perfil = ?')
    .run(ganho, idPerfil);

  const progresso = db.prepare('SELECT * FROM progresso_matematica WHERE id_perfil = ?').get(idPerfil);
  const nivel = nivelDe(progresso.pontuacao_total);
  db.prepare('UPDATE progresso_matematica SET nivel_dificuldade = ? WHERE id_perfil = ?')
    .run(nomeDificuldade(nivel), idPerfil);

  res.status(201).json({
    totalAcertos: progresso.total_acertos,
    pontuacaoTotal: progresso.pontuacao_total,
    nivel
  });
});


app.get('/api/perfis/:id/progresso', (req, res) => {
  const idPerfil = Number(req.params.id);

  const perfil = db.prepare('SELECT 1 FROM perfil_infantil WHERE id_perfil = ?').get(idPerfil);
  if (!perfil) {
    return res.status(404).json({ erro: 'Perfil não encontrado.' });
  }

  const p = garantirProgresso(idPerfil);
  const t = db
    .prepare('SELECT COUNT(*) AS total, COALESCE(SUM(acertou), 0) AS acertos FROM desafio WHERE id_perfil = ?')
    .get(idPerfil);

  res.json({
    nivelDificuldade: p.nivel_dificuldade,
    operacaoAtual: p.operacao_atual,
    totalAcertos: p.total_acertos,
    pontuacaoTotal: p.pontuacao_total,
    nivel: nivelDe(p.pontuacao_total),
    precisao: t.total ? Math.round((t.acertos / t.total) * 100) : 0
  });
});


app.get('/api/responsaveis/:id/perfis', (req, res) => {
  const perfis = db
    .prepare('SELECT * FROM perfil_infantil WHERE id_responsavel = ? ORDER BY id_perfil')
    .all(Number(req.params.id));

  res.json(perfis.map((p) => ({
    idPerfil: p.id_perfil,
    nome: p.nome,
    faixaEtaria: p.faixa_etaria,
    saldoEstrelas: p.saldo_estrelas
  })));
});


function precisaoDe(idPerfil, operacao) {
  const t = db
    .prepare('SELECT COUNT(*) AS total, COALESCE(SUM(acertou), 0) AS acertos FROM desafio WHERE id_perfil = ? AND operacao = ?')
    .get(idPerfil, operacao);
  return t.total ? Math.round((t.acertos / t.total) * 100) : null;
}


app.get('/api/perfis/:id/relatorio', (req, res) => {
  const idPerfil = Number(req.params.id);

  const perfil = db.prepare('SELECT * FROM perfil_infantil WHERE id_perfil = ?').get(idPerfil);
  if (!perfil) {
    return res.status(404).json({ erro: 'Perfil não encontrado.' });
  }

  const progresso = garantirProgresso(idPerfil);
  const nivel = nivelDe(progresso.pontuacao_total);
  const usadoHojeSeg = tempoUsadoHoje(idPerfil, 0);

  res.json({
    nome: perfil.nome,
    nivel,
    tituloNivel: 'Pequeno Matemático',
    estrelas: perfil.saldo_estrelas,
    progressoNivelPct: Math.round(((progresso.pontuacao_total % 50) / 50) * 100),
    tempoHojeMin: Math.round(usadoHojeSeg / 60),
    limiteDiarioMin: LIMITE_DIARIO_SEG / 60,
    dentroDoLimite: usadoHojeSeg < LIMITE_DIARIO_SEG,
    desempenho: [
      { materia: 'Adição Básica', precisaoPct: precisaoDe(idPerfil, 'adicao'), bloqueado: false },
      { materia: 'Subtração', precisaoPct: precisaoDe(idPerfil, 'subtracao'), bloqueado: false },
      { materia: 'Multiplicação', precisaoPct: precisaoDe(idPerfil, 'multiplicacao'), bloqueado: false },
      { materia: 'Divisão', precisaoPct: precisaoDe(idPerfil, 'divisao'), bloqueado: false },
      { materia: 'Comparação', precisaoPct: precisaoDe(idPerfil, 'comparacao'), bloqueado: false }
    ]
  });
});


// Histórico dos últimos 7 dias (respostas por dia) e das últimas sessões de jogo
app.get('/api/perfis/:id/historico', (req, res) => {
  const idPerfil = Number(req.params.id);

  const perfil = db.prepare('SELECT 1 FROM perfil_infantil WHERE id_perfil = ?').get(idPerfil);
  if (!perfil) {
    return res.status(404).json({ erro: 'Perfil não encontrado.' });
  }

  const linhas = db
    .prepare(`
      SELECT date(data, 'localtime') AS dia,
             COUNT(*) AS total,
             COALESCE(SUM(acertou), 0) AS acertos,
             COALESCE(SUM(pontos), 0) AS pontos
      FROM desafio
      WHERE id_perfil = ?
        AND date(data, 'localtime') >= date('now', 'localtime', '-6 days')
      GROUP BY dia
    `)
    .all(idPerfil);

  const porDia = new Map(linhas.map((l) => [l.dia, l]));

  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const chave =
      d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');

    const l = porDia.get(chave);
    dias.push({
      data: chave,
      total: l ? l.total : 0,
      acertos: l ? l.acertos : 0,
      pontos: l ? l.pontos : 0,
      precisaoPct: l && l.total ? Math.round((l.acertos / l.total) * 100) : null
    });
  }

  const sessoes = db
    .prepare(`
      SELECT data_inicio, tempo_utilizado_seg
      FROM registro_sessao
      WHERE id_perfil = ? AND tempo_utilizado_seg > 0
      ORDER BY id_sessao DESC
      LIMIT 5
    `)
    .all(idPerfil);

  res.json({
    dias,
    sessoes: sessoes.map((s) => ({
      inicio: s.data_inicio,
      tempoMin: Math.max(1, Math.round(s.tempo_utilizado_seg / 60))
    }))
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});