import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { SelecaoPerfilComponent } from './selecao-perfil/selecao-perfil';
import { LoginInfantilComponent } from './login-infantil/login-infantil';
import { LoginResponsavelComponent } from './login-responsavel/login-responsavel';
import { RegistroSessaoComponent } from './registro-sessao/registro-sessao';
import { JogoAdicaoComponent } from './jogo-adicao/jogo-adicao';
import { EscolherJogoComponent } from './escolher-jogo/escolher-jogo';
import { JogoOperacaoComponent } from './jogo-operacao/jogo-operacao';
import { JogoTabuadaComponent } from './jogo-tabuada/jogo-tabuada';
import { JogoCompararComponent } from './jogo-comparar/jogo-comparar';
import { MinhasCriancasComponent } from './minhas-criancas/minhas-criancas';
import { responsavelGuard } from './services/responsavel.guard';

export const routes: Routes = [

  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'selecao-perfil', component: SelecaoPerfilComponent },
  { path: 'login-infantil', component: LoginInfantilComponent },
  { path: 'login-responsavel', component: LoginResponsavelComponent },
  { path: 'minhas-criancas', component: MinhasCriancasComponent, canActivate: [responsavelGuard] },
  { path: 'registro-sessao', component: RegistroSessaoComponent, canActivate: [responsavelGuard] },
  { path: 'escolher-jogo', component: EscolherJogoComponent },
  { path: 'jogo-adicao', component: JogoAdicaoComponent },
  { path: 'jogo-subtracao', component: JogoOperacaoComponent, data: { operacao: 'subtracao' } },
  { path: 'jogo-multiplicacao', component: JogoOperacaoComponent, data: { operacao: 'multiplicacao' } },
  { path: 'jogo-divisao', component: JogoOperacaoComponent, data: { operacao: 'divisao' } },
  { path: 'jogo-tabuada', component: JogoTabuadaComponent },
  { path: 'jogo-comparar', component: JogoCompararComponent },
  { path: '**', redirectTo: '' }
];