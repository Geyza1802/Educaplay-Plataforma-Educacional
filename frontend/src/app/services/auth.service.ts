import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Responsavel } from '../models/responsavel.model';
import { PerfilInfantil } from '../models/perfil-infantil.model';
import { API_URL } from './api.config';

const CHAVE_RESPONSAVEL = 'educaplay.responsavel';
const CHAVE_CRIANCA = 'educaplay.crianca';
const CHAVE_TOKEN = 'educaplay.token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private responsavelAtual: Responsavel | null = null;
  private perfilInfantilAtual: PerfilInfantil | null = null;

  constructor(private http: HttpClient) {
    // ao recarregar a página (F5), recupera quem estava logado
    this.responsavelAtual = this.ler<Responsavel>(CHAVE_RESPONSAVEL);

    const crianca = this.ler<PerfilInfantil>(CHAVE_CRIANCA);
    this.perfilInfantilAtual = crianca
      ? { ...crianca, dataNascimento: new Date(crianca.dataNascimento) }
      : null;
  }

  autenticarResponsavel(email: string, senha: string, pin: string): Observable<Responsavel> {
    return this.http
      .post<{ idResponsavel: number; nome: string; email: string; token?: string }>(
        `${API_URL}/responsaveis/login`, { email, senha, pin })
      .pipe(
        map(r => {
          // quem entra como responsável deixa de ser "criança" nesta aba
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
          return this.responsavelAtual;
        })
      );
  }

  entrarComoCrianca(nome: string): Observable<PerfilInfantil> {
    return this.http
      .post<{ idPerfil: number; nome: string; faixaEtaria: string; saldoEstrelas: number; token?: string }>(
        `${API_URL}/perfis/entrar`, { nome })
      .pipe(
        map(p => {
          // quem entra como criança perde o acesso de responsável nesta aba
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
    } catch {
      // se o navegador não permitir guardar, o login só vale até recarregar a página
    }
  }

  private guardarToken(token: string | undefined): void {
    try {
      if (token) {
        sessionStorage.setItem(CHAVE_TOKEN, token);
      } else {
        sessionStorage.removeItem(CHAVE_TOKEN);
      }
    } catch {
      // sem armazenamento, o crachá vale só até recarregar a página
    }
  }
}