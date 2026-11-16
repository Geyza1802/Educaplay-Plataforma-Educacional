import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';

export interface ResultadoDesafio {
  totalAcertos: number;
  pontuacaoTotal: number;
  nivel: number;
}

export interface ProgressoPerfil {
  nivel: number;
  nivelDificuldade: string;
  totalAcertos: number;
  pontuacaoTotal: number;
  precisao: number;
}

@Injectable({
  providedIn: 'root'
})
export class DesafioService {
  constructor(private http: HttpClient) {}

  registrarDesafio(
    idPerfil: number,
    operacao: string,
    acertou: boolean,
    pontos: number
  ): Observable<ResultadoDesafio> {
    return this.http.post<ResultadoDesafio>(`${API_URL}/perfis/${idPerfil}/desafios`, {
      operacao,
      acertou,
      pontos
    });
  }

  buscarProgresso(idPerfil: number): Observable<ProgressoPerfil> {
    return this.http.get<ProgressoPerfil>(`${API_URL}/perfis/${idPerfil}/progresso`);
  }
}