import { Component, Input } from "@angular/core";
import { StatCard } from "../../../interfaces/dashboard/stat-card.interface";

@Component({
  selector: "dashboard-stat-cards",
  imports: [],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      @if (loading) { @for (i of [1, 2, 3, 4]; track i) {
      <div class="bg-white rounded-lg shadow p-6 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div class="h-8 bg-gray-300 rounded w-1/3"></div>
      </div>
      } } @else { @for (stat of stats; track stat.title) {
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">{{ stat.title }}</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">
              {{ stat.value }}
            </p>
          </div>
          <div class="p-3">
            <i [class]="stat.icon + ' ' + stat.textColor + ' text-xl'"></i>
          </div>
        </div>
      </div>
      } }
    </div>
  `,
})
export class StatCardsComponent {
  @Input() stats: StatCard[] = [];
  @Input() loading: boolean = false;
}
