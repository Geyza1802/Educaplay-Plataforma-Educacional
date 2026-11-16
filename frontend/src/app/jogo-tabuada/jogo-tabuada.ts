import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DesafioService } from '../services/desafio.service';
import { SimboloComponent } from '../simbolo/simbolo';
import { MascoteComponent } from '../mascote/mascote';

@Component({
  selector: 'app-jogo-tabuada',
  standalone: true,
  imports: [RouterLink, SimboloComponent, MascoteComponent],
  templateUrl: './jogo-tabuada.html',
  styleUrls: ['../jogo-adicao/jogo-adicao.css'],
  styles: [`
    .numeros {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin: 22px 0 8px 0;
    }

    .numeros .opcao {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 6px;
    }

    .troca {
      margin-top: 18px;
    }

    @media (max-width: 480px) {
      .numeros {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `]
})
export class JogoTabuadaComponent implements OnInit {
  numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  tabuada = signal<number | null>(null);
  nomeCrianca = signal('');
  numeroB = signal(1);
  respostaCerta = signal(0);
  opcoes = signal<number[]>([]);
  acertos = signal(0);
  erros = signal(0);
  sequencia = signal(0);
  resultado = signal<'acertou' | 'errou' | null>(null);
  respostaEscolhida = signal<number | null>(null);
  aviso = signal('');

  private idPerfil = 0;
  private ultimoB = 0;
  private temporizador?: ReturnType<typeof setTimeout>;

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
  }

  escolherTabuada(n: number) {
    clearTimeout(this.temporizador);
    this.tabuada.set(n);
    this.acertos.set(0);
    this.erros.set(0);
    this.sequencia.set(0);
    this.ultimoB = 0;
    this.novaConta();
  }

  trocarTabuada() {
    clearTimeout(this.temporizador);
    this.tabuada.set(null);
    this.sequencia.set(0);
    this.resultado.set(null);
    this.respostaEscolhida.set(null);
    this.aviso.set('');
  }

  novaConta() {
    const a = this.tabuada();
    if (a === null) {
      return;
    }

    let b = this.sortear(1, 10);
    while (b === this.ultimoB) {
      b = this.sortear(1, 10);
    }
    this.ultimoB = b;

    const certa = a * b;

    // respostas erradas parecidas: vizinhas na própria tabuada e números próximos
    const candidatas = [certa - a, certa + a, certa - 1, certa + 1, certa - 2, certa + 2]
      .filter(n => n >= 1 && n !== certa);
    const erradas = [...new Set(candidatas)]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    this.numeroB.set(b);
    this.respostaCerta.set(certa);
    this.opcoes.set([certa, ...erradas].sort(() => Math.random() - 0.5));
    this.resultado.set(null);
    this.respostaEscolhida.set(null);
    this.aviso.set('');
  }

  responder(valor: number) {
    if (this.resultado() !== null) {
      return;
    }

    const acertou = valor === this.respostaCerta();
    this.respostaEscolhida.set(valor);
    this.resultado.set(acertou ? 'acertou' : 'errou');

    if (acertou) {
      this.acertos.update(n => n + 1);
      this.sequencia.update(n => n + 1);
    } else {
      this.erros.update(n => n + 1);
      this.sequencia.set(0);
    }

    this.desafioService
      .registrarDesafio(this.idPerfil, 'multiplicacao', acertou, acertou ? 10 : 0)
      .subscribe({
        error: () => {
          this.aviso.set('Não consegui salvar essa resposta. Verifique se o backend está ligado.');
        }
      });

    this.temporizador = setTimeout(() => this.novaConta(), 1600);
  }

  private sortear(minimo: number, maximo: number): number {
    return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
  }
}