import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DesafioService } from '../services/desafio.service';
import { nomeDoNivel } from '../services/dificuldade';
import { SimboloComponent } from '../simbolo/simbolo';
import { MascoteComponent } from '../mascote/mascote';

type Lado = 'esquerda' | 'direita' | 'igual';

@Component({
  selector: 'app-jogo-comparar',
  standalone: true,
  imports: [RouterLink, SimboloComponent, MascoteComponent],
  templateUrl: './jogo-comparar.html',
  styleUrls: ['../jogo-adicao/jogo-adicao.css'],
  styles: [`
    .pergunta {
      font-size: 1.4rem;
      font-weight: 700;
      color: #0a4da8;
      margin: 6px 0 4px 0;
    }

    .dica {
      font-size: 0.9rem;
      margin: 0 0 6px 0;
    }

    .comparar {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 14px;
      margin: 24px 0 12px 0;
    }

    .comparar .opcao {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 130px;
      min-height: 120px;
    }

    .comparar .opcao.igual {
      min-width: 80px;
      min-height: 80px;
      padding: 10px 16px;
    }
  `]
})
export class JogoCompararComponent implements OnInit {
  nomeCrianca = signal('');
  esquerda = signal(0);
  direita = signal(0);
  perguntaMaior = signal(true);
  acertos = signal(0);
  erros = signal(0);
  sequencia = signal(0);
  nivel = signal(1);
  subiuDeNivel = signal(false);
  resultado = signal<'acertou' | 'errou' | null>(null);
  escolha = signal<Lado | null>(null);
  aviso = signal('');

  nomeNivel = computed(() => nomeDoNivel(this.nivel()));
  textoPergunta = computed(() =>
    this.perguntaMaior() ? 'Toque no número MAIOR' : 'Toque no número MENOR'
  );
  
  respostaCerta = computed<Lado>(() => {
    const a = this.esquerda();
    const b = this.direita();
    if (a === b) {
      return 'igual';
    }
    const maiorEsta = a > b ? 'esquerda' : 'direita';
    const menorEsta = a > b ? 'direita' : 'esquerda';
    return this.perguntaMaior() ? maiorEsta : menorEsta;
  });

  textoCerto = computed(() => {
    const certa = this.respostaCerta();
    if (certa === 'igual') {
      return 'Os dois números são iguais!';
    }
    const numero = certa === 'esquerda' ? this.esquerda() : this.direita();
    return 'A resposta certa é o ' + numero + '.';
  });

  private idPerfil = 0;

  constructor(
    private authService: AuthService,
    private desafioService: DesafioService,
    private router: Router
  ) {}

  ngOnInit() {
    const perfil = this.authService.getPerfilInfantilAtual();
    if (!perfil) {
      this.router.navigate(['/login-infantil']);
      return;
    }
    this.idPerfil = perfil.idPerfil;
    this.nomeCrianca.set(perfil.nome);

    this.desafioService.buscarProgresso(this.idPerfil).subscribe({
      next: p => {
        this.nivel.set(p.nivel);
        this.novaRodada();
      },
      error: () => {
        this.aviso.set('Não consegui buscar o seu nível. Verifique se o backend está ligado.');
        this.novaRodada();
      }
    });
  }

  novaRodada() {
    const nivel = this.nivel();
    const maximo = nivel <= 2 ? 10 : nivel <= 5 ? 50 : 100;

    const a = this.sortear(1, maximo);
    let b: number;

    if (Math.random() < 0.2) {
      b = a; // às vezes os dois são iguais
    } else {
      b = this.sortear(1, maximo);
      while (b === a) {
        b = this.sortear(1, maximo);
      }
    }

    this.esquerda.set(a);
    this.direita.set(b);
    this.perguntaMaior.set(Math.random() < 0.5);
    this.resultado.set(null);
    this.escolha.set(null);
    this.subiuDeNivel.set(false);
    this.aviso.set('');
  }

  responder(lado: Lado) {
    if (this.resultado() !== null) {
      return;
    }

    const acertou = lado === this.respostaCerta();
    this.escolha.set(lado);
    this.resultado.set(acertou ? 'acertou' : 'errou');

    if (acertou) {
      this.acertos.update(n => n + 1);
      this.sequencia.update(n => n + 1);
    } else {
      this.erros.update(n => n + 1);
      this.sequencia.set(0);
    }

    this.desafioService
      .registrarDesafio(this.idPerfil, 'comparacao', acertou, acertou ? 10 : 0)
      .subscribe({
        next: r => {
          if (r.nivel > this.nivel()) {
            this.subiuDeNivel.set(true);
          }
          this.nivel.set(r.nivel);
        },
        error: () => {
          this.aviso.set('Não consegui salvar essa resposta. Verifique se o backend está ligado.');
        }
      });

    setTimeout(() => this.novaRodada(), 1800);
  }

  private sortear(minimo: number, maximo: number): number {
    return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
  }
}