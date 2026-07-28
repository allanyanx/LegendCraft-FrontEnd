import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  error = signal('');
  isLoading = signal(false);

  onSubmit() {
    if (!this.email() || !this.password()) {
      this.error.set('Por favor, completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email(), password: this.password() })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/home']); // Redirigiremos al home o al dashboard
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set('Credenciales incorrectas. Verifica tu correo y contraseña.');
        }
      });
  }
}
