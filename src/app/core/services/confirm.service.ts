import { Injectable, signal } from '@angular/core';

export interface ConfirmState {
  isOpen: boolean;
  message: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  state = signal<ConfirmState>({
    isOpen: false,
    message: '',
    onConfirm: null,
    onCancel: null
  });

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({
        isOpen: true,
        message,
        onConfirm: () => {
          this.close();
          resolve(true);
        },
        onCancel: () => {
          this.close();
          resolve(false);
        }
      });
    });
  }

  private close() {
    this.state.update(s => ({ ...s, isOpen: false }));
  }
}
