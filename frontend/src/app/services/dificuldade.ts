export type OperacaoDificil = 'adicao' | 'subtracao' | 'multiplicacao' | 'divisao';

export interface Limites {
  primeiro: [number, number];
  segundo: [number, number];
}

export function limitesDe(operacao: OperacaoDificil, nivel: number): Limites {
  const faixa = nivel <= 2 ? 0 : nivel <= 5 ? 1 : 2;

  const tabela: Record<OperacaoDificil, Limites[]> = {
    adicao: [
      { primeiro: [1, 9], segundo: [1, 9] },
      { primeiro: [5, 20], segundo: [5, 20] },
      { primeiro: [10, 50], segundo: [10, 50] }
    ],
    subtracao: [
      { primeiro: [3, 15], segundo: [1, 1] },
      { primeiro: [10, 30], segundo: [1, 1] },
      { primeiro: [20, 60], segundo: [1, 1] }
    ],
    multiplicacao: [
      { primeiro: [2, 5], segundo: [2, 5] },
      { primeiro: [2, 9], segundo: [2, 9] },
      { primeiro: [5, 10], segundo: [5, 10] }
    ],
    divisao: [
      { primeiro: [2, 5], segundo: [2, 5] },
      { primeiro: [2, 9], segundo: [2, 9] },
      { primeiro: [2, 10], segundo: [5, 10] }
    ]
  };

  return tabela[operacao][faixa];
}

export function nomeDoNivel(nivel: number): string {
  return nivel <= 2 ? 'Fácil' : nivel <= 5 ? 'Médio' : 'Difícil';
}