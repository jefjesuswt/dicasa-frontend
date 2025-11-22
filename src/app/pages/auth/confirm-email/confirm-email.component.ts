import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-confirm-email",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="min-h-screen bg-slate-950 text-slate-300 font-sans bg-grid pt-24 pb-16 flex items-center justify-center"
    >
      <div
        class="max-w-md w-full mx-auto p-10 border border-white/10 bg-white/5 backdrop-blur-sm text-center"
      >
        @switch (status()) { @case ('loading') {
        <div class="flex flex-col items-center">
          <div
            class="h-12 w-12 animate-spin border-4 border-white/20 border-t-sky-500 rounded-none mb-6"
            role="status"
          ></div>
          <h2
            class="text-xl font-bold text-white uppercase tracking-widest mb-2"
          >
            Verificando Credenciales
          </h2>
          <p
            class="text-sm text-slate-500 font-mono uppercase tracking-wider animate-pulse"
          >
            [ ESTABLECIENDO CONEXIÓN SEGURA ]
          </p>
        </div>
        } @case ('success') {
        <div class="flex flex-col items-center">
          <i
            class="pi pi-check-circle text-6xl text-emerald-500 mb-6 border-2 border-emerald-500 p-2 rounded-none"
          ></i>
          <h2
            class="text-2xl font-bold text-white uppercase tracking-widest mb-4"
          >
            ¡Cuenta Verificada!
          </h2>
          <p class="text-base text-slate-400 font-light leading-relaxed">
            Tu acceso ha sido confirmado. Serás redirigido al panel principal.
          </p>
          <div
            class="mt-6 text-sm text-sky-500 font-mono uppercase tracking-wider"
          >
            [ REDIRECCIONANDO EN 2 SEG... ]
          </div>
        </div>
        } @case ('error') {
        <div class="flex flex-col items-center">
          <i
            class="pi pi-times-circle text-6xl text-red-500 mb-6 border-2 border-red-500 p-2 rounded-none"
          ></i>
          <h2
            class="mt-6 text-2xl font-bold text-white uppercase tracking-widest mb-4"
          >
            Error de Verificación
          </h2>
          <p class="text-sm text-red-400 font-light leading-relaxed">
            {{ errorMessage() }}
          </p>
          <div class="mt-8">
            <a
              routerLink="/auth/login"
              class="px-6 py-3 bg-white hover:bg-red-500 hover:text-white text-slate-950 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              VOLVER AL ACCESO
            </a>
          </div>
        </div>
        } }
      </div>
    </div>
  `,
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  public status = signal<"loading" | "success" | "error">("loading");
  public errorMessage = signal(
    "El enlace de confirmación no es válido o ha expirado."
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get("token");

    if (!token) {
      this.status.set("error");
      return;
    }

    this.authService.confirmEmail(token).subscribe({
      next: () => {
        this.status.set("success");
        setTimeout(() => {
          this.router.navigate(["/"]);
        }, 2000);
      },
      error: (errMessage) => {
        this.errorMessage.set(errMessage);
        this.status.set("error");
      },
    });
  }
}
