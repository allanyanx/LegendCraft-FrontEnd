import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
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

  return next(req);
};
