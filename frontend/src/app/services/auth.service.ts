import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Responsavel } from '../models/responsavel.model';
import { PerfilInfantil } from '../models/perfil-infantil.model';
import { API_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private responsavelAtual: Responsavel | null = null;
  private perfilInfantilAtual: PerfilInfantil | null = null;

  constructor(private http: HttpClient) {}

  autenticarResponsavel(email: string, senha: string, pin: string): Observable<Responsavel> {
    return this.http
      .post<{ idResponsavel: number; nome: string; email: string }>(
        `${API_URL}/responsaveis/login`, { email, senha, pin })
      .pipe(
        map(r => {
          this.responsavelAtual = {
            idResponsavel: r.idResponsavel,
            nome: r.nome,
            email: r.email,
            senhaHash: '',     
            pinSeguranca: ''
          };
          return this.responsavelAtual;
        })
      );
  }


  entrarComoCrianca(nome: string): Observable<PerfilInfantil> {
    return this.http
      .post<{ idPerfil: number; nome: string; faixaEtaria: string; saldoEstrelas: number }>(
        `${API_URL}/perfis/entrar`, { nome })
      .pipe(
        map(p => {
          this.perfilInfantilAtual = {
            idPerfil: p.idPerfil,
            nome: p.nome,
            dataNascimento: new Date(), 
            faixaEtaria: p.faixaEtaria,
            saldoEstrelas: p.saldoEstrelas
          };
          return this.perfilInfantilAtual;
        })
      );
  }

  getPerfilInfantilAtual(): PerfilInfantil | null {
    return this.perfilInfantilAtual;
  }

  getResponsavelAtual(): Responsavel | null {
    return this.responsavelAtual;
  }
}