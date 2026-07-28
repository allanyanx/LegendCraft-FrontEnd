import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-faq-item',
  standalone: true,
  template: `
    <div class="border-b border-neutral-800 pb-4">
      <button
        (click)="isOpen.set(!isOpen())"
        class="w-full flex items-center gap-3 text-left text-neutral-200 hover:text-[#E53935] transition-colors font-medium py-2 outline-none"
      >
        <span class="text-white text-xl font-bold w-6 text-center transition-transform" [class.rotate-45]="isOpen()">
          +
        </span>
        {{ question() }}
      </button>
      
      @if (isOpen()) {
        <div class="mt-2 pl-9 text-neutral-400 text-sm opacity-100 transition-opacity">
          {{ answer() }}
        </div>
      }
    </div>
  `
})
export class FaqItem {
  question = input.required<string>();
  answer = input.required<string>();
  isOpen = signal(false);
}
