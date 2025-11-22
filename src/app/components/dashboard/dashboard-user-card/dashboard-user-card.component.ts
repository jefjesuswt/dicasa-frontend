import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { User } from "../../../interfaces/users";
import { UserRole } from "../../../interfaces/users/roles.enum";
import { AvatarComponent } from "../../../shared/avatar/avatar.component";

@Component({
  selector: "dashboard-user-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: "./dashboard-user-card.component.html",
  host: {
    class: "block",
  },
})
export class DashboardUserCardComponent {
  @Input({ required: true }) user!: User;

  @Output() edit = new EventEmitter<User>();
  @Output() delete = new EventEmitter<User>();

  // Helpers visuales para el estilo Dark/Tech

  getRoleConfig(roles: UserRole[]): {
    label: string;
    class: string;
    icon: string;
  } {
    if (roles.includes(UserRole.SUPERADMIN)) {
      return {
        label: "SUPER ADMIN",
        class: "text-red-400 border-red-500/30 bg-red-500/10",
        icon: "pi-shield",
      };
    } else if (roles.includes(UserRole.ADMIN)) {
      return {
        label: "ADMINISTRADOR",
        class: "text-sky-400 border-sky-500/30 bg-sky-500/10",
        icon: "pi-star",
      };
    }
    return {
      label: "USUARIO",
      class: "text-slate-400 border-white/10 bg-white/5",
      icon: "pi-user",
    };
  }

  get activeStatusClass(): string {
    return this.user.isActive
      ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
      : "bg-slate-600";
  }

  get hoverBorderClass(): string {
    if (this.user.roles.includes(UserRole.SUPERADMIN)) {
      return "hover:border-red-500/30";
    }
    if (this.user.roles.includes(UserRole.ADMIN)) {
      return "hover:border-sky-500/30";
    }
    return "hover:border-slate-500/30";
  }

  onEdit() {
    this.edit.emit(this.user);
  }

  onDelete() {
    this.delete.emit(this.user);
  }
}
