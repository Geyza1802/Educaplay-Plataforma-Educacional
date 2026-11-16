import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SimboloComponent } from '../simbolo/simbolo';

interface OpcaoJogo {
  titulo: string;
  descricao: string;
  simbolo: string;
  rota: string;
  pronto: boolean;
  classe: string;
}

@Component({
  selector: 'app-escolher-jogo',
  standalone: true,
  imports: [RouterLink, SimboloComponent],
  template: `
    <div class="session-container">
      <div class="profile-card-wrapper escolha-card">

        <h2>Escolha o seu jogo! 🎮</h2>
        <p class="chamada">Oi, {{ nomeCrianca }}! O que vamos aprender hoje?</p>

        <div class="grade">
          @for (jogo of jogos; track jogo.rota) {
            @if (jogo.pronto) {
              <a class="jogo-opcao" [class]="'jogo-opcao ' + jogo.classe" [routerLink]="jogo.rota">
                <app-simbolo [valor]="jogo.simbolo" [tamanho]="72" />
                <span class="jogo-titulo">{{ jogo.titulo }}</span>
                <span class="jogo-desc">{{ jogo.descricao }}</span>
              </a>
            } @else {
              <div class="jogo-opcao bloqueado" [class]="'jogo-opcao bloqueado ' + jogo.classe">
                <app-simbolo [valor]="jogo.simbolo" [tamanho]="72" />
                <span class="jogo-titulo">{{ jogo.titulo }}</span>
                <span class="jogo-desc">Em breve 🔒</span>
              </div>
            }
          }
        </div>

        <div class="back-container">
          <a routerLink="/selecao-perfil" class="btn-back-pill">← Sair</a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .escolha-card {
      max-width: 640px;
    }

    .chamada {
      font-size: 1.15rem;
      margin: 4px 0 20px 0;
    }

    .grade {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .jogo-opcao {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 20px 12px;
      border-radius: 24px;
      border: 3px solid transparent;
      text-decoration: none;
      transition: all 0.25s ease;
    }

    a.jogo-opcao {
      cursor: pointer;
    }

    a.jogo-opcao:hover {
      transform: translateY(-4px) scale(1.04);
      box-shadow: 0 12px 24px rgba(84, 131, 252, 0.3);
    }

    .jogo-titulo {
      font-size: 1.15rem;
      font-weight: 700;
      color: #0a4da8;
    }

    .jogo-desc {
      font-size: 0.85rem;
      color: #5a4747;
    }

    .adicao { background: #e3fbfc; border-color: #5ce1e6; }
    .subtracao { background: #ffeaf2; border-color: #ffb6ce; }
    .multiplicacao { background: #fff6cc; border-color: #ffd95a; }
    .divisao { background: #eaf0ff; border-color: #5483fc; }
    .tabuada { background: #f1ecff; border-color: #b9a6ff; }
    .comparar { background: #fff0e0; border-color: #ffb45a; }

    .bloqueado {
      opacity: 0.55;
      filter: grayscale(0.4);
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .grade {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EscolherJogoComponent implements OnInit {
  nomeCrianca = '';

  jogos: OpcaoJogo[] = [
    { titulo: 'Adição', descricao: 'Juntar e somar', simbolo: '+', rota: '/jogo-adicao', pronto: true, classe: 'adicao' },
    { titulo: 'Subtração', descricao: 'Tirar e comparar', simbolo: '-', rota: '/jogo-subtracao', pronto: true, classe: 'subtracao' },
    { titulo: 'Multiplicação', descricao: 'Grupos iguais', simbolo: '×', rota: '/jogo-multiplicacao', pronto: true, classe: 'multiplicacao' },
    { titulo: 'Divisão', descricao: 'Repartir igualmente', simbolo: '÷', rota: '/jogo-divisao', pronto: true, classe: 'divisao' },
    { titulo: 'Tabuada', descricao: 'Treinar do 1 ao 10', simbolo: '×', rota: '/jogo-tabuada', pronto: true, classe: 'tabuada' },
    { titulo: 'Comparar', descricao: 'Maior, menor ou igual', simbolo: '=', rota: '/jogo-comparar', pronto: true, classe: 'comparar' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const perfil = this.authService.getPerfilInfantilAtual();
    if (!perfil) {
      this.router.navigate(['/login-infantil']);
      return;
    }
    this.nomeCrianca = perfil.nome;
  }
}