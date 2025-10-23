import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col min-h-[calc(100vh-4rem)] justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 mx-auto text-center">
        
        @switch (status()) {
          @case ('loading') {
            <div class="flex justify-center">
              <div 
                class="h-16 w-16 animate-spin rounded-full border-4 border-solid border-sky-600 border-t-transparent"
                role="status"
              ></div>
            </div>
            <h2 class="mt-6 text-2xl font-bold text-gray-900">
              Verificando tu cuenta...
            </h2>
          }
          @case ('success') {
            <i class="pi pi-check-circle text-6xl text-green-600"></i>
            <h2 class="mt-6 text-2xl font-bold text-gray-900">
              ¡Cuenta Verificada!
            </h2>
            <p class="mt-2 text-lg text-gray-600">
              Has sido logueado exitosamente. Serás redirigido...
            </p>
          }
          @case ('error') {
            <i class="pi pi-times-circle text-6xl text-red-600"></i>
            <h2 class="mt-6 text-2xl font-bold text-gray-900">
              Error de Verificación
            </h2>
            <p class="mt-2 text-lg text-gray-600">
              {{ errorMessage() }}
            </p>
            <div class="mt-6">
              <a routerLink="/auth/login" class="font-medium text-sky-600 hover:text-sky-500">
                Volver a inicio de sesión
              </a>
            </div>
          }
        }

      </div>
    </div>
  `
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  public status = signal<'loading' | 'success' | 'error'>('loading');
  public errorMessage = signal('El enlace de confirmación no es válido o ha expirado.');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('error');
      return;
    }

    this.authService.confirmEmail(token).subscribe({
      next: () => {
        this.status.set('success');
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (errMessage) => {
        this.errorMessage.set(errMessage);
        this.status.set('error');
      }
    });
  }
}