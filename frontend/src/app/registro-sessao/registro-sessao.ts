import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RelatorioService } from '../services/relatorio.service';
import { Relatorio } from '../models/relatorio.model';

@Component({
  selector: 'app-registro-sessao',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './registro-sessao.html',
  styleUrl: './registro-sessao.css'
})
export class RegistroSessaoComponent implements OnInit {
  relatorio = signal<Relatorio | null>(null);
  mensagem = signal('Carregando o relatório...');

  constructor(
    private authService: AuthService,
    private relatorioService: RelatorioService
  ) {}

  ngOnInit(): void {
    const crianca = this.authService.getPerfilInfantilAtual();
    const responsavel = this.authService.getResponsavelAtual();

    if (crianca) {
      this.carregar(crianca.idPerfil);
    } else if (responsavel) {
      this.relatorioService.listarPerfis(responsavel.idResponsavel).subscribe({
        next: perfis => {
          if (perfis.length > 0) {
            this.carregar(perfis[0].idPerfil);
          } else {
            this.mensagem.set('Nenhuma criança cadastrada ainda.');
          }
        },
        error: () => this.mensagem.set('Não consegui falar com o servidor. Verifique se o backend está ligado.')
      });
    } else {
      this.mensagem.set('Entre como criança ou como responsável para ver o relatório.');
    }
  }

  private carregar(idPerfil: number): void {
    this.relatorioService.buscarRelatorio(idPerfil).subscribe({
      next: r => this.relatorio.set(r),
      error: () => this.mensagem.set('Não consegui carregar o relatório. Verifique se o backend está ligado.')
    });
  }

  icone(materia: string): string {
    if (materia.startsWith('Adi')) return '➕';
    if (materia.startsWith('Subtra')) return '➖';
    if (materia.startsWith('Multipli')) return '✖️';
    if (materia.startsWith('Divis')) return '➗';
    if (materia.startsWith('Compara')) return '⚖️';
    return '📐';
  }
}