import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api.config';

const CHAVES = ['educaplay.token', 'educaplay.responsavel', 'educaplay.crianca'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const ehNossaApi = req.url.startsWith(API_URL);

  let token: string | null = null;
  try {
    token = sessionStorage.getItem('educaplay.token');
  } catch {
    token = null;
  }

  const requisicao = token && ehNossaApi
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro: HttpErrorResponse) => {
      const ehLogin = req.url.includes('/login');
      const ehCronometro = req.url.includes('/sessoes');

      // crachá vencido ou inválido: limpa o login e volta para o começo
      if (erro.status === 401 && ehNossaApi && !ehLogin && !ehCronometro) {
        try {
          CHAVES.forEach(c => sessionStorage.removeItem(c));
        } catch {
          // sem armazenamento, não há nada para limpar
        }
        router.navigate(['/selecao-perfil']);
      }

      return throwError(() => erro);
    })
  );
};