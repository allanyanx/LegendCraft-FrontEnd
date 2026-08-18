import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (confirmService.state().isOpen) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
        <div class="w-full max-w-sm p-6 bg-[#1e1e1e] border border-[#2B2B2B] rounded-2xl shadow-2xl transform scale-100 transition-transform duration-300">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20">
            <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-bold text-center text-white">Confirmar Acción</h3>
          <p class="mb-6 text-sm text-center text-neutral-400">{{ confirmService.state().message }}</p>
          <div class="flex justify-center gap-3">
            <button 
              (click)="onCancel()"
              class="px-5 py-2.5 text-sm font-medium transition-colors border rounded-lg text-neutral-300 border-neutral-600 hover:bg-neutral-800"
            >
              Cancelar
            </button>
            <button 
              (click)="onConfirm()"
              class="px-5 py-2.5 text-sm font-medium text-white transition-colors rounded-lg bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/50"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmService);

  onConfirm() {
    this.confirmService.state().onConfirm?.();
  }

  onCancel() {
    this.confirmService.state().onCancel?.();
  }
}
