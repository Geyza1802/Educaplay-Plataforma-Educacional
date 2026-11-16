import { Component, Input } from '@angular/core';

const NOMES_DOS_ARQUIVOS: Record<string, string> = {
  '0': 'zero', '1': 'um', '2': 'dois', '3': 'tres', '4': 'quatro',
  '5': 'cinco', '6': 'seis', '7': 'sete', '8': 'oito', '9': 'nove',
  '+': 'mais', '-': 'menos', '×': 'vezes', 'x': 'vezes',
  '÷': 'dividir', '=': 'igual'
};

@Component({
  selector: 'app-simbolo',
  standalone: true,
  template: `
    <span class="grupo">
      @for (c of caracteres(); track $index; let i = $index) {
        <img
          [src]="'/' + arquivo(c) + '.png'"
          [style.width.px]="tamanho"
          [style.margin-left.px]="i > 0 ? -tamanho * aproximar : 0"
          [alt]="c">
      }
    </span>
  `,
  styles: [`
    .grupo {
      display: inline-flex;
      align-items: center;
    }
    img {
      height: auto;
    }
  `]
})
export class SimboloComponent {
  @Input() valor: string | number = '';
  @Input() tamanho = 64;

  aproximar = 0.12;

  caracteres(): string[] {
    return String(this.valor).split('');
  }

  arquivo(c: string): string {
    return NOMES_DOS_ARQUIVOS[c] ?? '';
  }
}