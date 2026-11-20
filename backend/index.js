const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const db = require('./db');
const {
  criarToken,
  exigirLogin,
  apenasResponsavelDono,
  podeAcessarPerfil,
  acessoAoPerfil
} = require('./auth');
const {
  validarCadastroResponsavel,
  validarLoginResponsavel,
  validarNomeCrianca,
  validarDesafio,
  validarIdParam,
  validarNovaSessao,
  validarAtualizacaoSessao
} = require('./validacao');
const { calcularConquistas } = require('./conquistas');

const app = express();
app.use(cors({ origin: /^http:\/\/(localhost|127\.0\.0\.1):\d+$/ }));
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// Garante que a coluna codigo_familia existe na tabela responsavel
try {
  db.exec('ALTER TABLE responsavel ADD COLUMN codigo_familia TEXT');
} catch (_) {
  // Coluna já existe
}

const LIMITE_DIARIO_SEG = 40 * 60;

const acessoCriancaOuDono = acessoAoPerfil(db, false);
const acessoSoDono = acessoAoPerfil(db, true);

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

function criarCodigoUnico() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  while (true) {
    let cod = '';
    for (let i = 0; i < 6; i++) {
      cod += letras[Math.floor(Math.random() * letras.length)];
    }
    const existe = db.prepare('SELECT 1 FROM responsavel WHERE codigo_familia = ?').get(cod);
    if (!existe) return cod;
  }
}

function validarLoginCrianca(req, res, next) {
  const { nome, codigoFamilia } = req.body || {};

  if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
    return res.status(400).json({ erro: 'Informe o nome da criança.' });
  }

  if (!codigoFamilia || typeof codigoFamilia !== 'string' || !/^[A-Za-z0-9]{6}$/.test(codigoFamilia.trim())) {
    return res.status(400).json({ erro: 'Informe o Código da Família com 6 caracteres.' });
  }

  req.body.nome = nome.trim();
  req.body.codigoFamilia = codigoFamilia.trim().toUpperCase();
  next();
}

function precisaoDe(idPerfil, operacao) {
  const t = db
    .prepare('SELECT COUNT(*) AS total, COALESCE(SUM(acertou), 0) AS acertos FROM desafio WHERE id_perfil = ? AND operacao = ?')
    .get(idPerfil, operacao);
  return t.total ? Math.round((t.acertos / t.total) * 100) : null;
}

app.get('/', (req, res) => {
  res.send('Oi! v2 - O backend do EducaPlay está funcionando!');
});

