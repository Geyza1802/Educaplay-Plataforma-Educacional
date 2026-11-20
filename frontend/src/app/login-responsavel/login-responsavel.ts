import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-responsavel',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-responsavel.html',
  styleUrl: './login-responsavel.css'
})
export class LoginResponsavelComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  senha = '';
  pinSeguranca = '';
  erro = signal('');
  carregando = signal(false);

  aoEntrar() {
    this.erro.set('');

    if (!this.email.trim() || !this.senha || !this.pinSeguranca.trim()) {
      this.erro.set('Preencha e-mail, senha e PIN de segurança.');
      return;
    }

    this.carregando.set(true);
    this.auth.autenticarResponsavel(
      this.email.trim(),
      this.senha,
      this.pinSeguranca.trim()
    ).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/minhas-criancas']);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err.error?.erro || 'E-mail, senha ou PIN incorretos.');
      }
    });
  }
}