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
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rent":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "sold":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "rented":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
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
