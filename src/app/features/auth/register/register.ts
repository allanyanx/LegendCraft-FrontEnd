import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  firstName = signal('');
  lastName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  error = signal('');
  isLoading = signal(false);

  onSubmit() {
    if (!this.email() || !this.password() || !this.confirmPassword() || !this.firstName() || !this.lastName()) {
      this.error.set('Por favor, completa todos los campos.');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden. Por favor, verifícalas.');
      return;
    }

    if (this.password().length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService.register({
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email(),
      password: this.password()
    }).subscribe({
        next: () => {
          this.isLoading.set(false);
          // Después de registrarse exitosamente, lo enviamos al login
          this.router.navigate(['/auth/login']); 
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Error completo:', err);
          
          let mensajeError = 'Ocurrió un error al registrarse.';
          
          if (err.error) {
            // El backend usa camelCase por defecto para serializar, así que buscamos .message y .errors
            if (err.error.errors && Array.isArray(err.error.errors) && err.error.errors.length > 0) {
              // Si el backend nos mandó la lista de errores de Identity (ej. "La contraseña necesita una mayúscula")
              mensajeError = err.error.errors.join(' | ');
            } else if (err.error.Errors && Array.isArray(err.error.Errors) && err.error.Errors.length > 0) {
              mensajeError = err.error.Errors.join(' | ');
            } else if (err.error.message) {
              mensajeError = err.error.message;
            } else if (err.error.Message) {
              mensajeError = err.error.Message;
            } else if (err.error.title) {
              mensajeError = err.error.title;
            }
            
            // Si el backend falló por validación de modelo (BadRequest normal), 'errors' es un objeto
            if (err.error.errors && !Array.isArray(err.error.errors)) {
              mensajeError = "Datos inválidos. Revisa el formato de correo o contraseña.";
            }
          }
          
          this.error.set(mensajeError);
        }
      });
  }
}
