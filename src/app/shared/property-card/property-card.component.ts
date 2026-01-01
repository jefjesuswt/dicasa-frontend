import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Property } from "../../interfaces/properties/property.interface";

@Component({
  selector: "shared-property-card",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./property-card.component.html",
})
export class PropertyCardComponent {
  @Input() property!: Property;

  // Retorna clases para modo oscuro (Fondo translúcido + Borde + Texto brillante)
  getStatusClass(status: string): string {
    switch (status) {
      case "sale":
        return "text-emerald-500 dark:text-emerald-400";
      case "rent":
        return "text-sky-500 dark:text-sky-400";
      case "sold":
        return "text-slate-500 dark:text-slate-400 line-through";
      case "rented":
        return "text-purple-500 dark:text-purple-400";
      default:
        return "text-slate-500 dark:text-slate-400";
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case "sale":
        return "En Venta";
      case "rent":
        return "En Alquiler";
      case "sold":
        return "Vendido";
      case "rented":
        return "Alquilado";
      default:
        return "Disponible";
    }
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    if (element) {
      element.src = "/assets/images/placeholder-property.png";
    }
  }
}
