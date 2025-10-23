import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'auth-check-email',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="flex flex-col min-h-[calc(100vh-4rem)] justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 mx-auto text-center">
        <i class="pi pi-send text-6xl text-sky-600"></i>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          ¡Casi listo! Revisa tu correo
        </h2>
        <p class="mt-2 text-lg text-gray-600">
          Hemos enviado un enlace de confirmación a tu dirección de correo electrónico.
        </p>
        <p class="text-sm text-gray-500">
          (Si no lo ves, revisa tu carpeta de spam)
        </p>
        <div class="mt-6">
          <a routerLink="/" class="font-medium text-sky-600 hover:text-sky-500">
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  `
})
export class CheckEmailComponent { }