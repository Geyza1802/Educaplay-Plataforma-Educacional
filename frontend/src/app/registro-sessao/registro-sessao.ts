import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RelatorioService } from '../services/relatorio.service';
import { HistoricoService, Historico } from '../services/historico.service';
import { Relatorio } from '../models/relatorio.model';

interface Barra {
  dia: string;
  data: string;
  total: number;
  precisaoPct: number | null;
  altura: number;
  classe: 'boa' | 'media' | 'baixa' | '';
}

@Component({
  selector: 'app-registro-sessao',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './registro-sessao.html',
  styleUrls: ['./registro-sessao.css'],
  styles: [`
    /* ===== Cores da paleta da logo (sobrepõem o CSS antigo) ===== */
    :host .kawaii-wrapper {
      background: linear-gradient(135deg, #e6f7ff, #ffe3ee, #dff9fb, #eaf0ff) !important;
      background-size: 300% 300% !important;
    }

    :host .header-section p {
      color: #4a3636 !important;
    }

    :host .level-badge {
      background: #2850ff !important;
      color: #ffffff !important;
    }

    :host .profile-avatar {
      background: #ffe3ee !important;
    }

    :host .progress-bar-container label,
    :host .progress-bar-container label span {
      color: #4a3636 !important;
    }

    :host .progress-bar {
      background: #dff3fb !important;
    }

    :host .progress-bar .fill {
      background: linear-gradient(90deg, #5ce1e6, #2850ff) !important;
    }

    :host .big-stat {
      color: #0a4da8 !important;
    }

    :host .big-stat span {
      color: #5a4747 !important;
    }

    :host .stats-list li {
      border-bottom-color: #dff3fb !important;
    }

    :host .stats-list li span,
    :host .stats-list li strong {
      color: #4a3636 !important;
    }

    /* ===== Cartão do histórico ===== */
    .historico-wrap {
      width: 100%;
      max-width: 960px;
      margin: 24px auto 0 auto;
      padding: 0 12px;
    }

    .historico-card {
      max-width: 100% !important;
      width: 100%;
    }

    .grafico {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      margin: 18px 0 10px 0;
    }

    .coluna {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }

    .valor {
      min-height: 20px;
      font-weight: 700;
      font-size: 0.9rem;
      color: #0a4da8;
    }

    .area-barra {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      width: 100%;
      height: 140px;
      background: #f4fbff;
      border-radius: 14px;
      padding: 6px 0 0 0;
      overflow: hidden;
    }

    .barra {
      width: 62%;
      border-radius: 10px 10px 0 0;
      background: #cfeef7;
      transition: height 0.4s ease;
    }

    .barra.boa { background: #3ddc97; }
    .barra.media { background: #ffd95a; }
    .barra.baixa { background: #ff8fa3; }

    .precisao {
      font-weight: 700;
      font-size: 0.85rem;
      color: #4a3636;
    }

    .dia {
      font-weight: 700;
      font-size: 0.8rem;
      color: #0a4da8;
      text-transform: capitalize;
    }

    .data {
      font-size: 0.75rem;
      color: #7a6a6a;
    }

    .legenda {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      font-size: 0.8rem;
      margin-bottom: 8px;
    }

    .legenda span::before {
      content: '';
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 4px;
      margin-right: 6px;
      vertical-align: -1px;
    }

    .legenda .l-boa::before { background: #3ddc97; }
    .legenda .l-media::before { background: #ffd95a; }
    .legenda .l-baixa::before { background: #ff8fa3; }

    .vazio {
      margin: 18px 0;
    }

    .sessoes {
      list-style: none;
      padding: 0;
      margin: 8px 0 0 0;
    }

    .sessoes li {
      display: flex;
      justify-content: space-between;
      padding: 8px 4px;
      border-bottom: 1px dashed #dff3fb;
      font-size: 0.9rem;
    }

    .subtitulo {
      margin: 18px 0 4px 0;
      font-size: 1rem;
    }

    @media (max-width: 560px) {
      .data { display: none; }
      .area-barra { height: 110px; }
    }
  `]
})
export class RegistroSessaoComponent implements OnInit {
  relatorio = signal<Relatorio | null>(null);
  historico = signal<Historico | null>(null);
  historicoErro = signal(false);
  mensagem = signal('Carregando o relatório...');

  temDados = computed(() => {
    const h = this.historico();
    return h ? h.dias.some(d => d.total > 0) : false;
  });

  barras = computed<Barra[]>(() => {
    const h = this.historico();
    if (!h) {
      return [];
    }
    const maximo = Math.max(1, ...h.dias.map(d => d.total));
    return h.dias.map((d, i) => {
      const [ano, mes, dia] = d.data.split('-').map(Number);
      const dt = new Date(ano, mes - 1, dia);
      const diaSemana = dt.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const pct = d.precisaoPct;
      return {
        dia: i === h.dias.length - 1 ? 'hoje' : diaSemana,
        data: String(dia).padStart(2, '0') + '/' + String(mes).padStart(2, '0'),
        total: d.total,
        precisaoPct: pct,
        altura: d.total === 0 ? 0 : Math.max(8, Math.round((d.total / maximo) * 100)),
        classe: pct === null ? '' : pct >= 70 ? 'boa' : pct >= 40 ? 'media' : 'baixa'
      } as Barra;
    });
  });

  constructor(
    private authService: AuthService,
    private relatorioService: RelatorioService,
    private historicoService: HistoricoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const responsavel = this.authService.getResponsavelAtual();
    if (!responsavel) {
      this.mensagem.set('Entre como responsável para ver o relatório.');
      return;
    }

    // se veio da lista "Minhas crianças", mostra a criança escolhida
    const escolhida = Number(this.route.snapshot.queryParamMap.get('crianca'));
    if (escolhida) {
      this.carregar(escolhida);
      return;
    }

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
  }

  private carregar(idPerfil: number): void {
    this.relatorioService.buscarRelatorio(idPerfil).subscribe({
      next: r => this.relatorio.set(r),
      error: () => this.mensagem.set('Não consegui carregar o relatório. Verifique se o backend está ligado.')
    });

    this.historicoService.buscarHistorico(idPerfil).subscribe({
      next: h => this.historico.set(h),
      error: () => this.historicoErro.set(true)
    });
  }

  formatarInicio(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
      ' às ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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