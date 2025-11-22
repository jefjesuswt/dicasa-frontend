import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ToastService, ToastType } from "../../services/toast.service";

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      @for (toast of toastService.toasts(); track toast.id) {
      <div
        class="pointer-events-auto relative overflow-hidden bg-slate-950/90 backdrop-blur-md border border-white/10 p-5 shadow-2xl animate-slide-in"
        [ngClass]="getBorderClass(toast.type)"
      >
        <div
          class="absolute inset-0 bg-grid opacity-20 pointer-events-none"
        ></div>

        <div class="relative flex items-start gap-4">
          <div class="flex-shrink-0 mt-1">
            <i [class]="getIconClass(toast.type)" class="text-lg"></i>
          </div>

          <div class="flex-1">
            <h4
              [class]="getTextColor(toast.type)"
              class="text-[10px] font-bold uppercase tracking-widest mb-1"
            >
              {{ toast.title }}
            </h4>
            <p class="text-slate-300 text-xs font-mono leading-relaxed">
              {{ toast.message }}
            </p>
          </div>

          <button
            (click)="toastService.remove(toast.id)"
            class="text-slate-500 hover:text-white transition-colors"
          >
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .bg-grid {
        background-size: 20px 20px;
        background-image: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.05) 1px,
            transparent 1px
          ),
          linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.05) 1px,
            transparent 1px
          );
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .animate-slide-in {
        animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
    `,
  ],
})
export class ToastComponent {
  toastService = inject(ToastService);

  getBorderClass(type: ToastType): string {
    switch (type) {
      case "success":
        return "border-l-2 border-l-sky-500";
      case "error":
        return "border-l-2 border-l-red-500";
      case "warning":
        return "border-l-2 border-l-yellow-500";
      default:
        return "border-l-2 border-l-slate-500";
    }
  }

  getIconClass(type: ToastType): string {
    switch (type) {
      case "success":
        return "pi pi-check-circle text-sky-500";
      case "error":
        return "pi pi-exclamation-circle text-red-500";
      case "warning":
        return "pi pi-exclamation-triangle text-yellow-500";
      default:
        return "pi pi-info-circle text-slate-500";
    }
  }

  getTextColor(type: ToastType): string {
    switch (type) {
      case "success":
        return "text-sky-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-slate-500";
    }
  }
}
