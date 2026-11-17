const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ARQUIVO_SEGREDO = path.join(__dirname, '.segredo-token');
const VALIDADE_MS = 8 * 60 * 60 * 1000; // o crachá vale por 8 horas

// O segredo assina os crachás. Fica guardado em um arquivo local para que
// reiniciar o backend não desconecte todo mundo.
function carregarSegredo() {
  if (process.env.EDUCAPLAY_SEGREDO) {
    return process.env.EDUCAPLAY_SEGREDO;
  }
  try {
    if (fs.existsSync(ARQUIVO_SEGREDO)) {
      const existente = fs.readFileSync(ARQUIVO_SEGREDO, 'utf8').trim();
      if (existente.length >= 32) {
        return existente;
      }
    }
  } catch {
    // se não conseguir ler, cria um novo abaixo
  }
  const novo = crypto.randomBytes(48).toString('hex');
  try {
    fs.writeFileSync(ARQUIVO_SEGREDO, novo, 'utf8');
  } catch {
    // sem permissão para gravar: o segredo vale só até reiniciar o backend
  }
  return novo;
}

const SEGREDO = carregarSegredo();

function assinar(texto) {
  return crypto.createHmac('sha256', SEGREDO).update(texto).digest('base64url');
}

function criarToken(tipo, id) {
  const dados = Buffer.from(
    JSON.stringify({ tipo, id: Number(id), exp: Date.now() + VALIDADE_MS })
  ).toString('base64url');
  return dados + '.' + assinar(dados);
}

function verificarToken(token) {
  if (typeof token !== 'string') {
    return null;
  }

  const partes = token.split('.');
  if (partes.length !== 2) {
    return null;
  }

  const [dados, assinatura] = partes;
  const esperada = assinar(dados);

  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const conteudo = JSON.parse(Buffer.from(dados, 'base64url').toString('utf8'));
    if (!conteudo.exp || conteudo.exp < Date.now()) {
      return null;
    }
    if (conteudo.tipo !== 'responsavel' && conteudo.tipo !== 'crianca') {
      return null;
    }
    return conteudo;
  } catch {
    return null;
  }
}

// Exige que o pedido venha com um crachá válido
function exigirLogin(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : '';
  const usuario = verificarToken(token);

  if (!usuario) {
    return res.status(401).json({ erro: 'Faça login para continuar.' });
  }

  req.usuario = usuario;
  next();
}

// Responsável acessando os dados dele mesmo (rota com o id do responsável)
function apenasResponsavelDono(req, res, next) {
  const u = req.usuario;
  if (u.tipo === 'responsavel' && u.id === Number(req.params.id)) {
    return next();
  }
  res.status(403).json({ erro: 'Você não tem acesso a estes dados.' });
}

// A criança só acessa o próprio perfil; o responsável, os perfis das crianças dele
function podeAcessarPerfil(db, usuario, idPerfil, somenteResponsavel) {
  if (usuario.tipo === 'crianca') {
    return !somenteResponsavel && usuario.id === idPerfil;
  }
  if (usuario.tipo === 'responsavel') {
    const perfil = db
      .prepare('SELECT id_responsavel FROM perfil_infantil WHERE id_perfil = ?')
      .get(idPerfil);
    return !!perfil && perfil.id_responsavel === usuario.id;
  }
  return false;
}

function acessoAoPerfil(db, somenteResponsavel) {
  return (req, res, next) => {
    if (podeAcessarPerfil(db, req.usuario, Number(req.params.id), somenteResponsavel)) {
      return next();
    }
    res.status(403).json({ erro: 'Você não tem acesso a esta criança.' });
  };
}

module.exports = {
  criarToken,
  exigirLogin,
  apenasResponsavelDono,
  podeAcessarPerfil,
  acessoAoPerfil
};