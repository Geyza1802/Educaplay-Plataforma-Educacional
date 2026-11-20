import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { PerfilResumo } from '../services/relatorio.service';
import { PerfilService } from '../services/perfil.service';

@Component({
  selector: 'app-minhas-criancas',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="session-container">
      <div class="profile-card-wrapper criancas-card">

        <h2>Minhas crianças 👧👦</h2>
        <p class="chamada">Olá, {{ nomeResponsavel }}! Cadastre as crianças e acompanhe cada uma.</p>

        @if (codigoFamilia) {
          <div class="codigo-box">
            <span class="codigo-label">🔑 Código da Família (para as crianças entrarem nos jogos)</span>
            <div class="codigo-linha">
              <strong class="codigo-valor">{{ codigoFamilia }}</strong>
              <button type="button" class="btn-copiar" (click)="copiarCodigo()">
                {{ copiado() ? '✅ Copiado!' : '📋 Copiar' }}
              </button>
            </div>
          </div>
        }

        <div class="cadastro">
          <label for="nomeCrianca">Nome da criança</label>
          <input
            id="nomeCrianca"
            type="text"
            maxlength="30"
            placeholder="Ex.: Lucas"
            [(ngModel)]="nome"
            (keyup.enter)="cadastrar()">
          <button type="button" class="btn-painel" (click)="cadastrar()">➕ Cadastrar criança</button>

          @if (erro()) {
            <p class="erro">{{ erro() }}</p>
          }
          @if (sucesso()) {
            <p class="sucesso">{{ sucesso() }}</p>
          }
        </div>

        <h3 class="subtitulo">Crianças cadastradas</h3>

        @if (carregando()) {
          <p>Carregando...</p>
        } @else if (perfis().length === 0) {
          <p class="vazio">Nenhuma criança ainda. Cadastre a primeira acima! 🌱</p>
        } @else {
          <ul class="lista">
            @for (p of perfis(); track p.idPerfil) {
              <li class="crianca">
                <div class="info">
                  <span class="nome">{{ p.nome }}</span>
                  <span class="estrelas">⭐ {{ p.saldoEstrelas }} estrelas</span>
                </div>
                <div class="acoes">
                  <a
                    class="btn-back-pill ver"
                    routerLink="/registro-sessao"
                    [queryParams]="{ crianca: p.idPerfil }">📊 Ver relatório</a>
                  <button
                    type="button"
                    class="btn-excluir"
                    title="Excluir criança"
                    (click)="excluir(p)">🗑️</button>
                </div>
              </li>
            }
          </ul>
        }

        <div class="back-container">
          <button type="button" class="btn-back-pill" (click)="sair()">← Sair</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .criancas-card {
      max-width: 560px;
    }

    .chamada {
      margin: 4px 0 14px 0;
    }

    .codigo-box {
      background: #eef5ff;
      border: 2px dashed #4a8df8;
      border-radius: 18px;
      padding: 12px 16px;
      margin-bottom: 18px;
      text-align: center;
    }

    .codigo-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: #0a4da8;
      margin-bottom: 6px;
    }

    .codigo-linha {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .codigo-valor {
      font-size: 1.55rem;
      letter-spacing: 4px;
      color: #1d4ed8;
      background: #ffffff;
      padding: 4px 14px;
      border-radius: 12px;
      border: 1px solid #cfe0ff;
    }

    .btn-copiar {
      background: #ffffff;
      border: 2px solid #9ec2ff;
      color: #0a4da8;
      border-radius: 999px;
      padding: 6px 14px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-copiar:hover {
      background: #dceaff;
    }

    .cadastro {
      text-align: left;
    }

    .cadastro label {
      font-weight: 700;
      color: #0a4da8;
      font-size: 0.9rem;
    }

    .subtitulo {
      margin: 24px 0 8px 0;
    }

    .erro {
      color: #c0392b;
      font-weight: 700;
      margin: 8px 0 0 0;
    }

    .sucesso {
      color: #0a8a5a;
      font-weight: 700;
      margin: 8px 0 0 0;
    }

    .vazio {
      margin: 12px 0;
    }

    .lista {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .crianca {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      padding: 12px 14px;
      margin-bottom: 10px;
      background: #f4fbff;
      border: 2px solid #cfeef7;
      border-radius: 18px;
    }

    .info {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .nome {
      font-weight: 700;
      font-size: 1.1rem;
      color: #0a4da8;
    }

    .estrelas {
      font-size: 0.85rem;
    }

    .acoes {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ver {
      margin-top: 0 !important;
    }

    .btn-excluir {
      background: #ffeaf2;
      border: 2px solid #ffb6ce;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-excluir:hover {
      background: #ffd1e2;
      transform: scale(1.08);
    }
  `]
})
export class MinhasCriancasComponent implements OnInit {
  nome = '';
  nomeResponsavel = '';
  codigoFamilia = '';

  perfis = signal<PerfilResumo[]>([]);
  carregando = signal(true);
  erro = signal('');
  sucesso = signal('');
  copiado = signal(false);

  private idResponsavel = 0;

  constructor(
    private authService: AuthService,
    private perfilService: PerfilService,
    private router: Router
  ) {}

  ngOnInit() {
    const responsavel = this.authService.getResponsavelAtual();
    if (!responsavel) {
      this.router.navigate(['/login-responsavel']);
      return;
    }
    this.idResponsavel = responsavel.idResponsavel;
    this.nomeResponsavel = responsavel.nome;
    this.codigoFamilia = this.authService.getCodigoFamilia();
    this.carregarLista();
  }

  copiarCodigo() {
    if (!this.codigoFamilia) return;
    navigator.clipboard?.writeText(this.codigoFamilia);
    this.copiado.set(true);
    setTimeout(() => this.copiado.set(false), 2000);
  }

  private carregarLista() {
    this.perfilService.listarCriancas(this.idResponsavel).subscribe({
      next: lista => {
        this.perfis.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não consegui carregar as crianças. Faça login novamente.');
        this.carregando.set(false);
      }
    });
  }

  cadastrar() {
    this.erro.set('');
    this.sucesso.set('');

    const nomeLimpo = this.nome.trim();
    if (!nomeLimpo) {
      this.erro.set('Escreva o nome da criança.');
      return;
    }

    this.perfilService.cadastrarCrianca(this.idResponsavel, nomeLimpo).subscribe({
      next: nova => {
        this.perfis.update(lista => [...lista, nova]);
        this.sucesso.set(nova.nome + ' foi cadastrado(a)! 🎉');
        this.nome = '';
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 0) {
          this.erro.set('Não consegui falar com o servidor. Verifique se o backend está ligado.');
        } else {
          this.erro.set(e.error?.erro ?? 'Não foi possível cadastrar. Tente de novo.');
        }
      }
    });
  }

  excluir(crianca: PerfilResumo) {
    this.erro.set('');
    this.sucesso.set('');

    const confirmou = window.confirm(`Tem certeza que deseja excluir o perfil de ${crianca.nome}? Todo o progresso e estrelas serão apagados.`);
    if (!confirmou) {
      return;
    }

    this.perfilService.excluirCrianca(this.idResponsavel, crianca.idPerfil).subscribe({
      next: () => {
        this.perfis.update(lista => lista.filter(p => p.idPerfil !== crianca.idPerfil));
        this.sucesso.set(`${crianca.nome} foi removido(a).`);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 0) {
          this.erro.set('Servidor offline. Verifique se o backend está ligado.');
        } else if (e.status === 404 && !e.error?.erro) {
          this.erro.set('Rota DELETE não encontrada. Reinicie o servidor do backend.');
        } else {
          this.erro.set(e.error?.erro ?? `Erro (${e.status}) ao excluir esta criança.`);
        }
      }
    });
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/selecao-perfil']);
  }
}