import { Component, Input } from '@angular/core';

const CORES = ['#2850ff', '#5ce1e6', '#ffb6ce', '#ffd95a', '#5483fc', '#f72df2'];

@Component({
  selector: 'app-mascote',
  standalone: true,
  template: `
    <div class="mascote-area">
      <div class="linha">
        <img
          class="mascote"
          src="/mascote.png"
          alt="Mascote do EducaPlay"
          [class.pulo]="resultado === 'acertou'"
          [class.balanca]="resultado === 'errou'">
        <div class="balao">{{ mensagem() }}</div>
      </div>

      @if (sequencia >= 2) {
        <div class="sequencia">🔥 {{ sequencia }} acertos seguidos!</div>
      }

      @if (comemorar()) {
        <div class="confete" aria-hidden="true">
          @for (p of pecas; track $index) {
            <span
              class="peca"
              [style.left.%]="p.x"
              [style.background]="p.cor"
              [style.animation-delay.s]="p.atraso"></span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .mascote-area {
      position: relative;
      margin: 10px 0 4px 0;
    }

    .linha {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
    }

    .mascote {
      width: 84px;
      height: auto;
      filter: drop-shadow(0 6px 10px rgba(40, 80, 255, 0.2));
    }

    .mascote.pulo {
      animation: pulo 0.6s ease;
    }

    .mascote.balanca {
      animation: balanca 0.5s ease;
    }

    .balao {
      position: relative;
      background: #ffffff;
      border: 2px solid #cfeef7;
      color: #0a4da8;
      font-weight: 700;
      font-size: 0.95rem;
      padding: 10px 16px;
      border-radius: 18px;
      max-width: 230px;
      text-align: left;
      box-shadow: 0 4px 12px rgba(84, 131, 252, 0.15);
    }

    .balao::before {
      content: '';
      position: absolute;
      left: -9px;
      top: 50%;
      width: 14px;
      height: 14px;
      background: #ffffff;
      border-left: 2px solid #cfeef7;
      border-bottom: 2px solid #cfeef7;
      transform: translateY(-50%) rotate(45deg);
    }

    .sequencia {
      display: inline-block;
      margin-top: 8px;
      background: #fff1d6;
      color: #9a4b00;
      font-weight: 700;
      font-size: 0.9rem;
      padding: 5px 14px;
      border-radius: 20px;
      animation: aparecer 0.35s ease;
    }

    .confete {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 0;
      pointer-events: none;
    }

    .peca {
      position: absolute;
      top: -6px;
      width: 9px;
      height: 14px;
      border-radius: 2px;
      opacity: 0;
      animation: cair 1.5s ease-in forwards;
    }

    @keyframes pulo {
      0%, 100% { transform: translateY(0) scale(1); }
      40% { transform: translateY(-14px) scale(1.08); }
    }

    @keyframes balanca {
      0%, 100% { transform: rotate(0); }
      25% { transform: rotate(-8deg); }
      75% { transform: rotate(8deg); }
    }

    @keyframes aparecer {
      0% { opacity: 0; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes cair {
      0% { opacity: 1; transform: translateY(0) rotate(0); }
      100% { opacity: 0; transform: translateY(240px) rotate(540deg); }
    }
  `]
})
export class MascoteComponent {
  @Input() resultado: 'acertou' | 'errou' | null = null;
  @Input() sequencia = 0;
  @Input() nome = '';

  pecas = Array.from({ length: 18 }, (_, i) => ({
    x: 5 + i * 5.2,
    cor: CORES[i % CORES.length],
    atraso: (i % 6) * 0.08
  }));

  mensagem(): string {
    if (this.resultado === 'acertou') {
      if (this.sequencia >= 5) return 'Incrível! Você está voando! 🚀';
      if (this.sequencia >= 3) return 'Que sequência! 🔥';
      return 'Muito bem! ⭐';
    }
    if (this.resultado === 'errou') {
      return 'Quase! Você consegue na próxima! 💪';
    }
    return this.nome ? 'Vamos lá, ' + this.nome + '!' : 'Vamos lá!';
  }

  comemorar(): boolean {
    return (
      this.resultado === 'acertou' &&
      this.sequencia > 0 &&
      (this.sequencia === 3 || this.sequencia % 5 === 0)
    );
  }
}