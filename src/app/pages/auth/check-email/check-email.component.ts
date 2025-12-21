import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: "auth-check-email",
  standalone: true,
  imports: [RouterModule],
  template: `
    <div
      class="min-h-screen bg-[var(--bg-dark)] text-[var(--text-secondary)] font-sans bg-grid pt-24 pb-16 flex items-center justify-center"
    >
      <div
        class="max-w-md w-full mx-auto p-10 border border-[var(--border-light)] bg-[var(--bg-panel)] backdrop-blur-sm text-center"
      >
        <div class="flex flex-col items-center mb-8">
          <i
            class="pi pi-send text-5xl text-sky-500 mb-6 border-2 border-sky-500 p-2 rounded-none"
          ></i>
          <h2
            class="text-2xl font-bold text-[var(--text-heading)] uppercase tracking-widest mb-4"
          >
            CONFIRMACIÓN PENDIENTE
          </h2>
        </div>

        <p class="mt-2 text-base text-[var(--text-secondary)] font-light leading-relaxed">
          Hemos enviado un <strong>enlace de verificación</strong> a tu
          dirección de correo electrónico. Por favor, haz clic en él para
          activar tu cuenta.
        </p>

        <div class="text-sm text-[var(--text-secondary)] font-mono mt-4">
          (REVISA TU CARPETA DE SPAM SI NO LO ENCUENTRAS)
        </div>

        <div class="mt-8 pt-4 border-t border-[var(--border-light)]">
          <a
            routerLink="/"
            class="font-bold text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition-colors uppercase tracking-wider text-xs"
          >
            <i class="pi pi-arrow-left text-sky-500 text-[10px] mr-2"></i>
            VOLVER AL SITIO PRINCIPAL
          </a>
        </div>
      </div>
    </div>
  `,
})
export class CheckEmailComponent { }
