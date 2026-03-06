import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');

  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token');
    router.navigate(['/authentication/login']);
    return throwError(() => new Error('Token expiré'));
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.removeItem('token');
        router.navigate(['/authentication/login']);
      }
      return throwError(() => err);
    })
  );
};
