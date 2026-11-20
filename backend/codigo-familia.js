// Adicione logo após a criação da tabela responsavel no seu db.js:
try {
  db.exec('ALTER TABLE responsavel ADD COLUMN codigo_familia TEXT');
} catch (_) {
  // Coluna já existe
}

db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_responsavel_codigo ON responsavel(codigo_familia)');

function gerarCodigoFamilia() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += letras[Math.floor(Math.random() * letras.length)];
  }
  return codigo;
}

// Preenche código para responsáveis existentes (incluindo o teste@educaplay.com)
const semCodigo = db.prepare('SELECT id_responsavel, email FROM responsavel WHERE codigo_familia IS NULL OR codigo_familia = ""').all();
for (const r of semCodigo) {
  const cod = r.email === 'teste@educaplay.com' ? 'EDUCA1' : gerarCodigoFamilia();
  db.prepare('UPDATE responsavel SET codigo_familia = ? WHERE id_responsavel = ?').run(cod, r.id_responsavel);
}