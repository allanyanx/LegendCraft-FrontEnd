import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Evitar error de localStorage is not defined durante Server-Side Rendering (SSR)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Clonamos la petición y agregamos el header Authorization
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde 401 y NO es en la ruta de login o refresh
      if (error.status === 401 && !req.url.includes('/login') && !req.url.includes('/refresh-token')) {
        
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

        if (token && refreshToken) {
          // Intentar obtener un nuevo token de acceso silenciosamente
          return authService.refreshToken(token, refreshToken).pipe(
            switchMap((newAuthResponse) => {
              // Éxito: Clonar la petición original que falló, pero ahora con el NUEVO token
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAuthResponse.token}`
                }
              });
              // Reanudar la petición original (el usuario ni se entera de que falló la primera vez)
              return next(clonedReq);
            }),
            catchError((refreshError) => {
              // Fracaso: El refresh token también caducó (pasaron los 30 días) o es inválido
              authService.logout();
              router.navigate(['/auth/login']);
              if (typeof window !== 'undefined') {
                alert('Tu sesión ha expirado por completo. Por favor, inicia sesión de nuevo.');
              }
              return throwError(() => refreshError);
            })
          );
        } else {
          // No hay refresh token disponible para intentar el rescate
          authService.logout();
          router.navigate(['/auth/login']);
          if (typeof window !== 'undefined') {
            alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
          }
        }
      }
      return throwError(() => error);
    })
  );
};
