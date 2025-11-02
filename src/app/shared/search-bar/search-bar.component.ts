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
    <div class="bg-white rounded-lg shadow p-4 sm:p-6">
      <div class="flex flex-col md:flex-row items-end gap-3 w-full">
        <!-- Location Input -->
        <div class="w-full md:flex-1 md:min-w-[200px]">
          <label class="block text-xs font-medium text-gray-600 mb-1">
            {{ label || "Buscar" }}
          </label>
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onQueryChange($event)"
              (keyup.enter)="onSearch()"
              [placeholder]="placeholder || 'Ingresa un término...'"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent h-[38px]"
            />
            <div
              class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <i class="pi pi-map-marker text-gray-400 text-sm"></i>
            </div>
          </div>
        </div>

        <div class="w-full md:w-48" *ngIf="showDropdown">
          <label
            for="property-type"
            class="block text-xs font-medium text-gray-600 mb-1"
          >
            {{ dropdownLabel || "Filtro" }}
          </label>
          <div class="relative">
            <select
              id="generic-dropdown"
              [(ngModel)]="selectedValue"
              (ngModelChange)="onSearch()"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent h-[38px] appearance-none bg-white"
            >
              <option [value]="''">Todos los tipos</option>
              <option
                *ngFor="let option of dropdownOptions"
                [value]="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <div
              class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <i class="pi pi-chevron-down text-gray-400 text-xs"></i>
            </div>
          </div>
        </div>

        <!-- Search Button -->
        <button
          (click)="onSearch()"
          class="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-6 rounded-lg transition-colors h-[38px] flex items-center justify-center"
        >
          <i class="pi pi-search mr-2"></i>
          {{ buttonText || "Buscar" }}
        </button>
      </div>
    </div>
  `,
})
export class SearchBarComponent implements OnInit {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() buttonText?: string;

  @Input() dropdownLabel?: string;
  @Input() showDropdown: boolean = true;
  @Input() dropdownOptions: DropdownOption[] = [];

  @Output() search = new EventEmitter<SearchParams>();

  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  searchQuery: string = "";
  selectedValue: string = "all";

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
    });
  }
}
