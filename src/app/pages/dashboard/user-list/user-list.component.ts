import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { finalize } from "rxjs";
// import { HotToastService } from "@ngxpert/hot-toast"; // REMOVED
import { ToastService } from "../../../services/toast.service";

import { UsersService } from "../../../services/users.service";
import { AuthService } from "../../../services/auth.service";
import { User } from "../../../interfaces/users";
import { DialogComponent } from "../../../shared/dialog/dialog.component";
import { UserRole } from "../../../interfaces/users/roles.enum";
import { AvatarComponent } from "../../../shared/avatar/avatar.component";
// 👇 IMPORTANTE: Importamos el nuevo componente de tarjeta
import { DashboardUserCardComponent } from "../../../components/dashboard/dashboard-user-card/dashboard-user-card.component";

import { QueryUserParams } from "../../../interfaces/users/query-user.interface";
import { PaginatedUserResponse } from "../../../interfaces/users/paginated-user.response.interface";
import {
  DropdownOption,
  SearchBarComponent,
  SearchParams,
} from "../../../shared/search-bar/search-bar.component";

import { ToggleSwitch } from "primeng/toggleswitch";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "dashboard-user-list",
  standalone: true,
  imports: [
    CommonModule,
    DialogComponent,
    AvatarComponent,
    SearchBarComponent,
    FormsModule,
    ToggleSwitch,
    DashboardUserCardComponent, // 👈 Lo añadimos aquí
  ],
  templateUrl: "./user-list.component.html",
})
export class UserListComponent implements OnInit {
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  public currentUser = this.authService.currentUser;

  public users: User[] = [];
  public showInactive = false;
  public loading = true;
  public error: string | null = null;
  public Math = Math;

  public isDeleteDialogOpen = false;
  public userToDelete: User | null = null;
  public isDeleting = false;

  // Paging
  public totalUsers = 0;
  public currentPage = 1;
  public rowsPerPage = 10;
  public currentQueryParams: QueryUserParams = {};

  public userRoleOptions: DropdownOption[] = [
    { value: UserRole.ADMIN, label: "Admin (IT)" },
    { value: UserRole.MANAGER, label: "Gerente" },
    { value: UserRole.AGENT, label: "Vendedor" },
    { value: UserRole.USER, label: "Cliente" },
  ];

  public statusBadgeClass: Record<string, string> = {
    true: "bg-green-100 text-green-800", // activo
    false: "bg-gray-100 text-gray-800", // inactivo
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const params: QueryUserParams = {
      ...this.currentQueryParams,
      page: this.currentPage,
      limit: this.rowsPerPage,
      isActive: this.showInactive ? undefined : true,
    };
    this.loading = true;
    this.error = null;
    this.usersService
      .getUsers(params)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: PaginatedUserResponse) => {
          this.users = response.data;
          this.totalUsers = response.total;
        },
        error: (errMessage) => {
          this.error = `Error al cargar usuarios: ${errMessage}`;
          console.error("Error loading users:", errMessage);
        },
      });
  }

  onUserSearch(params: SearchParams) {
    this.currentQueryParams = {
      search: params.query,
      role:
        params.selectedValue === "all"
          ? undefined
          : (params.selectedValue as UserRole),
    };
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number) {
    const totalPages = Math.ceil(this.totalUsers / this.rowsPerPage);
    if (page < 1 || page > totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadUsers();
  }

  getRoleBadgeClass(roles: UserRole[]): string {
    const role = roles.includes(UserRole.ADMIN)
      ? UserRole.ADMIN
      : roles.includes(UserRole.MANAGER)
        ? UserRole.MANAGER
        : roles.includes(UserRole.AGENT)
          ? UserRole.AGENT
          : roles.length > 0
            ? roles[0]
            : "USER";

    const roleClasses: Record<string, string> = {
      ADMIN: "text-red-500",
      MANAGER: "text-sky-500",
      AGENT: "text-purple-500",
      USER: "text-[var(--text-secondary)]",
    };
    return roleClasses[role] || "text-[var(--text-secondary)]";
  }

  getRoleLabel(roles: UserRole[]): string {
    const role = roles.includes(UserRole.ADMIN)
      ? UserRole.ADMIN
      : roles.includes(UserRole.MANAGER)
        ? UserRole.MANAGER
        : roles.includes(UserRole.AGENT)
          ? UserRole.AGENT
          : roles.length > 0
            ? roles[0]
            : "USER";

    const roleLabels: Record<string, string> = {
      ADMIN: "Admin (IT)",
      MANAGER: "Gerente",
      AGENT: "Vendedor",
      USER: "Cliente",
    };
    return roleLabels[role] || role;
  }

  addUser(): void {
    this.router.navigate(["/dashboard/users/new"]);
  }

  editUser(user: User): void {
    this.router.navigate(["/dashboard/users/edit", user._id]);
  }

  onInactiveToggleChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  openDeleteDialog(user: User): void {
    if (!this.canDeleteUser(user)) {
      this.toast.error("Acción Denegada", "No tienes permisos para eliminar este usuario.");
      return;
    }
    this.userToDelete = user;
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen = false;
    this.userToDelete = null;
    this.isDeleting = false;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    if (!this.canDeleteUser(this.userToDelete)) {
      this.toast.error("Acción Denegada", "No tienes permisos para eliminar este usuario.");
      this.closeDeleteDialog();
      return;
    }

    this.isDeleting = true;
    this.usersService
      .deleteUser(this.userToDelete._id)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: () => {
          this.toast.success("Éxito", "Usuario eliminado correctamente.");
          this.closeDeleteDialog();
          this.loadUsers();
        },
        error: (errMessage) => {
          this.toast.error("Error", `No se pudo eliminar: ${errMessage}`);
          console.error("Error deleting user:", errMessage);
          this.isDeleting = false;
        },
      });
  }

  canDeleteUser(user: User): boolean {
    const currentUser = this.currentUser();
    if (!currentUser) return false;

    // 1. No se puede borrar a sí mismo
    if (String(user._id) === String(currentUser._id)) return false;

    // 2. Manager no puede borrar Admin
    const isTargetAdmin = user.roles.includes(UserRole.ADMIN);
    const isCurrentManager = currentUser.roles.includes(UserRole.MANAGER);
    const isCurrentAdmin = currentUser.roles.includes(UserRole.ADMIN);

    // Si soy Manager y el target es Admin -> NO
    if (isCurrentManager && isTargetAdmin && !isCurrentAdmin) return false;

    // DEBUG: Log if checking self
    // if (user.email === currentUser.email) {
    //   console.log('Checking self deletion:', {
    //     userId: user._id,
    //     currentUserId: currentUser._id,
    //     match: user._id === currentUser._id
    //   });
    // }

    return true;
  }
}
