import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';

export interface DiaHistorico {
  data: string;
  total: number;
  acertos: number;
  pontos: number;
  precisaoPct: number | null;
}

export interface SessaoHistorico {
  inicio: string;
  tempoMin: number;
}

export interface Historico {
  dias: DiaHistorico[];
  sessoes: SessaoHistorico[];
}

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  constructor(private http: HttpClient) {}

  buscarHistorico(idPerfil: number): Observable<Historico> {
    return this.http.get<Historico>(`${API_URL}/perfis/${idPerfil}/historico`);
  }
}