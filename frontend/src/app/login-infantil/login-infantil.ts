import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-infantil',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login-infantil.html',
  styleUrl: './login-infantil.css'
})
export class LoginInfantilComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  nome = '';
  codigoFamilia = '';
  erro = signal('');
  carregando = signal(false);

  entrar() {
    this.erro.set('');

    if (this.nome.trim().length < 2) {
      this.erro.set('Digite o nome da criança.');
      return;
    }

    if (this.codigoFamilia.trim().length !== 6) {
      this.erro.set('Informe o Código da Família com 6 caracteres.');
      return;
    }

    this.carregando.set(true);
    this.auth.entrarComoCrianca(
      this.nome.trim(),
      this.codigoFamilia.trim().toUpperCase()
    ).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/escolher-jogo']);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err.error?.erro || 'Nome ou Código da Família inválidos.');
      }
    });
  }
}