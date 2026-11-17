import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { RelatorioService, PerfilResumo } from '../services/relatorio.service';
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
                <a
                  class="btn-back-pill ver"
                  routerLink="/registro-sessao"
                  [queryParams]="{ crianca: p.idPerfil }">📊 Ver relatório</a>
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
      margin: 4px 0 18px 0;
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

    .ver {
      margin-top: 0 !important;
    }
  `]
})
export class MinhasCriancasComponent implements OnInit {
  nome = '';
  nomeResponsavel = '';

  perfis = signal<PerfilResumo[]>([]);
  carregando = signal(true);
  erro = signal('');
  sucesso = signal('');

  private idResponsavel = 0;

  constructor(
    private authService: AuthService,
    private relatorioService: RelatorioService,
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
    this.carregarLista();
  }

  private carregarLista() {
    this.relatorioService.listarPerfis(this.idResponsavel).subscribe({
      next: lista => {
        this.perfis.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não consegui carregar as crianças. Verifique se o backend está ligado.');
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

  sair() {
    this.authService.sair();
    this.router.navigate(['/selecao-perfil']);
  }
}