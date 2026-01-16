import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { debounceTime, distinctUntilChanged, Subject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface SearchParams {
  query: string;
  selectedValue: string;
  // Advanced filters
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: "shared-search-bar",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full bg-white dark:bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-light)] shadow-sm rounded-2xl overflow-hidden transition-all duration-300">
      <!-- Search Bar -->
      <div class="p-4 md:p-5">
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <i class="pi pi-search text-[var(--text-secondary)] text-sm"></i>
            </div>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onQueryChange($event)"
              (keyup.enter)="onSearch()"
              [placeholder]="placeholder || 'Buscar por ubicación, ciudad, zona...'"
              class="w-full bg-slate-50 dark:bg-[var(--bg-panel)] text-[var(--text-heading)] placeholder-[var(--text-secondary)] text-sm pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-light)] focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all"
            />
          </div>
          <button
            (click)="onSearch()"
            class="md:w-auto bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95">
            <i class="pi pi-search text-sm"></i>
            <span>Buscar</span>
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      @if (showAdvancedFilters) {
        <!-- Active Filters Pills -->
        @if (getActiveFiltersCount() > 0) {
          <div class="px-4 md:px-6 pb-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Filtros activos:</span>
              
              @if (selectedValue !== 'all') {
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-sm font-medium border border-sky-500/20">
                  <span>{{ dropdownLabel }}: {{ getSelectedTypeLabel() }}</span>
                  <button (click)="selectedValue = 'all'; onSearch()" class="hover:bg-sky-500/20 rounded-full p-0.5 transition-colors">
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>
              }
              
              @if (currentStatus !== 'all') {
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-sm font-medium border border-sky-500/20">
                  <span>Estatus: {{ getSelectedStatusLabel() }}</span>
                  <button (click)="currentStatus = 'all'; onSearch()" class="hover:bg-sky-500/20 rounded-full p-0.5 transition-colors">
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>
              }
              
              @if (minPrice) {
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-sm font-medium border border-sky-500/20">
                  <span>Desde: $ {{ minPrice }}</span>
                  <button (click)="minPrice = null; onSearch()" class="hover:bg-sky-500/20 rounded-full p-0.5 transition-colors">
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>
              }
              
              @if (maxPrice) {
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-sm font-medium border border-sky-500/20">
                  <span>Hasta: $ {{ maxPrice }}</span>
                  <button (click)="maxPrice = null; onSearch()" class="hover:bg-sky-500/20 rounded-full p-0.5 transition-colors">
                    <i class="pi pi-times text-xs"></i>
                  </button>
                </div>
              }
              

              
              <button 
                (click)="clearAdvancedFilters()"
                class="text-sm font-semibold text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 uppercase tracking-wide transition-colors ml-1">
                Limpiar todos
              </button>
            </div>
          </div>
        }

        <!-- Filter Controls - Always Visible -->
        <div class="px-4 md:px-6 py-5 bg-white/50 dark:bg-[var(--bg-panel)] border-t border-[var(--border-light)]">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            
            <!-- Type Filter -->
            @if (showDropdown && dropdownOptions.length > 0) {
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <i class="pi pi-building text-sm"></i>
                  {{ dropdownLabel || "Tipo" }}
                </label>
                <select 
                  [(ngModel)]="selectedValue"
                  (change)="onSearch()"
                  class="bg-slate-50 dark:bg-[var(--bg-dark)] text-[var(--text-heading)] text-sm px-3 py-2.5 pr-10 rounded-xl border border-[var(--border-light)] hover:border-sky-500/50 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all cursor-pointer appearance-none custom-select">
                  <option value="all">Todos</option>
                  @for(opt of dropdownOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
            }
            
            <!-- Status Filter -->
            @if (statusOptions.length > 0) {
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <i class="pi pi-tag text-sm"></i>
                  Estatus
                </label>
                <select 
                  [(ngModel)]="currentStatus"
                  (change)="onSearch()"
                  class="bg-slate-50 dark:bg-[var(--bg-dark)] text-[var(--text-heading)] text-sm px-3 py-2.5 pr-10 rounded-xl border border-[var(--border-light)] hover:border-sky-500/50 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all cursor-pointer appearance-none custom-select">
                  @for(opt of statusOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
            }

            <!-- Min Price -->
            @if (showPriceFilters) {
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <i class="pi pi-dollar text-sm"></i>
                  Precio Mínimo
                </label>
                <input 
                  type="number" 
                  [(ngModel)]="minPrice"
                  (change)="onSearch()"
                  placeholder="0"
                  class="bg-slate-50 dark:bg-[var(--bg-panel)] text-[var(--text-heading)] text-sm px-3 py-2.5 rounded-xl border border-[var(--border-light)] hover:border-sky-500/50 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all placeholder:text-[var(--text-secondary)]">
              </div>
            }

            <!-- Max Price -->
            @if (showPriceFilters) {
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <i class="pi pi-dollar text-sm"></i>
                  Precio Máximo
                </label>
                <input 
                  type="number" 
                  [(ngModel)]="maxPrice"
                  (change)="onSearch()"
                  placeholder="Sin límite"
                  class="bg-slate-50 dark:bg-[var(--bg-panel)] text-[var(--text-heading)] text-sm px-3 py-2.5 rounded-xl border border-[var(--border-light)] hover:border-sky-500/50 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all placeholder:text-[var(--text-secondary)]">
              </div>
            }

            <!-- Sort -->
            @if (sortOptions.length > 0) {
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                  <i class="pi pi-sort-alt text-sm"></i>
                  Ordenar
                </label>
                <select 
                  [ngModel]="selectedSort + selectedOrder"
                  (change)="onSortChange($event); onSearch()"
                  class="bg-slate-50 dark:bg-[var(--bg-dark)] text-[var(--text-heading)] text-sm px-3 py-2.5 pr-10 rounded-xl border border-[var(--border-light)] hover:border-sky-500/50 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all cursor-pointer appearance-none custom-select">
                  @for(opt of sortOptions; track opt.label) {
                    <option [value]="opt.value + opt.order">{{ opt.label }}</option>
                  }
                </select>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      /* Animación de entrada */
      .animate-fade-in {
        animation: fadeIn 0.2s ease-out forwards;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Scrollbar minimalista oscura */
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: var(--bg-dark);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--border-light);
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: var(--color-primary);
      }

      /* Custom Select Arrow */
      .custom-select {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        background-size: 1rem;
        color-scheme: light;
      }

      .dark .custom-select {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        color-scheme: dark;
      }

      /* Fix autofill chrome */
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px var(--bg-dark) inset !important;
        -webkit-text-fill-color: var(--text-heading) !important;
        caret-color: var(--text-heading) !important;
        transition: background-color 5000s ease-in-out 0s;
      }
    `,
  ],
})
export class SearchBarComponent implements OnInit {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() buttonText?: string;

  @Input() dropdownLabel?: string;
  @Input() showDropdown: boolean = true;
  @Input() dropdownOptions: DropdownOption[] = [];

  // Advanced filters - Optional
  @Input() showAdvancedFilters: boolean = false;
  @Input() showPriceFilters: boolean = true;
  @Input() statusOptions: DropdownOption[] = [];
  @Input() sortOptions: { label: string; value: string; order: string }[] = [];

  // Sync sorting from parent
  @Input() set currentSortBy(val: string | undefined) {
    if (val) this.selectedSort = val;
  }
  @Input() set currentSortOrder(val: 'asc' | 'desc' | undefined) {
    if (val) this.selectedOrder = val;
  }

  @Output() search = new EventEmitter<SearchParams>();

  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  searchQuery: string = "";
  selectedValue: string = "all";

  // Advanced filters state
  currentStatus: string = "all";
  minPrice: number | null = null;
  maxPrice: number | null = null;

  selectedSort: string = "createdAt";
  selectedOrder: 'asc' | 'desc' = "desc";
  advancedFiltersExpanded: boolean = false;

  // Controla si el dropdown está abierto
  isOpen: boolean = false;

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.onSearch());
  }

  onQueryChange(query: string): void {
    this.searchSubject.next(query);
  }

  onSearch(): void {
    this.search.emit({
      query: this.searchQuery,
      selectedValue: this.selectedValue,
      status: this.showAdvancedFilters ? this.currentStatus : undefined,
      minPrice: (this.showAdvancedFilters && this.showPriceFilters) ? (this.minPrice || undefined) : undefined,
      maxPrice: (this.showAdvancedFilters && this.showPriceFilters) ? (this.maxPrice || undefined) : undefined,

      sortBy: this.showAdvancedFilters ? this.selectedSort : undefined,
      sortOrder: this.showAdvancedFilters ? this.selectedOrder : undefined,
    });
  }

  onSortChange(event: any): void {
    const selectedValue = event.target.value;
    const selectedOption = this.sortOptions.find(
      (o) => o.value + o.order === selectedValue
    );
    if (selectedOption) {
      this.selectedSort = selectedOption.value;
      this.selectedOrder = selectedOption.order as 'asc' | 'desc';
    }
  }

  getSelectedTypeLabel(): string {
    const selected = this.dropdownOptions.find(
      (opt) => opt.value === this.selectedValue
    );
    return selected ? selected.label : this.selectedValue;
  }

  getSelectedStatusLabel(): string {
    const selected = this.statusOptions.find(
      (opt) => opt.value === this.currentStatus
    );
    return selected ? selected.label : this.currentStatus;
  }

  getActiveFiltersCount(): number {
    if (!this.showAdvancedFilters) return 0;
    let count = 0;
    if (this.selectedValue !== 'all') count++;
    if (this.currentStatus !== 'all') count++;
    if (this.minPrice) count++;
    if (this.maxPrice) count++;

    return count;
  }

  clearAdvancedFilters(): void {
    this.selectedValue = 'all';
    this.currentStatus = 'all';
    this.minPrice = null;
    this.maxPrice = null;

    this.selectedSort = 'createdAt';
    this.selectedOrder = 'desc';
    this.onSearch();
  }
}
