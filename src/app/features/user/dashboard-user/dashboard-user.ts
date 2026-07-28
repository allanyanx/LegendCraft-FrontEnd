import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { OrderResponse } from '../../../core/models/order-response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-user',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, UpperCasePipe, FormsModule],
  templateUrl: './dashboard-user.html'
})
export class DashboardUser implements OnInit {
  authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  pedidos = signal<OrderResponse[]>([]);
  isLoading = signal(true);
  error = signal('');

  // Estados del perfil
  profileFirstName = signal('');
  profileLastName = signal('');
  isEditingProfile = signal(false);
  isUpdatingProfile = signal(false);
  profileSuccess = signal('');
  profileError = signal('');

  // Estados de contraseña
  currentPassword = signal('');
  newPassword = signal('');
  confirmNewPassword = signal('');
  isEditingPassword = signal(false);
  isUpdatingPassword = signal(false);
  passwordSuccess = signal('');
  passwordError = signal('');

  ngOnInit() {
    this.cargarPedidos();
    
    // Cargar nombre actual
    const user = this.authService.currentUser();
    if (user) {
      this.profileFirstName.set(user.firstName);
      if (user.lastName) {
        this.profileLastName.set(user.lastName);
      }
    }
  }

  cargarPedidos() {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar tus pedidos.');
        this.isLoading.set(false);
      }
    });
  }

  updateProfile() {
    this.profileError.set('');
    this.profileSuccess.set('');
    this.isUpdatingProfile.set(true);

    this.authService.updateProfile({
      firstName: this.profileFirstName(),
      lastName: this.profileLastName()
    }).subscribe({
      next: () => {
        this.isUpdatingProfile.set(false);
        this.isEditingProfile.set(false);
        this.profileSuccess.set('Perfil actualizado exitosamente.');
        
        // Actualizar el estado local para que el Header lo refleje inmediatamente
        const user = this.authService.currentUser();
        if (user) {
          const updatedUser = { ...user, firstName: this.profileFirstName(), lastName: this.profileLastName() };
          this.authService.currentUser.set(updatedUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      },
      error: (err) => {
        this.isUpdatingProfile.set(false);
        this.profileError.set(err.error?.Message || err.error?.title || 'Error al actualizar perfil');
      }
    });
  }

  changePassword() {
    this.passwordError.set('');
    this.passwordSuccess.set('');
    
    if (this.newPassword() !== this.confirmNewPassword()) {
      this.passwordError.set('La nueva contraseña no coincide con la confirmación.');
      return;
    }

    this.isUpdatingPassword.set(true);

    this.authService.changePassword({
      currentPassword: this.currentPassword(),
      newPassword: this.newPassword()
    }).subscribe({
      next: () => {
        this.isUpdatingPassword.set(false);
        this.isEditingPassword.set(false);
        this.passwordSuccess.set('Contraseña actualizada correctamente.');
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmNewPassword.set('');
      },
      error: (err) => {
        this.isUpdatingPassword.set(false);
        let msj = 'Ocurrió un error al cambiar la contraseña.';
        if (err.error?.errors && Array.isArray(err.error.errors)) {
          msj = err.error.errors.join(' | ');
        } else if (err.error?.Errors && Array.isArray(err.error.Errors)) {
          msj = err.error.Errors.join(' | ');
        } else if (err.error?.message) {
          msj = err.error.message;
        } else if (err.error?.Message) {
          msj = err.error.Message;
        }
        this.passwordError.set(msj);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
