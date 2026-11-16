import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DesafioService } from '../services/desafio.service';
import { limitesDe, nomeDoNivel } from '../services/dificuldade';
import { SimboloComponent } from '../simbolo/simbolo';
import { MascoteComponent } from '../mascote/mascote';

@Component({
  selector: 'app-jogo-adicao',
  standalone: true,
  imports: [RouterLink, SimboloComponent, MascoteComponent],
  templateUrl: './jogo-adicao.html',
  styleUrl: './jogo-adicao.css'
})
export class JogoAdicaoComponent implements OnInit {
  nomeCrianca = signal('');
  numeroA = signal(0);
  numeroB = signal(0);
  opcoes = signal<number[]>([]);
  acertos = signal(0);
  erros = signal(0);
  sequencia = signal(0);
  nivel = signal(1);
  subiuDeNivel = signal(false);
  resultado = signal<'acertou' | 'errou' | null>(null);
  respostaEscolhida = signal<number | null>(null);
  aviso = signal('');

  respostaCerta = computed(() => this.numeroA() + this.numeroB());
  nomeNivel = computed(() => nomeDoNivel(this.nivel()));

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
        this.novaConta();
      },
      error: () => {
        this.aviso.set('Não consegui buscar o seu nível. Verifique se o backend está ligado.');
        this.novaConta();
      }
    });
  }

  novaConta() {
    const limites = limitesDe('adicao', this.nivel());
    const a = this.sortear(limites.primeiro[0], limites.primeiro[1]);
    const b = this.sortear(limites.segundo[0], limites.segundo[1]);
    const certa = a + b;

    const espalhar = this.nivel() <= 2 ? 3 : 5;
    const escolhas = new Set<number>([certa]);
    while (escolhas.size < 3) {
      const candidata = certa + this.sortear(-espalhar, espalhar);
      if (candidata >= 0) {
        escolhas.add(candidata);
      }
    }

    this.numeroA.set(a);
    this.numeroB.set(b);
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
      .registrarDesafio(this.idPerfil, 'adicao', acertou, acertou ? 10 : 0)
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