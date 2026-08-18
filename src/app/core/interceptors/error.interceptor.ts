import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado.';
      
      if (err.error) {
        if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error.errors && Array.isArray(err.error.errors)) {
          errorMessage = err.error.errors.join(' | ');
        } else if (err.error.Errors && Array.isArray(err.error.Errors)) {
          errorMessage = err.error.Errors.join(' | ');
        } else if (err.error.message) {
          errorMessage = err.error.message;
        } else if (err.error.Message) {
          errorMessage = err.error.Message;
        } else if (err.error.title) {
          errorMessage = err.error.title;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return throwError(() => new Error(errorMessage));
    })
  );
};
