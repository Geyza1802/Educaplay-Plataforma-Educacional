function calcularConquistas(db, idPerfil) {
  const perfil = db
    .prepare('SELECT saldo_estrelas FROM perfil_infantil WHERE id_perfil = ?')
    .get(idPerfil);

  const stats = db
    .prepare(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(acertou), 0) AS acertos,
        COUNT(DISTINCT operacao) AS materias,
        COUNT(DISTINCT date(data, 'localtime')) AS dias_ativos
      FROM desafio
      WHERE id_perfil = ?
    `)
    .get(idPerfil);

  const acertosPorOp = db
    .prepare(`
      SELECT operacao, COALESCE(SUM(acertou), 0) AS acertos
      FROM desafio
      WHERE id_perfil = ?
      GROUP BY operacao
    `)
    .all(idPerfil);

  const mapaOp = new Map(acertosPorOp.map((r) => [r.operacao, r.acertos]));
  const estrelas = perfil ? perfil.saldo_estrelas : 0;

  return [
    {
      id: 'primeiro_passo',
      titulo: 'Primeiro Passo',
      descricao: 'Acertou o primeiro desafio matemático',
      icone: '🌟',
      desbloqueada: stats.acertos >= 1
    },
    {
      id: 'dez_acertos',
      titulo: 'Mente Brilhante',
      descricao: 'Acertou 10 desafios no total',
      icone: '🧠',
      desbloqueada: stats.acertos >= 10
    },
    {
      id: 'vinte_cinco_acertos',
      titulo: 'Gênio em Treinamento',
      descricao: 'Acertou 25 desafios no total',
      icone: '🎓',
      desbloqueada: stats.acertos >= 25
    },
    {
      id: 'cinquenta_acertos',
      titulo: 'Lenda da Matemática',
      descricao: 'Acertou 50 desafios no total',
      icone: '👑',
      desbloqueada: stats.acertos >= 50
    },
    {
      id: 'cinquenta_estrelas',
      titulo: 'Colecionador de Estrelas',
      descricao: 'Acumulou 50 estrelas ou mais',
      icone: '⭐',
      desbloqueada: estrelas >= 50
    },
    {
      id: 'cem_estrelas',
      titulo: 'Super Estrela',
      descricao: 'Acumulou 100 estrelas ou mais',
      icone: '🏆',
      desbloqueada: estrelas >= 100
    },
    {
      id: 'duzentas_estrelas',
      titulo: 'Galáxia de Estrelas',
      descricao: 'Acumulou 200 estrelas ou mais',
      icone: '🌌',
      desbloqueada: estrelas >= 200
    },
    {
      id: 'explorador',
      titulo: 'Explorador Matemático',
      descricao: 'Praticou pelo menos 3 operações diferentes',
      icone: '🧭',
      desbloqueada: stats.materias >= 3
    },
    {
      id: 'polivalente',
      titulo: 'Mestre Completo',
      descricao: 'Praticou todas as 5 operações do jogo',
      icone: '🌈',
      desbloqueada: stats.materias >= 5
    },
    {
      id: 'rei_soma',
      titulo: 'Craque da Adição',
      descricao: 'Acertou 5 desafios de adição',
      icone: '➕',
      desbloqueada: (mapaOp.get('adicao') || 0) >= 5
    },
    {
      id: 'mestre_subtracao',
      titulo: 'As da Subtração',
      descricao: 'Acertou 5 desafios de subtração',
      icone: '➖',
      desbloqueada: (mapaOp.get('subtracao') || 0) >= 5
    },
    {
      id: 'mestre_tabuada',
      titulo: 'Mestre da Tabuada',
      descricao: 'Acertou 5 desafios de multiplicação',
      icone: '✖️',
      desbloqueada: (mapaOp.get('multiplicacao') || 0) >= 5
    },
    {
      id: 'expert_divisao',
      titulo: 'Expert em Divisão',
      descricao: 'Acertou 5 desafios de divisão',
      icone: '➗',
      desbloqueada: (mapaOp.get('divisao') || 0) >= 5
    },
    {
      id: 'olho_aguia',
      titulo: 'Olho de Águia',
      descricao: 'Acertou 5 desafios de comparação',
      icone: '🦅',
      desbloqueada: (mapaOp.get('comparacao') || 0) >= 5
    },
    {
      id: 'dedicado',
      titulo: 'Super Dedicado',
      descricao: 'Respondeu 30 desafios ao todo',
      icone: '🚀',
      desbloqueada: stats.total >= 30
    },
    {
      id: 'constancia',
      titulo: 'Estudante Fiel',
      descricao: 'Jogou em 3 dias diferentes',
      icone: '📅',
      desbloqueada: stats.dias_ativos >= 3
    }
  ];
}

module.exports = { calcularConquistas };