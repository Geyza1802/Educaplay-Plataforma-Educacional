import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-responsavel',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login-responsavel.html',
  styleUrl: './login-responsavel.css'
})
export class LoginResponsavelComponent {
  email: string = '';
  senha: string = '';
  pinSeguranca: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  aoEntrar() {
    if (!this.email || !this.senha || !this.pinSeguranca) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    this.authService.autenticarResponsavel(this.email, this.senha, this.pinSeguranca).subscribe({
      next: () => {
        alert('Acesso concedido com sucesso!');
        this.router.navigate(['/minhas-criancas']);
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