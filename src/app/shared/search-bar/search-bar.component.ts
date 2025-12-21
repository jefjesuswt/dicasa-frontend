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
    <div
      class="w-full p-1 border border-[var(--border-light)] bg-[var(--bg-dark)]/90 backdrop-blur-md relative z-30 shadow-2xl"
    >
      <div class="flex flex-col md:flex-row gap-1">
        <div
          class="flex-1 bg-white/5 border border-transparent hover:border-white/10 transition-colors relative group px-4 py-3"
        >
          <label
            class="block text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-1"
          >
            {{ label || "Ubicación" }}
          </label>
          <div class="flex items-center">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onQueryChange($event)"
              (keyup.enter)="onSearch()"
              [placeholder]="placeholder || 'INGRESA UNA ZONA...'"
              class="w-full bg-transparent text-[var(--text-heading)] placeholder-[var(--text-secondary)] text-sm border-none p-0 focus:ring-0 focus:outline-none uppercase tracking-wide font-bold"
            />
            <i
              class="pi pi-map-marker text-[var(--text-secondary)] group-focus-within:text-sky-400 transition-colors text-sm ml-2"
            ></i>
          </div>

          <div
            class="absolute bottom-0 left-0 h-px w-0 bg-sky-500 group-focus-within:w-full transition-all duration-500"
          ></div>
        </div>

        @if (showDropdown) {
        <div class="w-full md:w-64 relative">
          <div
            (click)="toggleDropdown()"
            class="h-full bg-white/5 border border-transparent hover:border-white/10 cursor-pointer relative group px-4 py-3 flex flex-col justify-center transition-colors select-none"
            [class.bg-white-10]="isOpen"
            [class.border-white-10]="isOpen"
          >
            <label
              class="block text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-1 cursor-pointer"
            >
              {{ dropdownLabel || "Categoría" }}
            </label>

            <div class="flex items-center justify-between">
              <span
                class="text-[var(--text-heading)] text-sm uppercase tracking-wide truncate font-bold"
              >
                {{ getSelectedLabel() }}
              </span>
              <i
                class="pi pi-angle-down text-[var(--text-secondary)] text-xs transition-transform duration-300"
                [class.rotate-180]="isOpen"
                [class.text-sky-400]="isOpen"
              ></i>
            </div>

            <div
              class="absolute bottom-0 left-0 h-px bg-sky-500 transition-all duration-500"
              [class.w-full]="isOpen"
              [class.w-0]="!isOpen"
            ></div>
          </div>

          @if (isOpen) {
          <div
            class="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-dark)] border border-[var(--border-light)] shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar animate-fade-in"
          >
            <div
              (click)="selectOption('all')"
              class="px-4 py-3 cursor-pointer border-b border-[var(--border-light)] hover:bg-white/5 flex items-center justify-between group transition-colors"
            >
              <span
                class="text-sm uppercase tracking-wide font-bold"
                [class]="
                  selectedValue === 'all'
                    ? 'text-sky-400'
                    : 'text-[var(--text-secondary)] group-hover:text-[var(--text-heading)]'
                "
              >
                Todos
              </span>
              @if (selectedValue === 'all') {
              <i class="pi pi-check text-sky-500 text-xs"></i>
              }
            </div>

            @for (option of dropdownOptions; track option.value) {
            <div
              (click)="selectOption(option.value)"
              class="px-4 py-3 cursor-pointer border-b border-[var(--border-light)] hover:bg-white/5 flex items-center justify-between group transition-colors last:border-0"
            >
              <span
                class="text-sm uppercase tracking-wide font-bold"
                [class]="
                  selectedValue === option.value
                    ? 'text-sky-400'
                    : 'text-[var(--text-secondary)] group-hover:text-[var(--text-heading)]'
                "
              >
                {{ option.label }}
              </span>
              @if (selectedValue === option.value) {
              <i class="pi pi-check text-sky-500 text-xs"></i>
              }
            </div>
            }
          </div>

          <div
            (click)="closeDropdown()"
            class="fixed inset-0 z-40 cursor-default"
          ></div>
          }
        </div>
        }

        <button
          (click)="onSearch()"
          class="w-full md:w-auto bg-[var(--btn-primary-bg)] hover:bg-sky-400 text-[var(--btn-primary-text)] hover:text-white font-bold text-xs uppercase tracking-widest py-4 px-8 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <span class="hidden md:inline">{{ buttonText || "Buscar" }}</span>
          <span class="md:hidden">Buscar</span>
          <i
            class="pi pi-arrow-right group-hover/btn:translate-x-1 transition-transform"
          ></i>
        </button>
      </div>
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
        background: #020617;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #1e293b;
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #38bdf8;
      }

      /* Fix autofill chrome */
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #0f172a inset !important;
        -webkit-text-fill-color: white !important;
        caret-color: white !important;
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

  @Output() search = new EventEmitter<SearchParams>();

  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  searchQuery: string = "";
  selectedValue: string = "all";

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

  // --- Lógica del Custom Dropdown ---

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  selectOption(value: string): void {
    this.selectedValue = value;
    this.isOpen = false;
    this.onSearch(); // Dispara la búsqueda al seleccionar
  }

  // Helper para mostrar el label seleccionado en la UI cerrada
  getSelectedLabel(): string {
    if (this.selectedValue === "all") return "Todos";
    const selected = this.dropdownOptions.find(
      (opt) => opt.value === this.selectedValue
    );
    return selected ? selected.label : "Seleccionar";
  }

  onSearch(): void {
    this.search.emit({
      query: this.searchQuery,
      selectedValue: this.selectedValue,
    });
  }
}
