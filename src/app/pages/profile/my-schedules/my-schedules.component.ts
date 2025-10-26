import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-schedules',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      Mis Citas
    </h2>
    <div class="border-l-4 border-sky-400 bg-sky-50 p-4 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="pi pi-info-circle text-sky-500 text-xl"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm text-sky-700">
            Aquí aparecerán tus citas programadas con asesor.
            <br>
            Esta funcionalidad estará disponible próximamente.
          </p>
        </div>
      </div>
    </div>
  `
})
export class MySchedulesComponent {}