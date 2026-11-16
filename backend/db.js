
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('educaplay.db');
const bcrypt = require('bcryptjs');
db.exec(`
  CREATE TABLE IF NOT EXISTS responsavel (
    id_responsavel INTEGER PRIMARY KEY AUTOINCREMENT,
    nome           TEXT NOT NULL,
    email          TEXT NOT NULL UNIQUE,
    senha_hash     TEXT NOT NULL,
    pin_seguranca  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS perfil_infantil (
    id_perfil       INTEGER PRIMARY KEY AUTOINCREMENT,
    id_responsavel  INTEGER REFERENCES responsavel(id_responsavel),
    nome            TEXT NOT NULL,
    data_nascimento TEXT,
    faixa_etaria    TEXT NOT NULL DEFAULT '6-8 anos',
    saldo_estrelas  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS registro_sessao (
    id_sessao           INTEGER PRIMARY KEY AUTOINCREMENT,
    id_perfil           INTEGER NOT NULL REFERENCES perfil_infantil(id_perfil),
    data_inicio         TEXT NOT NULL,
    tempo_utilizado_seg INTEGER NOT NULL DEFAULT 0,
    bloqueou_por_timer  INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS progresso_matematica (
    id_progresso      INTEGER PRIMARY KEY AUTOINCREMENT,
    id_perfil         INTEGER NOT NULL UNIQUE REFERENCES perfil_infantil(id_perfil),
    nivel_dificuldade TEXT NOT NULL DEFAULT 'Fácil',
    operacao_atual    TEXT NOT NULL DEFAULT 'adicao',
    total_acertos     INTEGER NOT NULL DEFAULT 0,
    pontuacao_total   INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS desafio (
    id_desafio INTEGER PRIMARY KEY AUTOINCREMENT,
    id_perfil  INTEGER NOT NULL REFERENCES perfil_infantil(id_perfil),
    operacao   TEXT NOT NULL,
    acertou    INTEGER NOT NULL,
    pontos     INTEGER NOT NULL DEFAULT 0,
    data       TEXT NOT NULL
  );
`);

const quantos = db.prepare('SELECT COUNT(*) AS total FROM responsavel').get().total;
if (quantos === 0) {
  db.prepare('INSERT INTO responsavel (nome, email, senha_hash, pin_seguranca) VALUES (?, ?, ?, ?)')
    .run('Responsável Demo', 'responsavel@email.com', bcrypt.hashSync('12345678', 10), bcrypt.hashSync('1234', 10));
}

module.exports = db;