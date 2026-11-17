import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';
import { Relatorio } from '../models/relatorio.model';

export interface PerfilResumo {
  idPerfil: number;
  nome: string;
  faixaEtaria: string;
  saldoEstrelas: number;
}

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  constructor(private http: HttpClient) {}

  listarPerfis(idResponsavel: number): Observable<PerfilResumo[]> {
    return this.http.get<PerfilResumo[]>(`${API_URL}/responsaveis/${idResponsavel}/perfis`);
  }

  buscarRelatorio(idPerfil: number): Observable<Relatorio> {
    return this.http.get<Relatorio>(`${API_URL}/perfis/${idPerfil}/relatorio`);
  }
}
