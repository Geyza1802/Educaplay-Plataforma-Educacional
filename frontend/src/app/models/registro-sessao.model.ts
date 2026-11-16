export interface RegistroSessao {
  idSessao: number;
  dataInicio: Date;
  tempoUtilizadoSeg: number;
  bloqueouPorTimer: boolean;
}