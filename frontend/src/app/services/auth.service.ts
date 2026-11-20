import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Responsavel } from '../models/responsavel.model';
import { PerfilInfantil } from '../models/perfil-infantil.model';
import { API_URL } from './api.config';

const CHAVE_RESPONSAVEL = 'educaplay.responsavel';
const CHAVE_CRIANCA = 'educaplay.crianca';
const CHAVE_TOKEN = 'educaplay.token';
const CHAVE_CODIGO_FAMILIA = 'educaplay.codigo_familia';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private responsavelAtual: Responsavel | null = null;
  private perfilInfantilAtual: PerfilInfantil | null = null;

  constructor(private http: HttpClient) {
    this.responsavelAtual = this.ler<Responsavel>(CHAVE_RESPONSAVEL);

    const crianca = this.ler<PerfilInfantil>(CHAVE_CRIANCA);
    this.perfilInfantilAtual = crianca
      ? { ...crianca, dataNascimento: new Date(crianca.dataNascimento) }
      : null;
  }

  autenticarResponsavel(email: string, senha: string, pin: string): Observable<Responsavel> {
    return this.http
      .post<{ idResponsavel: number; nome: string; email: string; codigoFamilia?: string; token?: string }>(
        `${API_URL}/responsaveis/login`,
        { email, senha, pin }
      )
      .pipe(
        map((r) => {
          this.perfilInfantilAtual = null;
          this.guardar(CHAVE_CRIANCA, null);

          this.responsavelAtual = {
            idResponsavel: r.idResponsavel,
            nome: r.nome,
            email: r.email,
            senhaHash: '',
            pinSeguranca: ''
          };
          this.guardar(CHAVE_RESPONSAVEL, this.responsavelAtual);
          this.guardarToken(r.token);

          if (r.codigoFamilia) {
            sessionStorage.setItem(CHAVE_CODIGO_FAMILIA, r.codigoFamilia);
            localStorage.setItem('codigo_familia', r.codigoFamilia);
          }
          if (r.token) {
            localStorage.setItem('token_responsavel', r.token);
          }
          localStorage.setItem('id_responsavel', String(r.idResponsavel));
          localStorage.setItem('nome_responsavel', r.nome);

          return this.responsavelAtual;
        })
      );
  }

  entrarComoCrianca(nome: string, codigoFamilia: string): Observable<PerfilInfantil> {
    return this.http
      .post<{ idPerfil: number; nome: string; faixaEtaria: string; saldoEstrelas: number; token?: string }>(
        `${API_URL}/perfis/entrar`,
        { nome, codigoFamilia }
      )
      .pipe(
        map((p) => {
          this.responsavelAtual = null;
          this.guardar(CHAVE_RESPONSAVEL, null);

          this.perfilInfantilAtual = {
            idPerfil: p.idPerfil,
            nome: p.nome,
            dataNascimento: new Date(),
            faixaEtaria: p.faixaEtaria,
            saldoEstrelas: p.saldoEstrelas
          };
          this.guardar(CHAVE_CRIANCA, this.perfilInfantilAtual);
          this.guardarToken(p.token);
          return this.perfilInfantilAtual;
        })
      );
  }

  getCodigoFamilia(): string {
    return (
      sessionStorage.getItem(CHAVE_CODIGO_FAMILIA) ||
      localStorage.getItem('codigo_familia') ||
      ''
    );
  }

  getPerfilInfantilAtual(): PerfilInfantil | null {
    return this.perfilInfantilAtual;
  }

  getResponsavelAtual(): Responsavel | null {
    return this.responsavelAtual;
  }

  sair(): void {
    this.responsavelAtual = null;
    this.perfilInfantilAtual = null;
    this.guardar(CHAVE_RESPONSAVEL, null);
    this.guardar(CHAVE_CRIANCA, null);
    this.guardarToken(undefined);
    sessionStorage.removeItem(CHAVE_CODIGO_FAMILIA);
    localStorage.removeItem('token_responsavel');
  }

  private ler<T>(chave: string): T | null {
    try {
      const texto = sessionStorage.getItem(chave);
      return texto ? (JSON.parse(texto) as T) : null;
    } catch {
      return null;
    }
  }

  private guardar(chave: string, valor: unknown): void {
    try {
      if (valor === null) {
        sessionStorage.removeItem(chave);
      } else {
        sessionStorage.setItem(chave, JSON.stringify(valor));
      }
    } catch {}
  }

  private guardarToken(token: string | undefined): void {
    try {
      if (token) {
        sessionStorage.setItem(CHAVE_TOKEN, token);
      } else {
        sessionStorage.removeItem(CHAVE_TOKEN);
      }
    } catch {}
  }
}