// 1. Cadastro do Responsável (gera e devolve o codigoFamilia)
app.post('/api/responsaveis', (req, res) => {
  const { nome, email, senha, pin } = req.body || {};

  if (!nome || String(nome).trim().length < 2) {
    return res.status(400).json({ erro: 'Digite seu nome completo.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.status(400).json({ erro: 'Digite um e-mail válido.' });
  }
  if (!senha || String(senha).length < 6) {
    return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
  }
  if (!pin || !/^\d{4}$/.test(String(pin).trim())) {
    return res.status(400).json({ erro: 'O PIN deve conter exatamente 4 números.' });
  }

  const nomeLimpo = String(nome).trim();
  const emailLimpo = String(email).trim().toLowerCase();
  const senhaHash = bcrypt.hashSync(String(senha), 10);
  const pinHash = bcrypt.hashSync(String(pin).trim(), 10);
  const codigoFamilia = criarCodigoUnico();

  try {
    const resultado = db
      .prepare('INSERT INTO responsavel (nome, email, senha_hash, pin_seguranca, codigo_familia) VALUES (?, ?, ?, ?, ?)')
      .run(nomeLimpo, emailLimpo, senhaHash, pinHash, codigoFamilia);

    return res.status(201).json({
      idResponsavel: resultado.lastInsertRowid,
      nome: nomeLimpo,
      email: emailLimpo,
      codigoFamilia
    });
  } catch (erro) {
    console.error('Erro no cadastro de responsável:', erro);
    if (String(erro.message).includes('UNIQUE')) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }
    return res.status(500).json({ erro: 'Erro no banco: ' + erro.message });
  }
});

// 2. Login do Responsável (retorna também o codigoFamilia)
app.post('/api/responsaveis/login', (req, res) => {
  const { email, senha, pin } = req.body || {};

  if (!email || !senha || !pin) {
    return res.status(400).json({ erro: 'Preencha e-mail, senha e PIN de segurança.' });
  }

  const responsavel = db
    .prepare('SELECT * FROM responsavel WHERE lower(email) = ?')
    .get(String(email).trim().toLowerCase());

  const dadosCorretos =
    responsavel &&
    bcrypt.compareSync(String(senha), responsavel.senha_hash) &&
    bcrypt.compareSync(String(pin).trim(), responsavel.pin_seguranca);

  if (!dadosCorretos) {
    return res.status(401).json({ erro: 'E-mail, senha ou PIN incorretos.' });
  }

  let codigoFamilia = responsavel.codigo_familia;
  if (!codigoFamilia) {
    codigoFamilia = criarCodigoUnico();
    db.prepare('UPDATE responsavel SET codigo_familia = ? WHERE id_responsavel = ?')
      .run(codigoFamilia, responsavel.id_responsavel);
  }

  res.json({
    idResponsavel: responsavel.id_responsavel,
    nome: responsavel.nome,
    email: responsavel.email,
    codigoFamilia,
    token: criarToken('responsavel', responsavel.id_responsavel)
  });
});
// 3. Login Infantil por Nome + Código da Família
app.post('/api/perfis/entrar', validarLoginCrianca, (req, res) => {
  const { nome, codigoFamilia } = req.body;

  const responsavel = db
    .prepare('SELECT id_responsavel, nome FROM responsavel WHERE upper(codigo_familia) = ?')
    .get(codigoFamilia);

  if (!responsavel) {
    return res.status(404).json({ erro: 'Código da Família não encontrado. Peça ao seu responsável!' });
  }

  const perfil = db
    .prepare('SELECT * FROM perfil_infantil WHERE id_responsavel = ? AND lower(nome) = lower(?)')
    .get(responsavel.id_responsavel, nome);

  if (!perfil) {
    return res.status(404).json({
      erro: `Nenhuma criança chamada "${nome}" está cadastrada nesta família. Peça ao responsável para cadastrar primeiro.`
    });
  }

  res.json({
    idPerfil: perfil.id_perfil,
    nome: perfil.nome,
    faixaEtaria: perfil.faixa_etaria,
    saldoEstrelas: perfil.saldo_estrelas,
    token: criarToken('crianca', perfil.id_perfil)
  });
});

// 4. Sessões de tempo diário
app.post('/api/sessoes', exigirLogin, validarNovaSessao, (req, res) => {
  const { idPerfil } = req.body;

  const perfil = db
    .prepare('SELECT 1 FROM perfil_infantil WHERE id_perfil = ?')
    .get(idPerfil);

  if (!perfil) {
    return res.status(404).json({ erro: 'Perfil não encontrado.' });
  }

  if (!podeAcessarPerfil(db, req.usuario, idPerfil, false)) {
    return res.status(403).json({ erro: 'Você não tem acesso a esta criança.' });
  }

  if (tempoUsadoHoje(idPerfil, 0) >= LIMITE_DIARIO_SEG) {
    return res.status(403).json({ erro: 'Limite diário de 40 minutos atingido! Volte amanhã.' });
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

app.put('/api/sessoes/:id', validarIdParam, exigirLogin, validarAtualizacaoSessao, (req, res) => {
  const sessao = db
    .prepare('SELECT * FROM registro_sessao WHERE id_sessao = ?')
    .get(Number(req.params.id));

  if (!sessao) {
    return res.status(404).json({ erro: 'Sessão não encontrada.' });
  }

  if (!podeAcessarPerfil(db, req.usuario, sessao.id_perfil, false)) {
    return res.status(403).json({ erro: 'Você não tem acesso a esta sessão.' });
  }

  const enviado = Math.floor(Number(req.body.tempoUtilizadoSeg));
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

// 5. Desafios e progresso
app.post('/api/perfis/:id/desafios', validarIdParam, exigirLogin, acessoCriancaOuDono, validarDesafio, (req, res) => {
  const idPerfil = Number(req.params.id);
  const { operacao, acertou, pontos } = req.body;

  const perfil = db.prepare('SELECT 1 FROM perfil_infantil WHERE id_perfil = ?').get(idPerfil);
  if (!perfil) {
    return res.status(404).json({ erro: 'Perfil não encontrado.' });
  }

  if (tempoUsadoHoje(idPerfil, 0) >= LIMITE_DIARIO_SEG) {
    return res.status(403).json({ erro: 'Limite diário de 40 minutos atingido! Volte amanhã.' });
  }

  const ganho = acertou ? Math.max(0, Math.floor(Number(pontos) || 5)) : 0;
  garantirProgresso(idPerfil);

  const antes = new Set(
    calcularConquistas(db, idPerfil)
      .filter((m) => m.desbloqueada)
      .map((m) => m.id)
  );

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

  const novasMedalhas = calcularConquistas(db, idPerfil).filter(
    (m) => m.desbloqueada && !antes.has(m.id)
  );

  res.status(201).json({
    totalAcertos: progresso.total_acertos,
    pontuacaoTotal: progresso.pontuacao_total,
    nivel,
    novasMedalhas
  });
});

app.get('/api/perfis/:id/progresso', validarIdParam, exigirLogin, acessoCriancaOuDono, (req, res) => {
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

// 6. Gestão de perfis infantis pelo responsável
app.get('/api/responsaveis/:id/perfis', validarIdParam, exigirLogin, apenasResponsavelDono, (req, res) => {
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

app.post('/api/responsaveis/:id/perfis', validarIdParam, exigirLogin, apenasResponsavelDono, validarNomeCrianca, (req, res) => {
  const idResponsavel = Number(req.params.id);
  const { nome } = req.body;

  const responsavel = db
    .prepare('SELECT 1 FROM responsavel WHERE id_responsavel = ?')
    .get(idResponsavel);
  if (!responsavel) {
    return res.status(404).json({ erro: 'Responsável não encontrado.' });
  }

  const jaExiste = db
    .prepare('SELECT 1 FROM perfil_infantil WHERE id_responsavel = ? AND lower(nome) = lower(?)')
    .get(idResponsavel, nome);
  if (jaExiste) {
    return res.status(409).json({ erro: 'Você já cadastrou uma criança com esse nome.' });
  }

  const resultado = db
    .prepare('INSERT INTO perfil_infantil (id_responsavel, nome) VALUES (?, ?)')
    .run(idResponsavel, nome);

  const perfil = db
    .prepare('SELECT * FROM perfil_infantil WHERE id_perfil = ?')
    .get(resultado.lastInsertRowid);

  res.status(201).json({
    idPerfil: perfil.id_perfil,
    nome: perfil.nome,
    faixaEtaria: perfil.faixa_etaria,
    saldoEstrelas: perfil.saldo_estrelas
  });
});

app.delete('/api/responsaveis/:id/perfis/:idPerfil', validarIdParam, exigirLogin, apenasResponsavelDono, (req, res) => {
  const idResponsavel = Number(req.params.id);
  const idPerfil = Number(req.params.idPerfil);

  if (!Number.isInteger(idPerfil) || idPerfil <= 0) {
    return res.status(400).json({ erro: 'ID do perfil inválido.' });
  }

  try {
    const perfil = db
      .prepare('SELECT 1 FROM perfil_infantil WHERE id_perfil = ? AND id_responsavel = ?')
      .get(idPerfil, idResponsavel);

    if (!perfil) {
      return res.status(404).json({ erro: 'Criança não encontrada neste perfil.' });
    }

    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM desafio WHERE id_perfil = ?').run(idPerfil);
      db.prepare('DELETE FROM registro_sessao WHERE id_perfil = ?').run(idPerfil);
      db.prepare('DELETE FROM progresso_matematica WHERE id_perfil = ?').run(idPerfil);
      db.prepare('DELETE FROM perfil_infantil WHERE id_perfil = ?').run(idPerfil);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir perfil:', err);
    res.status(500).json({ erro: 'Erro interno no banco ao excluir: ' + err.message });
  }
});

// 7. Relatórios e histórico
app.get('/api/perfis/:id/relatorio', validarIdParam, exigirLogin, acessoSoDono, (req, res) => {
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
    ],
    conquistas: calcularConquistas(db, idPerfil)
  });
});

app.get('/api/perfis/:id/historico', validarIdParam, exigirLogin, acessoSoDono, (req, res) => {
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