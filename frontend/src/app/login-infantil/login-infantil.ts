import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { SessaoService } from '../services/sessao.service';

@Component({
  selector: 'app-login-infantil',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login-infantil.html',
  styleUrl: './login-infantil.css'
})
export class LoginInfantilComponent {
  nomeCrianca: string = '';

  constructor(
    private authService: AuthService,
    private sessaoService: SessaoService,
    private router: Router
  ) {}

  aoIniciar() {
    if (!this.nomeCrianca.trim()) {
      alert('Escreva o seu nome para jogarmos!');
      return;
    }

    this.authService.entrarComoCrianca(this.nomeCrianca.trim()).subscribe({
      next: () => {
        this.sessaoService.iniciarSessao();
        this.router.navigate(['/escolher-jogo']);
      },
      error: (erro: HttpErrorResponse) => {
        if (erro.status === 0) {
          alert('Não consegui falar com o servidor. Verifique se o backend está ligado.');
        } else {
          alert(erro.error?.erro ?? 'Não foi possível entrar. Tente de novo.');
        }
      }
    });
  }
}