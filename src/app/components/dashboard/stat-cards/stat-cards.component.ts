import { Component, Input } from "@angular/core";
import { StatCard } from "../../../interfaces/dashboard/stat-card.interface";

@Component({
  selector: "dashboard-stat-cards",
  standalone: true,
  imports: [],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      @if (loading) { @for (i of [1, 2, 3, 4]; track i) {
      <div
        class="bg-[var(--bg-panel)] border border-[var(--border-light)] p-6 animate-pulse relative overflow-hidden"
      >
        <div class="flex justify-between items-start">
          <div class="w-full">
            <div class="h-3 bg-white/10 rounded w-1/2 mb-4"></div>
            <div class="h-8 bg-white/10 rounded w-1/3"></div>
          </div>
          <div class="h-10 w-10 bg-white/10 rounded"></div>
        </div>
      </div>
      } } @else { @for (stat of stats; track stat.title) {
      <div
        class="group relative bg-[var(--bg-card)] border border-[var(--border-light)] p-6 hover:bg-[var(--bg-elevated)] transition-colors overflow-hidden"
      >
        <div
          class="absolute top-0 left-0 w-0.5 h-0 bg-sky-500 transition-all duration-500 ease-out group-hover:h-full"
        ></div>

        <div class="flex items-start justify-between relative z-10">
          <div>
            <p
              class="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2"
            >
              {{ stat.title }}
            </p>
            <p class="text-3xl font-bold text-[var(--text-heading)] tracking-tight">
              {{ stat.value }}
            </p>
          </div>

          <div
            class="p-3 bg-[var(--bg-panel)] border border-[var(--border-light)] rounded-sm group-hover:border-sky-500/30 group-hover:text-sky-400 text-[var(--text-muted)] transition-all duration-300"
          >
            <i [class]="stat.icon + ' text-xl'"></i>
          </div>
        </div>

        <div
          class="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        ></div>
      </div>
      } }
    </div>
  `,
})
export class StatCardsComponent {
  @Input() stats: StatCard[] = [];
  @Input() loading: boolean = false;
}
