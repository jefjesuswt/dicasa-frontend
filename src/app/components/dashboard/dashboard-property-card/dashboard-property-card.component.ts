import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { Property } from "../../../interfaces/properties";
import { CurrencyPipe, NgClass } from "@angular/common";
import { PropertyListComponent } from "../../../pages/dashboard/property-list/property-list.component";

@Component({
  selector: "dashboard-property-card",
  imports: [CurrencyPipe, NgClass],
  templateUrl: "./dashboard-property-card.component.html",
  host: {
    class: "block",
  },
})
export class DashboardPropertyCardComponent {
  @Input({ required: true }) property!: Property;

  // 👇 Emite eventos al componente padre
  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Property>();
  @Output() delete = new EventEmitter<string>();

  // 👇 Inyecta el padre para usar sus métodos de ayuda (getStatusLabel, etc.)
  // Esto evita duplicar esa lógica aquí.
  private propertyList = inject(PropertyListComponent);

  // --- Métodos de Ayuda (Delegados al Padre) ---
  getStatusBadgeClass(status: string): string {
    return this.propertyList.getStatusBadgeClass(status);
  }

  getStatusLabel(status: string): string {
    return this.propertyList.getStatusLabel(status);
  }

  getTypeLabel(type: string): string {
    return this.propertyList.getTypeLabel(type);
  }

  onViewClick(): void {
    this.view.emit(this.property._id);
  }

  onEditClick(): void {
    this.edit.emit(this.property);
  }

  onDeleteClick(): void {
    this.delete.emit(this.property._id);
  }
}
