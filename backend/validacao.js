const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OPERACOES_VALIDAS = ['adicao', 'subtracao', 'multiplicacao', 'divisao', 'comparacao'];

function textoLimpo(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function validarCadastroResponsavel(req, res, next) {
  const nome = textoLimpo(req.body?.nome);
  const email = textoLimpo(req.body?.email).toLowerCase();
  const senha = typeof req.body?.senha === 'string' ? req.body.senha : '';
  const pin = textoLimpo(req.body?.pin);

  if (nome.length < 2 || nome.length > 60) {
    return res.status(400).json({ erro: 'O nome deve ter entre 2 e 60 caracteres.' });
  }
  if (!EMAIL_REGEX.test(email) || email.length > 100) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  }
  if (senha.length < 6 || senha.length > 100) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }
  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ erro: 'O PIN deve ter exatamente 4 números.' });
  }

  req.body = { nome, email, senha, pin };
  next();
}

function validarLoginResponsavel(req, res, next) {
  const email = textoLimpo(req.body?.email).toLowerCase();
  const senha = typeof req.body?.senha === 'string' ? req.body.senha : '';
  const pin = textoLimpo(req.body?.pin);

  if (!email || !senha || !pin) {
    return res.status(400).json({ erro: 'Preencha e-mail, senha e PIN.' });
  }

  req.body = { email, senha, pin };
  next();
}

function validarNomeCrianca(req, res, next) {
  const nome = textoLimpo(req.body?.nome);
  if (nome.length < 2 || nome.length > 30) {
    return res.status(400).json({ erro: 'O nome da criança deve ter entre 2 e 30 caracteres.' });
  }
  req.body = { nome };
  next();
}

function validarDesafio(req, res, next) {
  const operacao = textoLimpo(req.body?.operacao);
  const acertou = Boolean(req.body?.acertou);
  const pontos = Number(req.body?.pontos ?? 5);

  if (!OPERACOES_VALIDAS.includes(operacao)) {
    return res.status(400).json({ erro: 'Operação matemática inválida.' });
  }
  if (!Number.isFinite(pontos) || pontos < 0 || pontos > 100) {
    return res.status(400).json({ erro: 'Pontuação inválida.' });
  }

  req.body = { operacao, acertou, pontos };
  next();
}

function validarIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: 'Identificador inválido.' });
  }
  next();
}

function validarNovaSessao(req, res, next) {
  const idPerfil = Number(req.body?.idPerfil);
  if (!Number.isInteger(idPerfil) || idPerfil <= 0) {
    return res.status(400).json({ erro: 'Perfil inválido.' });
  }
  req.body = { idPerfil };
  next();
}

function validarAtualizacaoSessao(req, res, next) {
  const tempoUtilizadoSeg = Number(req.body?.tempoUtilizadoSeg);
  if (!Number.isFinite(tempoUtilizadoSeg) || tempoUtilizadoSeg < 0) {
    return res.status(400).json({ erro: 'Tempo de sessão inválido.' });
  }
  req.body = { tempoUtilizadoSeg };
  next();
}

function validarLoginCrianca(req, res, next) {
  const nome = textoLimpo(req.body?.nome);
  const codigoFamilia = textoLimpo(req.body?.codigoFamilia).toUpperCase();

  if (nome.length < 2 || nome.length > 30) {
    return res.status(400).json({ erro: 'Informe o nome da criança (2 a 30 caracteres).' });
  }
  if (!/^[A-Z0-9]{4,10}$/.test(codigoFamilia)) {
    return res.status(400).json({ erro: 'Informe um Código da Família válido (ex.: EDUCA1).' });
  }

  req.body = { nome, codigoFamilia };
  next();
}

module.exports = {
  validarCadastroResponsavel,
  validarLoginResponsavel,
  validarNomeCrianca,
  validarDesafio,
  validarIdParam,
  validarNovaSessao,
  validarAtualizacaoSessao,
  validarLoginCrianca,
};
