import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

import { PropertyService } from "../../../services/property.service";
import { Property } from "../../../interfaces/properties/property.interface";
import { PropertyStatus } from "../../../interfaces/properties/property-status.enum";

type LoadState = "loading" | "loaded" | "error";

@Component({
  selector: "app-my-properties",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./my-properties.component.html",
})
export class MyPropertiesComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private router = inject(Router);

  properties = signal<Property[]>([]);
  loadState = signal<LoadState>("loading");

  // Mapa de Etiquetas (Texto)
  statusLabels: Record<PropertyStatus, string> = {
    sale: "En Venta",
    rent: "En Alquiler",
    sold: "Vendida",
    rented: "Alquilada",
  };

  // Mapa de Clases CSS (Estilo Técnico/Neón)
  statusClasses: Record<PropertyStatus, string> = {
    sale: "text-white border-emerald-500 bg-emerald-600",
    rent: "text-white border-sky-500 bg-sky-600",
    sold: "text-white border-gray-500 bg-gray-500 opacity-80",
    rented: "text-white border-purple-500 bg-purple-600",
  };

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.loadState.set("loading");
    this.propertyService
      .getMyProperties({ page: 1, limit: 100 })
      .pipe(
        catchError((err) => {
          console.error("Error cargando propiedades:", err);
          this.loadState.set("error");
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.properties.set(response.data);
          this.loadState.set("loaded");
        } else {
          this.loadState.set("error");
        }
      });
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status as PropertyStatus] || status;
  }

  getStatusClass(status: string): string {
    return (
      this.statusClasses[status as PropertyStatus] ||
      "text-[var(--text-secondary)] border-[var(--border-light)]"
    );
  }

  editProperty(propertyId: string) {
    // IMPORTANTE: Asegúrate que esta ruta exista en tu routing principal
    // Si no, redirige a donde corresponda o ajusta la ruta.
    this.router.navigate(["/dashboard/property-form", propertyId]);
    // Nota: Asumo que reutilizas el formulario de creación para edición
    // pasando el ID, o tienes una ruta específica 'edit'.
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    if (element) {
      element.src = "/assets/images/placeholder-property.png";
    }
  }
}
