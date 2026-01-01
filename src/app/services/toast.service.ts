import { Injectable, signal } from "@angular/core";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

@Injectable({
  providedIn: "root",
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(type: ToastType, title: string, message: string, duration = 5000) {
    const id = this.counter++;
    const newToast: Toast = { id, type, title, message };

    this.toasts.update((current) => [...current, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(title: string, message: string) {
    this.show("success", title, message);
  }

  error(title: string, message: string) {
    this.show("error", title, message);
  }

  warning(title: string, message: string) {
    this.show("warning", title, message);
  }

  info(title: string, message: string) {
    this.show("info", title, message);
  }

  remove(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
