import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { ButtonModule } from "primeng/button";

import { PropertyService } from "../../../services/property.service";
import { Property } from "../../../interfaces/properties/property.interface";
import { PropertyStatus } from "../../../interfaces/properties/property-status.enum";

type LoadState = "loading" | "loaded" | "error";
type TagSeverity =
  | "success"
  | "secondary"
  | "info"
  | "warn"
  | "danger"
  | "contrast"
  | null
  | undefined;

@Component({
  selector: "app-my-properties",
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, TagModule, ButtonModule],
  templateUrl: "./my-properties.component.html",
})
export class MyPropertiesComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private router = inject(Router);

  properties = signal<Property[]>([]);
  loadState = signal<LoadState>("loading");

  statusSeverity: Record<PropertyStatus, TagSeverity> = {
    sale: "success",
    rent: "info",
    sold: "danger",
    rented: "warn",
  };

  statusLabels: Record<PropertyStatus, string> = {
    sale: "En Venta",
    rent: "En Alquiler",
    sold: "Vendida",
    rented: "Alquilada",
  };

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.loadState.set("loading");
    this.propertyService
      .getMyProperties({ page: 1, limit: 100 }) // Pedimos hasta 100
      .pipe(
        catchError((err) => {
          console.error("Error cargando propiedades:", err);
          this.loadState.set("error");
          return of(null); // Retornamos null en caso de error
        })
      )
      .subscribe((response) => {
        if (response) {
          this.properties.set(response.data);
          this.loadState.set("loaded");
        } else {
          // Si la respuesta es null (por el catchError)
          this.loadState.set("error");
        }
      });
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status as PropertyStatus] || status;
  }

  getStatusSeverity(status: string): TagSeverity {
    return this.statusSeverity[status as PropertyStatus] || "secondary";
  }
  /**
   * Navega al formulario de edición de propiedades en el dashboard
   */
  editProperty(propertyId: string) {
    this.router.navigate(["/dashboard/properties/edit", propertyId]);
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    if (element) {
      element.src = "/assets/images/placeholder-property.png";
    }
  }
}
