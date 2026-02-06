import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComparisonService } from '../../../services/comparison.service';
import { Property } from '../../../interfaces/properties/property.interface';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { effect } from '@angular/core';

import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule],
  template: `
    <div
      class="pt-24 pb-16 min-h-screen bg-[var(--bg-dark)] px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <!-- Header -->
        <div
          class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div class="flex items-center gap-3 mb-2">
              <a
                routerLink="/properties"
                class="text-sky-500 hover:text-sky-400 transition-colors"
              >
                <i class="pi pi-arrow-left text-xl"></i>
              </a>
              <h1
                class="text-3xl font-bold text-[var(--text-heading)] tracking-tight uppercase"
              >
                Comparar Propiedades
              </h1>
            </div>
            <p class="text-[var(--text-secondary)]">
              Analiza las características de tus opciones favoritas.
            </p>
          </div>

          @if (properties().length > 0) {
          <button
            (click)="clear()"
            class="px-4 py-2 text-sm font-bold text-[var(--text-secondary)] border border-[var(--border-light)] hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all self-start sm:self-auto uppercase tracking-wider"
          >
            <i class="pi pi-trash mr-2"></i> Limpiar Todo
          </button>
          }
        </div>

        @if (properties().length === 0) {
        <div
          class="text-center py-24 bg-[var(--bg-panel)] rounded-xl border border-[var(--border-light)] transform transition-all hover:border-[var(--border-hover)] shadow-sm"
        >
          <div
            class="bg-[var(--bg-section-alt)] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm dark:shadow-none"
          >
            <i
              class="pi pi-chart-bar text-4xl text-[var(--text-secondary)]"
            ></i>
          </div>
          <h3 class="text-xl font-bold text-[var(--text-heading)] mb-2">
            No has seleccionado propiedades
          </h3>
          <p class="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
            Explora nuestro catálogo y selecciona hasta 3 propiedades para
            compararlas lado a lado.
          </p>
          <a
            routerLink="/properties"
            class="inline-flex items-center justify-center px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-sky-500/20 uppercase tracking-wide"
          >
            Ir al Catálogo
          </a>
        </div>
        } @else {
        <!-- Comparison Table -->
        <div class="overflow-x-auto pb-4 custom-scrollbar">
          <div class="min-w-[800px]">
            <div
              class="grid grid-cols-[200px_repeat(3,1fr)] gap-0 border border-[var(--border-light)] rounded-xl overflow-hidden bg-[var(--tooltip-bg)] shadow-sm"
            >
              <!-- Row: Image & Title (Verify header logic specifically) -->
              <div
                class="p-6 bg-[var(--bg-section-alt)] flex items-center font-bold text-[var(--text-secondary)] border-r border-b border-[var(--border-light)]"
              >
                Propiedad
              </div>
              @for (prop of properties(); track prop._id) {
              <div
                class="p-6 border-b border-[var(--border-light)] relative group min-w-[280px]"
                [class.border-r]="!$last"
              >
                <button
                  (click)="remove(prop._id)"
                  class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--tooltip-bg)] text-[var(--text-secondary)] hover:bg-red-500 hover:text-white transition-colors z-10 shadow-sm"
                  title="Quitar de la comparación"
                >
                  <i class="pi pi-times text-sm"></i>
                </button>

                <div class="relative h-40 mb-4 rounded-lg overflow-hidden">
                  <img
                    [src]="
                      prop.images[0] ||
                      '/assets/images/placeholder-property.png'
                    "
                    class="w-full h-full object-cover"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                  ></div>
                  <span
                    class="absolute bottom-2 left-2 px-2 py-1 bg-sky-500 text-white text-xs font-bold rounded uppercase tracking-wider"
                  >
                    {{ prop.status === 'sale' ? 'Venta' : 'Alquiler' }}
                  </span>
                </div>

                <h3
                  class="font-bold text-[var(--text-heading)] text-lg mb-1 line-clamp-2 h-[3.5rem]"
                >
                  {{ prop.title }}
                </h3>
                <p
                  class="text-sky-600 dark:text-sky-400 font-mono text-xl font-bold"
                >
                  {{ prop.price | currency : 'USD' : 'symbol' : '1.0-0' }}
                  @if(prop.status === 'rent') {<span
                    class="text-xs text-[var(--text-secondary)]"
                    >/mes</span
                  >}
                </p>
              </div>
              }
              <!-- Fill empty slots if less than 3 -->
              @for (i of getEmptySlots(); track i) {
              <div
                class="p-6 border-b border-[var(--border-light)] bg-[var(--bg-section-alt)] flex flex-col items-center justify-center min-w-[280px]"
                [class.border-r]="i !== getEmptySlots().length - 1"
              >
                <div
                  class="border-2 border-dashed border-[var(--border-light)] rounded-lg w-full h-40 flex items-center justify-center mb-4"
                >
                  <span
                    class="text-[var(--text-secondary)] font-bold uppercase text-xs tracking-wider"
                    >Espacio Vacío</span
                  >
                </div>
              </div>
              }

              <!-- Feature Rows -->
              <!-- Feature Rows -->
              @for (row of comparisonRows; track row.label) {
              <div
                class="p-4 bg-[var(--bg-section-alt)] flex items-center font-medium text-[var(--text-secondary)] text-sm uppercase tracking-wide border-r border-b border-[var(--border-light)]"
              >
                <i [class]="'pi ' + row.icon + ' mr-2 text-sky-500'"></i>
                {{ row.label }}
              </div>
              @for (prop of properties(); track prop._id) {
              <div
                class="p-4 flex items-center font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] min-w-[280px]"
                [class.border-r]="!$last"
              >
                {{ row.getValue(prop) }}
              </div>
              } @for (i of getEmptySlots(); track i) {
              <div
                class="p-4 border-b border-[var(--border-light)] bg-[var(--bg-section-alt)] min-w-[280px]"
                [class.border-r]="i !== getEmptySlots().length - 1"
              ></div>
              } }

              <!-- Actions -->
              <div
                class="p-6 bg-[var(--bg-section-alt)] border-r border-[var(--border-light)]"
              ></div>
              @for (prop of properties(); track prop._id) {
              <div class="p-6 min-w-[280px]" [class.border-r]="!$last">
                <a
                  [routerLink]="['/properties', prop._id]"
                  class="block w-full py-3 bg-[var(--bg-section-alt)] text-[var(--text-primary)] text-center font-bold uppercase tracking-wider text-sm rounded hover:bg-sky-500 hover:text-white transition-colors"
                >
                  Ver Detalles
                </a>
              </div>
              } @for (i of getEmptySlots(); track i) {
              <div
                class="p-6 bg-[var(--bg-section-alt)] min-w-[280px]"
                [class.border-r]="i !== getEmptySlots().length - 1"
              ></div>
              }
            </div>
          </div>
        </div>
        }
      </div>

      <!-- Radar Chart Section (Bottom) -->
      @if (properties().length > 0) {
      <div class="mt-16 flex justify-center relative">
        <!-- Decorative elements -->
        <div
          class="absolute -top-20 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
        ></div>

        <div
          class="relative w-full max-w-4xl bg-[var(--bg-panel)]/50 backdrop-blur-md border border-[var(--border-light)] rounded-2xl p-8 sm:p-12 flex flex-col items-center"
        >
          <h2
            class="text-2xl font-bold text-[var(--text-heading)] mb-2 uppercase tracking-tight"
          >
            Análisis Visual
          </h2>
          <p class="text-[var(--text-secondary)] mb-8 text-center max-w-md">
            Comparativa gráfica de rendimiento y características.
          </p>

          <div class="w-full h-[500px] flex justify-center">
            <p-chart
              type="radar"
              [data]="chartData"
              [options]="chartOptions"
              height="100%"
              width="100%"
            ></p-chart>
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        height: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #38bdf8;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #0ea5e9;
      }
    `,
  ],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class ComparisonComponent {
  comparisonService = inject(ComparisonService);
  properties = this.comparisonService.selectedProperties;

  /* --- CHART LOGIC --- */
  chartData: any;
  chartOptions: any;

  comparisonRows = [
    {
      label: 'Precio',
      icon: 'pi-tag',
      getValue: (p: Property) => '$' + p.price.toLocaleString(),
    },
    {
      label: 'Ubicación',
      icon: 'pi-map-marker',
      getValue: (p: Property) => `${p.address.city}, ${p.address.state}`,
    },
    {
      label: 'Tipo',
      icon: 'pi-home',
      getValue: (p: Property) => this.translateType(p.type),
    },
    {
      label: 'Área',
      icon: 'pi-th-large',
      getValue: (p: Property) => `${p.area} m²`,
    },
    {
      label: 'Habitaciones',
      icon: 'pi-box',
      getValue: (p: Property) => p.bedrooms?.toString() || '-',
    },
    {
      label: 'Baños',
      icon: 'pi-user',
      getValue: (p: Property) => p.bathrooms?.toString() || '-',
    },
    {
      label: 'Estacionamiento',
      icon: 'pi-car',
      getValue: (p: Property) => (p.features.hasParking ? 'Sí' : 'No'),
    },
    {
      label: 'Piscina',
      icon: 'pi-star',
      getValue: (p: Property) => (p.features.hasPool ? 'Sí' : 'No'),
    },
    {
      label: 'Jardín',
      icon: 'pi-sun',
      getValue: (p: Property) => (p.features.hasGarden ? 'Sí' : 'No'),
    },
  ];

  typeLabels: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Casa',
    villa: 'Villa',
    land: 'Terreno',
    commercial: 'Comercial',
  };

  constructor() {
    // Re-calculate chart when properties change
    effect(() => {
      const props = this.properties();
      this.updateChart(props); // Always call update, even if empty (to clear)
    });
  }

  updateChart(props: Property[]) {
    if (props.length === 0) {
      this.chartData = null;
      return;
    }

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-heading');
    const textColorSecondary =
      documentStyle.getPropertyValue('--text-secondary');
    const gridColor = documentStyle.getPropertyValue('--border-light');

    // Data Extraction & Normalization
    const maxPrice = Math.max(...props.map((p) => p.price)) || 1;
    const maxArea = Math.max(...props.map((p) => p.area)) || 1;
    const maxBeds = Math.max(...props.map((p) => p.bedrooms || 0)) || 1;
    const maxBaths = Math.max(...props.map((p) => p.bathrooms || 0)) || 1;
    const maxFeatures = 5;

    const countFeatures = (p: Property) => {
      let score = 0;
      if (p.features.hasParking) score++;
      if (p.features.hasPool) score++;
      if (p.features.hasGarden) score++;
      if (p.features.hasFurniture) score++;
      if (p.features.isPetFriendly) score++;
      return score;
    };

    // Datasets
    const datasets = props.map((prop, index) => {
      const color = this.getColorForIndex(index);
      const featureScore = countFeatures(prop);

      // Normalize data (0-100)
      const normPrice = (prop.price / maxPrice) * 100;
      const normArea = (prop.area / maxArea) * 100;
      const normBeds = ((prop.bedrooms || 0) / maxBeds) * 100;
      const normBaths = ((prop.bathrooms || 0) / maxBaths) * 100;
      const normFeatures = (featureScore / maxFeatures) * 100;

      return {
        label:
          prop.title.substring(0, 15) + (prop.title.length > 15 ? '...' : ''),
        data: [normPrice, normArea, normBeds, normBaths, normFeatures],
        fill: true,
        backgroundColor: color.bg,
        borderColor: color.border,
        pointBackgroundColor: color.border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color.border,
      };
    });

    this.chartData = {
      labels: ['Precio', 'Área', 'Hab.', 'Baños', 'Extras'],
      datasets: datasets,
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      maintainAspectRatio: false,
      scales: {
        r: {
          grid: {
            color: gridColor,
          },
          angleLines: {
            color: gridColor,
          },
          pointLabels: {
            color: textColorSecondary,
            font: {
              size: 12,
              weight: 'bold',
            },
          },
          ticks: {
            display: false,
            stepSize: 20,
          },
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
    };
  }

  getColorForIndex(index: number) {
    const colors = [
      { bg: 'rgba(56, 189, 248, 0.2)', border: '#38bdf8' }, // Sky
      { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7' }, // Purple
      { bg: 'rgba(236, 72, 153, 0.2)', border: '#ec4899' }, // Pink
    ];
    return colors[index % colors.length];
  }

  translateType(type: string): string {
    return this.typeLabels[type] || type;
  }

  remove(id: string) {
    this.comparisonService.removeProperty(id);
  }

  clear() {
    this.comparisonService.clear();
  }

  getEmptySlots(): number[] {
    const slots = 3 - this.properties().length;
    return slots > 0
      ? Array(slots)
          .fill(0)
          .map((_, i) => i)
      : [];
  }
}
