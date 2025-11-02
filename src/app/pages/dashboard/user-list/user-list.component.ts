import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { finalize } from "rxjs";
import { HotToastService } from "@ngxpert/hot-toast";

import { UsersService } from "../../../services/users.service";
import { User } from "../../../interfaces/users";
import { DialogComponent } from "../../../shared/dialog/dialog.component";
import { UserRole } from "../../../interfaces/users/roles.enum";
import { AvatarComponent } from "../../../shared/avatar/avatar.component";

import { QueryUserParams } from "../../../interfaces/users/query-user.interface";
import { PaginatedUserResponse } from "../../../interfaces/users/paginated-user.response.interface";
import {
  DropdownOption,
  SearchBarComponent,
  SearchParams,
} from "../../../shared/search-bar/search-bar.component";

@Component({
  selector: "dashboard-user-list",
  standalone: true,
  imports: [CommonModule, DialogComponent, AvatarComponent, SearchBarComponent],
  templateUrl: "./user-list.component.html",
})
export class UserListComponent implements OnInit {
  private usersService = inject(UsersService);
  private router = inject(Router);
  private toast = inject(HotToastService);

  public users: User[] = [];
  public loading = true;
  public error: string | null = null;
  public Math = Math;

  // --- Estado del Dialog ---
  public isDeleteDialogOpen = false;
  public userToDelete: User | null = null;
  public isDeleting = false;

  // Paging
  public totalUsers = 0;
  public currentPage = 1;
  public rowsPerPage = 10;
  public currentQueryParams: QueryUserParams = {};

  public userRoleOptions: DropdownOption[] = [
    { value: UserRole.SUPERADMIN, label: "Super Admin" },
    { value: UserRole.ADMIN, label: "Admin" },
    { value: UserRole.USER, label: "Usuario" },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const params: QueryUserParams = {
      ...this.currentQueryParams,
      page: this.currentPage,
      limit: this.rowsPerPage,
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
    const role = roles.includes(UserRole.SUPERADMIN)
      ? UserRole.SUPERADMIN
      : roles.includes(UserRole.ADMIN)
      ? UserRole.ADMIN
      : roles.length > 0
      ? roles[0]
      : "USER";

    const roleClasses: Record<string, string> = {
      USER: "bg-gray-100 text-gray-800",
      ADMIN: "bg-blue-100 text-blue-800",
      SUPERADMIN: "bg-red-100 text-red-800",
    };
    return roleClasses[role] || "bg-gray-100 text-gray-800";
  }

  getRoleLabel(roles: UserRole[]): string {
    const role = roles.includes(UserRole.SUPERADMIN)
      ? UserRole.SUPERADMIN
      : roles.includes(UserRole.ADMIN)
      ? UserRole.ADMIN
      : roles.length > 0
      ? roles[0]
      : "USER";

    const roleLabels: Record<string, string> = {
      USER: "Usuario",
      ADMIN: "Admin",
      SUPERADMIN: "Super Admin",
    };
    return roleLabels[role] || role;
  }

  addUser(): void {
    this.router.navigate(["/dashboard/users/new"]);
  }

  editUser(user: User): void {
    this.router.navigate(["/dashboard/users/edit", user._id]);
  }

  openDeleteDialog(user: User): void {
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

    this.isDeleting = true;
    this.usersService
      .deleteUser(this.userToDelete._id)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: () => {
          this.toast.success("Usuario eliminado con éxito.");
          this.closeDeleteDialog();
          this.loadUsers();
        },
        error: (errMessage) => {
          this.toast.error(`Error al eliminar usuario: ${errMessage}`);
          console.error("Error deleting user:", errMessage);
          this.isDeleting = false;
        },
      });
  }
}
