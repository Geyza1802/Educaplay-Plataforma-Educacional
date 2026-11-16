import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegistroSessao } from '../models/registro-sessao.model';
import { AuthService } from './auth.service';
import { API_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class SessaoService {
  private sessaoAtiva: RegistroSessao | null = null;
  private timer: any = null;
  private usadoHojeSeg = 0; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  iniciarSessao(): void {
    this.pararSessao();
    this.usadoHojeSeg = 0;

  
    const sessao: RegistroSessao = {
      idSessao: 0,
      dataInicio: new Date(),
      tempoUtilizadoSeg: 0,
      bloqueouPorTimer: false
    };
    this.sessaoAtiva = sessao;

    const perfil = this.authService.getPerfilInfantilAtual();
    if (perfil) {
      this.http.post<{ idSessao: number }>(`${API_URL}/sessoes`, { idPerfil: perfil.idPerfil }).subscribe({
        next: r => { sessao.idSessao = r.idSessao; },
        error: e => console.error('Não foi possível registrar a sessão no servidor.', e)
      });
    }

    this.timer = setInterval(() => {
      sessao.tempoUtilizadoSeg++;
      if (sessao.tempoUtilizadoSeg % 10 === 0) {
        this.sincronizar(); 
      }
    }, 1000);
  }

 
  verificarLimite(limiteSegundos: number): boolean {
    const sessao = this.sessaoAtiva;
    if (!sessao) {
      return false;
    }
    const totalHoje = Math.max(this.usadoHojeSeg, sessao.tempoUtilizadoSeg);
    if (totalHoje >= limiteSegundos) {
      sessao.bloqueouPorTimer = true;
      this.pararSessao();
      return true;
    }
    return false;
  }

  pararSessao(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.sincronizar(); 
    }
  }

  getSessao(): RegistroSessao | null {
    return this.sessaoAtiva;
  }

  private sincronizar(): void {
    const sessao = this.sessaoAtiva;
    if (!sessao || !sessao.idSessao) {
      return;
    }
    this.http
      .put<{ usadoHojeSeg: number; bloqueouPorTimer: boolean }>(
        `${API_URL}/sessoes/${sessao.idSessao}`,
        { tempoUtilizadoSeg: sessao.tempoUtilizadoSeg })
      .subscribe({
        next: r => {
          this.usadoHojeSeg = r.usadoHojeSeg;
          sessao.bloqueouPorTimer = r.bloqueouPorTimer;
        },
        error: e => console.error('Falha ao salvar o tempo da sessão.', e)
      });
  }
}