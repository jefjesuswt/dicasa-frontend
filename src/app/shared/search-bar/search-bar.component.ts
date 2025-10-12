import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type PropertyType = 'apartment' | 'house' | 'villa' | 'land' | 'commercial';

interface SearchParams {
  query: string;
  type: string;
}

@Component({
  selector: 'shared-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow p-4 sm:p-6">
      <div class="flex flex-col md:flex-row items-end gap-3 w-full">
        <!-- Location Input -->
        <div class="w-full md:flex-1 md:min-w-[200px]">
          <label class="block text-xs font-medium text-gray-600 mb-1">
            {{ label || 'Ubicación' }}
          </label>
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              [placeholder]="placeholder || 'Ingresa una ubicación...'"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent h-[38px]"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i class="fas fa-map-marker-alt text-gray-400 text-sm"></i>
            </div>
          </div>
        </div>
        
        <!-- Property Type Dropdown -->
        <div class="w-full md:w-48" *ngIf="showTypeFilter">
          <label for="property-type" class="block text-xs font-medium text-gray-600 mb-1">
            {{ typeLabel || 'Tipo de Propiedad' }}
          </label>
          <div class="relative">
            <select 
              id="property-type"
              [(ngModel)]="selectedType"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent h-[38px] appearance-none bg-white"
            >
              <option [value]="''">Todos los tipos</option>
              <option *ngFor="let type of propertyTypes" [value]="type">
                {{ getTypeTranslation(type) }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
            </div>
          </div>
        </div>

        <!-- Search Button -->
        <button
          (click)="onSearch()"
          class="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-lg transition-colors h-[38px] flex-shrink-0 flex items-center justify-center"
        >
          <i class="fas fa-search"></i>
          {{ buttonText || 'Buscar' }}
        </button>
      </div>
    </div>
  `,
})
export class SearchBarComponent {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() buttonText?: string;
  @Input() typeLabel?: string;
  @Input() showTypeFilter: boolean = true;
  @Output() search = new EventEmitter<SearchParams>();

  searchQuery: string = '';
  selectedType: string = '';
  propertyTypes: PropertyType[] = ['apartment', 'house', 'villa', 'land', 'commercial'];

  getTypeTranslation(type: string): string {
    const translations: { [key: string]: string } = {
      'apartment': 'Apartamento',
      'house': 'Casa',
      'villa': 'Villa',
      'land': 'Terreno',
      'commercial': 'Comercial',
    };
    return translations[type] || type;
  }

  onSearch(): void {
    this.search.emit({
      query: this.searchQuery,
      type: this.selectedType
    });
  }
}
