import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';
import { PerfilResumo } from './relatorio.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  constructor(private http: HttpClient) {}

  cadastrarCrianca(idResponsavel: number, nome: string): Observable<PerfilResumo> {
    return this.http.post<PerfilResumo>(`${API_URL}/responsaveis/${idResponsavel}/perfis`, { nome });
  }
}