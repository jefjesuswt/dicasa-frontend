import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: "auth-check-email",
  standalone: true,
  imports: [RouterModule],
  template: `
    <div
      class="min-h-screen bg-slate-950 text-slate-300 font-sans bg-grid pt-24 pb-16 flex items-center justify-center"
    >
      <div
        class="max-w-md w-full mx-auto p-10 border border-white/10 bg-white/5 backdrop-blur-sm text-center"
      >
        <div class="flex flex-col items-center mb-8">
          <i
            class="pi pi-send text-5xl text-sky-500 mb-6 border-2 border-sky-500 p-2 rounded-none"
          ></i>
          <h2
            class="text-2xl font-bold text-white uppercase tracking-widest mb-4"
          >
            CONFIRMACIÓN PENDIENTE
          </h2>
        </div>

        <p class="mt-2 text-base text-slate-400 font-light leading-relaxed">
          Hemos enviado un <strong>enlace de verificación</strong> a tu
          dirección de correo electrónico. Por favor, haz clic en él para
          activar tu cuenta.
        </p>

        <div class="text-sm text-slate-500 font-mono mt-4">
          (REVISA TU CARPETA DE SPAM SI NO LO ENCUENTRAS)
        </div>

        <div class="mt-8 pt-4 border-t border-white/10">
          <a
            routerLink="/"
            class="font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider text-xs"
          >
            <i class="pi pi-arrow-left text-sky-500 text-[10px] mr-2"></i>
            VOLVER AL SITIO PRINCIPAL
          </a>
        </div>
      </div>
    </div>
  `,
})
export class CheckEmailComponent {}
