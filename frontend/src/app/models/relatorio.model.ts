export interface DesempenhoMateria {
  materia: string;
  precisaoPct: number | null;
  bloqueado: boolean;
}

export interface Relatorio {
  nome: string;
  nivel: number;
  tituloNivel: string;
  estrelas: number;
  progressoNivelPct: number;
  tempoHojeMin: number;
  limiteDiarioMin: number;
  dentroDoLimite: boolean;
  desempenho: DesempenhoMateria[];
}
