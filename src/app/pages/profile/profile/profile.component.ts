import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "profile-profile",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 my-12">
      <div class="flex flex-col md:flex-row gap-8">
        <aside class="md:w-1/4">
          <nav class="flex flex-col space-y-2">
            <a
              routerLink="my-info"
              routerLinkActive="bg-sky-100 text-sky-700 font-semibold"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <i class="pi pi-user text-xl"></i>
              <span class="text-base">Información Personal</span>
            </a>

            <a
              routerLink="my-schedules"
              routerLinkActive="bg-sky-100 text-sky-700 font-semibold"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <i class="pi pi-calendar text-xl"></i>
              <span class="text-base">Mis Citas</span>
            </a>

            @if (isAdmin() || isSuperAdmin()) {
            <a
              routerLink="my-properties"
              routerLinkActive="bg-sky-100 text-sky-700 font-semibold"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <i class="pi pi-home text-xl"></i>
              <span class="text-base">Mis Propiedades</span>
            </a>
            }
          </nav>
        </aside>

        <main
          class="md:w-3/4 bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200"
        >
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  private authService = inject(AuthService);

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }
}
