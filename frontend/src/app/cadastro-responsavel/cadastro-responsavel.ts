import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cadastro-responsavel',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './cadastro-responsavel.html',
  styleUrl: './cadastro-responsavel.css'
})
export class CadastroResponsavelComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  pin = '';
  erro = signal('');
  carregando = signal(false);

  cadastrar() {
    this.erro.set('');

    if (this.nome.trim().length < 2) {
      this.erro.set('Digite seu nome completo.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.erro.set('Digite um e-mail válido.');
      return;
    }
    if (this.senha.length < 6) {
      this.erro.set('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (this.senha !== this.confirmarSenha) {
      this.erro.set('As senhas não coincidem.');
      return;
    }
    if (!/^\d{4}$/.test(this.pin.trim())) {
      this.erro.set('O PIN deve conter exatamente 4 números.');
      return;
    }

    this.carregando.set(true);
    this.http.post<any>('http://localhost:3000/api/responsaveis', {
      nome: this.nome.trim(),
      email: this.email.trim(),
      senha: this.senha,
      pin: this.pin.trim()
    }).subscribe({
      next: (res) => {
        this.carregando.set(false);
        alert(
          `Conta criada com sucesso!\n\n` +
          `Seu Código da Família é: ${res.codigoFamilia}\n` +
          `Guarde esse código para suas crianças entrarem nos jogos.`
        );
        this.router.navigate(['/login-responsavel']);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err.error?.erro || 'Erro ao criar conta. Verifique se o backend está rodando.');
      }
    });
  }
}