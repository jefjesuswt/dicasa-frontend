import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  inject,
  DestroyRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UserRole } from "../../../interfaces/users/roles.enum";

// 1. Nueva interfaz de parámetros
export interface SearchUserParams {
  query: string;
  role: string; // 'all' o un UserRole
}

@Component({
  selector: "shared-user-search-bar", // Nombre de selector único
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow p-4 sm:p-6">
      <div class="flex flex-col md:flex-row items-end gap-3 w-full">
        <div class="w-full md:flex-1 md:min-w-[200px]">
          <label class="block text-xs font-medium text-gray-600 mb-1">
            Buscar Usuario
          </label>
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onQueryChange($event)"
              (keyup.enter)="onSearch()"
              placeholder="Buscar por nombre, email o teléfono..."
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent h-[38px]"
            />

            <div
              class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <i class="pi pi-search text-gray-400 text-sm"></i>  
            </div>
          </div>
        </div>

        <div class="w-full md:w-48">
          <label
            for="user-role"
            class="block text-xs font-medium text-gray-600 mb-1"
          >
            Rol
          </label>
          <div class="relative">
            <select
              id="user-role"
              [(ngModel)]="selectedRole"
              (ngModelChange)="onSearch()"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent h-[38px] appearance-none bg-white"
            >
              <option [value]="'all'">Todos los Roles</option>
              <option *ngFor="let role of roles" [value]="role">
                {{ getRoleTranslation(role) }}
              </option>
            </select>
            <div
              class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <i class="pi pi-chevron-down text-gray-400 text-xs"></i>          
            </div>
          </div>
        </div>
      </div>
    </div>
     
  `,
})
export class UserSearchBarComponent implements OnInit {
  @Output() search = new EventEmitter<SearchUserParams>();

  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  searchQuery: string = "";
  selectedRole: string = "all";
  roles = [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.USER];

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.onSearch();
      });
  }

  onQueryChange(query: string): void {
    this.searchSubject.next(query);
  }

  getRoleTranslation(role: string): string {
    const translations: { [key: string]: string } = {
      [UserRole.SUPERADMIN]: "Super Admin",
      [UserRole.ADMIN]: "Admin",
      [UserRole.USER]: "Usuario",
    };
    return translations[role] || role;
  }

  onSearch(): void {
    this.search.emit({
      query: this.searchQuery,
      role: this.selectedRole,
    });
  }
}
