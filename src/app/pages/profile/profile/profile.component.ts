import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../services/auth.service";
import { SeoService } from "../../../services/seo.service";

@Component({
  selector: "profile-profile",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div
      class="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] font-sans bg-grid pt-24 pb-24"
    >
      <div class="container mx-auto px-6 max-w-6xl">
        <div class="mb-16">
          <h1
            class="text-3xl md:text-4xl text-[var(--text-heading)] uppercase tracking-[0.2em] mb-4"
          >
            Mi Cuenta
          </h1>
          <div class="h-px w-24 bg-sky-500"></div>
          <p class="mt-6 text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Bienvenido a tu espacio personal. Aquí puedes gestionar tu
            información y revisar tus citas programadas.
          </p>
        </div>

        <div class="flex flex-col md:flex-row items-start gap-12 lg:gap-20">
          <aside class="w-full md:w-64 shrink-0">
            <nav class="flex flex-col border-l border-[var(--border-light)]">
              <a
                routerLink="my-info"
                routerLinkActive="active-link"
                class="group flex items-center justify-between pl-6 pr-4 py-4 border-l-2 border-transparent hover:border-[var(--border-light)] transition-all duration-300"
              >
                <span
                  class="text-sm uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--text-heading)] transition-colors"
                >
                  Perfil
                </span>
                <i
                  class="pi pi-arrow-right text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--text-secondary)]"
                ></i>
              </a>

              <a
                routerLink="my-schedules"
                routerLinkActive="active-link"
                class="group flex items-center justify-between pl-6 pr-4 py-4 border-l-2 border-transparent hover:border-[var(--border-light)] transition-all duration-300"
              >
                <span
                  class="text-sm uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--text-heading)] transition-colors"
                >
                  Agenda
                </span>
                <i
                  class="pi pi-arrow-right text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--text-secondary)]"
                ></i>
              </a>

              @if (isStaff()) {
              <a
                routerLink="my-properties"
                routerLinkActive="active-link"
                class="group flex items-center justify-between pl-6 pr-4 py-4 border-l-2 border-transparent hover:border-[var(--border-light)] transition-all duration-300"
              >
                <span
                  class="text-sm uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--text-heading)] transition-colors"
                >
                  Propiedades
                </span>
                <i
                  class="pi pi-arrow-right text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--text-secondary)]"
                ></i>
              </a>
              }

              <button
                (click)="logout()"
                class="mt-8 pl-6 text-left text-xs font-bold text-red-500/70 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Cerrar Sesión
              </button>
            </nav>
          </aside>

          <main class="flex-1 w-full min-h-[400px]">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* ESTADO ACTIVO: Minimalista */
      /* Borde izquierdo azul sólido y texto blanco */
      .active-link {
        border-left-color: #38bdf8 !important; /* sky-400 */
      }

      .active-link span {
        color: var(--text-heading) !important;
        font-weight: bold;
      }

      .active-link i {
        opacity: 1 !important;
        transform: translateX(0) !important;
        color: #38bdf8 !important;
      }
    `,
  ],
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.updateSeoData(
      "Mi Cuenta",
      "Gestiona tu perfil, citas y configuraciones personales."
    );
  }

  /**
   * Verifica si el usuario es parte del staff (AGENT, MANAGER, ADMIN).
   * Usado para mostrar la sección de propiedades.
   */
  isStaff(): boolean {
    return this.authService.isStaff();
  }

  logout() {
    this.authService.logout();
  }
}
