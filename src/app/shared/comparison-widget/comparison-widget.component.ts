import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComparisonService } from '../../services/comparison.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'shared-comparison-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (count() > 0) {
    <div
      @slideInOut
      class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
    >
      <div
        class="bg-[var(--tooltip-bg)] backdrop-blur-lg border border-sky-500/30 rounded-lg shadow-2xl overflow-hidden min-w-[300px]"
      >
        <!-- Header -->
        <div
          class="px-4 py-3 bg-[var(--bg-section-alt)] border-b border-sky-500/20 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <i class="pi pi-chart-bar text-sky-500 dark:text-sky-400"></i>
            <span
              class="text-[var(--text-heading)] font-bold text-sm tracking-wide uppercase"
              >Comparador</span
            >
          </div>
          <span
            class="bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
          >
            {{ count() }} / 3
          </span>
        </div>

        <!-- Content -->
        <div class="p-4">
          <p class="text-[var(--text-secondary)] text-sm mb-4">
            Has seleccionado {{ count() }} propiedad{{
              count() !== 1 ? 'es' : ''
            }}
            para comparar.
          </p>

          <div class="flex gap-2">
            <button
              (click)="clear()"
              class="flex-1 px-3 py-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider hover:text-[var(--text-heading)] hover:bg-[var(--bg-section-alt)] rounded transition-all"
            >
              Limpiar
            </button>
            <a
              routerLink="/properties/compare"
              class="flex-1 px-3 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold uppercase tracking-wider rounded text-center transition-all shadow-lg shadow-sky-500/20"
            >
              Comparar
            </a>
          </div>
        </div>
      </div>
    </div>
    }
  `,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class ComparisonWidgetComponent {
  private comparisonService = inject(ComparisonService);

  count = this.comparisonService.count;

  clear() {
    this.comparisonService.clear();
  }
}
