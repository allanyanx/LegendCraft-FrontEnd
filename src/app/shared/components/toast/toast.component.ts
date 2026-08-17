import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto flex items-start gap-4 px-4 py-4 rounded-2xl shadow-2xl min-w-[320px] max-w-sm border transform transition-all duration-300 bg-[#161616]/90 backdrop-blur-xl"
          [ngClass]="{
            'border-emerald-500/20 shadow-emerald-900/10': toast.type === 'success',
            'border-rose-500/20 shadow-rose-900/10': toast.type === 'error',
            'border-sky-500/20 shadow-sky-900/10': toast.type === 'info'
          }"
          @fadeSlide
        >
          @if (toast.type === 'success') {
            <div class="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
          }
          @if (toast.type === 'error') {
            <div class="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0 border border-rose-500/20">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
          }
          @if (toast.type === 'info') {
            <div class="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0 border border-sky-500/20">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          }
          
          <div class="flex-1 pt-0.5">
            <h4 class="text-sm font-semibold text-white mb-0.5">
              {{ toast.type === 'success' ? 'Éxito' : toast.type === 'error' ? 'Hubo un problema' : 'Información' }}
            </h4>
            <p class="text-[13px] text-neutral-400 leading-relaxed pr-2">{{ toast.message }}</p>
          </div>

          <button (click)="toastService.remove(toast.id)" class="text-neutral-500 hover:text-neutral-300 bg-transparent hover:bg-white/5 rounded-lg p-1.5 transition-colors shrink-0 -mt-1 -mr-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      }
    </div>
  `,
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(100%) scale(0.95)' }),
        animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(100%) scale(0.95)' }))
      ])
    ])
  ]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
