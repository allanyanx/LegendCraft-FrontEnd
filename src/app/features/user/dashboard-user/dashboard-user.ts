import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe, UpperCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { OrderResponse } from '../../../core/models/order-response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-user',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, UpperCasePipe, ReactiveFormsModule],
  templateUrl: './dashboard-user.html'
})
export class DashboardUser implements OnInit {
  authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  pedidos = signal<OrderResponse[]>([]);
  isLoading = signal(true);
  error = signal('');

  // Estados del perfil
  isEditingProfile = signal(false);
  isUpdatingProfile = signal(false);
  profileSuccess = signal('');
  profileError = signal('');

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required]
  });

  // Estados de contraseña
  isEditingPassword = signal(false);
  isUpdatingPassword = signal(false);
  passwordSuccess = signal('');
  passwordError = signal('');

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', Validators.required]
  });

  ngOnInit() {
    this.cargarPedidos();
    
    // Cargar nombre actual
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName
      });
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
    if (this.profileForm.invalid) return;

    this.profileError.set('');
    this.profileSuccess.set('');
    this.isUpdatingProfile.set(true);

    const formValues = this.profileForm.value;

    this.authService.updateProfile({
      firstName: formValues.firstName!,
      lastName: formValues.lastName!
    }).subscribe({
      next: (res) => {
        this.isUpdatingProfile.set(false);
        this.isEditingProfile.set(false);
        this.profileSuccess.set('Perfil actualizado exitosamente.');
        
        // Actualizar el estado local con el NUEVO token devuelto por el backend
        if (res.token) {
          this.authService.handleAuthResponse(res.token);
        }
      },
      error: (err) => {
        this.isUpdatingProfile.set(false);
        this.profileError.set(err.error?.Message || err.error?.title || 'Error al actualizar perfil');
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    this.passwordError.set('');
    this.passwordSuccess.set('');
    
    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;

    if (newPassword !== confirmNewPassword) {
      this.passwordError.set('La nueva contraseña no coincide con la confirmación.');
      return;
    }

    this.isUpdatingPassword.set(true);

    this.authService.changePassword({
      currentPassword: currentPassword!,
      newPassword: newPassword!
    }).subscribe({
      next: () => {
        this.isUpdatingPassword.set(false);
        this.isEditingPassword.set(false);
        this.passwordSuccess.set('Contraseña actualizada correctamente.');
        this.passwordForm.reset();
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
