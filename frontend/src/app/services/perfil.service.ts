import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfilResumo } from './relatorio.service';
import { API_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  constructor(private http: HttpClient) {}

  private cabecalhos(): { headers: HttpHeaders } {
    const token =
      sessionStorage.getItem('educaplay.token') ||
      localStorage.getItem('token_responsavel') ||
      '';

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  listarCriancas(idResponsavel: number): Observable<PerfilResumo[]> {
    return this.http.get<PerfilResumo[]>(
      `${API_URL}/responsaveis/${idResponsavel}/perfis`,
      this.cabecalhos()
    );
  }

  cadastrarCrianca(idResponsavel: number, nome: string): Observable<PerfilResumo> {
    return this.http.post<PerfilResumo>(
      `${API_URL}/responsaveis/${idResponsavel}/perfis`,
      { nome },
      this.cabecalhos()
    );
  }

  excluirCrianca(idResponsavel: number, idPerfil: number): Observable<void> {
    return this.http.delete<void>(
      `${API_URL}/responsaveis/${idResponsavel}/perfis/${idPerfil}`,
      this.cabecalhos()
    );
  }
}