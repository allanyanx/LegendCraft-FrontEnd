import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-3xl">
      <h2 class="text-2xl font-bold text-white mb-6 pb-2 border-b border-neutral-800">Mi Perfil (Admin)</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Modificar Datos -->
        <div class="bg-[#1A1A1A] p-6 rounded-xl border border-[#2B2B2B]">
          <h3 class="text-lg font-bold text-white mb-4">Datos Personales</h3>
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Nombre</label>
              <input type="text" formControlName="firstName" class="w-full bg-[#2B2B2B] border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E53935]" placeholder="Nombre" />
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Apellido</label>
              <input type="text" formControlName="lastName" class="w-full bg-[#2B2B2B] border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E53935]" placeholder="Apellido" />
            </div>
            @if (profileSuccess()) { <p class="text-green-500 text-xs">{{ profileSuccess() }}</p> }
            @if (profileError()) { <p class="text-red-500 text-xs">{{ profileError() }}</p> }
            <button type="submit" [disabled]="isUpdatingProfile() || profileForm.invalid" class="w-full bg-[#E53935] hover:bg-[#8E0000] text-white font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              {{ isUpdatingProfile() ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </form>
        </div>

        <!-- Cambiar Contraseña -->
        <div class="bg-[#1A1A1A] p-6 rounded-xl border border-[#2B2B2B]">
          <h3 class="text-lg font-bold text-white mb-4">Seguridad</h3>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Contraseña Actual</label>
              <input type="password" formControlName="currentPassword" class="w-full bg-[#2B2B2B] border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E53935]" />
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Nueva Contraseña</label>
              <input type="password" formControlName="newPassword" class="w-full bg-[#2B2B2B] border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E53935]" />
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Confirmar Nueva Contraseña</label>
              <input type="password" formControlName="confirmNewPassword" class="w-full bg-[#2B2B2B] border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E53935]" />
            </div>
            @if (passwordSuccess()) { <p class="text-green-500 text-xs">{{ passwordSuccess() }}</p> }
            @if (passwordError()) { <p class="text-red-500 text-xs">{{ passwordError() }}</p> }
            <button type="submit" [disabled]="isUpdatingPassword() || passwordForm.invalid" class="w-full bg-white hover:bg-neutral-200 text-black font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              {{ isUpdatingPassword() ? 'Actualizando...' : 'Cambiar Contraseña' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required]
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', Validators.required]
  });

  isUpdatingProfile = signal(false);
  profileSuccess = signal('');
  profileError = signal('');

  isUpdatingPassword = signal(false);
  passwordSuccess = signal('');
  passwordError = signal('');

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName
      });
    }
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    this.isUpdatingProfile.set(true);
    this.profileSuccess.set('');
    this.profileError.set('');

    const formValues = this.profileForm.value;
    this.authService.updateProfile({
      firstName: formValues.firstName!,
      lastName: formValues.lastName!
    }).subscribe({
      next: (res) => {
        this.isUpdatingProfile.set(false);
        this.profileSuccess.set('Perfil actualizado exitosamente.');
        if (res.token) {
          this.authService.handleAuthResponse(res.token);
        }
      },
      error: (err) => {
        this.isUpdatingProfile.set(false);
        this.profileError.set(err.error?.Message || 'Error al actualizar perfil');
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.isUpdatingPassword.set(true);
    this.passwordSuccess.set('');
    this.passwordError.set('');
    
    const { currentPassword, newPassword, confirmNewPassword } = this.passwordForm.value;

    if (newPassword !== confirmNewPassword) {
      this.passwordError.set('La nueva contraseña no coincide con la confirmación.');
      this.isUpdatingPassword.set(false);
      return;
    }

    this.authService.changePassword({
      currentPassword: currentPassword!,
      newPassword: newPassword!
    }).subscribe({
      next: () => {
        this.isUpdatingPassword.set(false);
        this.passwordSuccess.set('Contraseña actualizada correctamente.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isUpdatingPassword.set(false);
        this.passwordError.set(err.error?.Message || 'Ocurrió un error al cambiar la contraseña.');
      }
    });
  }
}
