import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DesafioService } from '../services/desafio.service';
import { limitesDe, nomeDoNivel } from '../services/dificuldade';
import { SimboloComponent } from '../simbolo/simbolo';
import { MascoteComponent } from '../mascote/mascote';

type Operacao = 'subtracao' | 'multiplicacao' | 'divisao';

const CONFIG: Record<Operacao, { titulo: string; simbolo: string }> = {
  subtracao: { titulo: 'Jogo da Subtração', simbolo: '-' },
  multiplicacao: { titulo: 'Jogo da Multiplicação', simbolo: '×' },
  divisao: { titulo: 'Jogo da Divisão', simbolo: '÷' }
};

@Component({
  selector: 'app-jogo-operacao',
  standalone: true,
  imports: [RouterLink, SimboloComponent, MascoteComponent],
  templateUrl: './jogo-operacao.html',
  styleUrl: '../jogo-adicao/jogo-adicao.css'
})
export class JogoOperacaoComponent implements OnInit {
  titulo = signal('');
  simboloOperacao = signal('');
  nomeCrianca = signal('');
  numeroA = signal(0);
  numeroB = signal(0);
  respostaCerta = signal(0);
  opcoes = signal<number[]>([]);
  acertos = signal(0);
  erros = signal(0);
  sequencia = signal(0);
  nivel = signal(1);
  subiuDeNivel = signal(false);
  resultado = signal<'acertou' | 'errou' | null>(null);
  respostaEscolhida = signal<number | null>(null);
  aviso = signal('');

  nomeNivel = computed(() => nomeDoNivel(this.nivel()));

  private operacao: Operacao = 'subtracao';
  private idPerfil = 0;

  constructor(
    private route: ActivatedRoute,
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

    const op = this.route.snapshot.data['operacao'] as Operacao;
    if (!CONFIG[op]) {
      this.router.navigate(['/escolher-jogo']);
      return;
    }

    this.operacao = op;
    this.titulo.set(CONFIG[op].titulo);
    this.simboloOperacao.set(CONFIG[op].simbolo);
    this.idPerfil = perfil.idPerfil;
    this.nomeCrianca.set(perfil.nome);

    this.desafioService.buscarProgresso(this.idPerfil).subscribe({
      next: p => {
        this.nivel.set(p.nivel);
        this.novaConta();
      },
      error: () => {
        this.aviso.set('Não consegui buscar o seu nível. Verifique se o backend está ligado.');
        this.novaConta();
      }
    });
  }

  novaConta() {
    const limites = limitesDe(this.operacao, this.nivel());
    let a = 0;
    let b = 0;
    let certa = 0;

    switch (this.operacao) {
      case 'subtracao':
        a = this.sortear(limites.primeiro[0], limites.primeiro[1]);
        b = this.sortear(1, a - 1);
        certa = a - b;
        break;
      case 'multiplicacao':
        a = this.sortear(limites.primeiro[0], limites.primeiro[1]);
        b = this.sortear(limites.segundo[0], limites.segundo[1]);
        certa = a * b;
        break;
      case 'divisao':
        b = this.sortear(limites.primeiro[0], limites.primeiro[1]);
        certa = this.sortear(limites.segundo[0], limites.segundo[1]);
        a = b * certa;
        break;
    }

    const espalhar = this.nivel() <= 2 ? 3 : 5;
    const escolhas = new Set<number>([certa]);
    while (escolhas.size < 3) {
      const candidata = certa + this.sortear(-espalhar, espalhar);
      if (candidata >= 1) {
        escolhas.add(candidata);
      }
    }

    this.numeroA.set(a);
    this.numeroB.set(b);
    this.respostaCerta.set(certa);
    this.opcoes.set([...escolhas].sort(() => Math.random() - 0.5));
    this.resultado.set(null);
    this.respostaEscolhida.set(null);
    this.subiuDeNivel.set(false);
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
      .registrarDesafio(this.idPerfil, this.operacao, acertou, acertou ? 10 : 0)
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

    setTimeout(() => this.novaConta(), 1600);
  }

  private sortear(minimo: number, maximo: number): number {
    return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
  }
}