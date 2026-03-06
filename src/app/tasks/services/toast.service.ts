import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = 3500) {
    this._add(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    this._add(message, 'error', duration);
  }

  remove(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private _add(message: string, type: 'success' | 'error', duration: number) {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }
}
