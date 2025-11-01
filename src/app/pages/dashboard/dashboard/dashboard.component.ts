import { Component, computed, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule, RouterOutlet } from "@angular/router";
import { PropertyService } from "../../../services/property.service";
import { AuthService } from "../../../services/auth.service";
import { finalize } from "rxjs";
import { Property } from "../../../interfaces/properties";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PaginatedProperties } from "../../../interfaces/properties/paginated-properties.interface";
import { DashboardPropertyCardComponent } from "../../../components/dashboard/dashboard-property-card/dashboard-property-card.component";
import { StatCard } from "../../../interfaces/dashboard/stat-card.interface";
import { StatCardsComponent } from "../../../components/dashboard/stat-cards/stat-cards.component";

const statusTypes = ["for_sale", "for_rent", "sold", "rented"] as const;

@Component({
  selector: "dashboard-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, StatCardsComponent],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  public statsLoading = true;
  public user = computed(() => this.authService.currentUser());
  public isSuperAdmin = computed(() => this.authService.isSuperAdmin());

  public stats: StatCard[] = [
    {
      title: "Total de Propiedades",
      value: 0,
      icon: "pi pi-home",
      color: "bg-blue-100",
      textColor: "text-blue-800",
    },
    {
      title: "En Venta",
      value: 0,
      icon: "pi pi-tag",
      color: "bg-green-100",
      textColor: "text-green-800",
    },
    {
      title: "En Alquiler",
      value: 0,
      icon: "pi pi-key",
      color: "bg-purple-100",
      textColor: "text-purple-800",
    },
    {
      title: "Vendidas/Rentadas",
      value: 0,
      icon: "pi pi-check-circle",
      color: "bg-yellow-100",
      textColor: "text-yellow-800",
    },
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadStatsData();
    this.propertyService.statsUpdates$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadStatsData();
      });
  }

  loadStatsData(): void {
    this.statsLoading = true;
    this.propertyService
      .getProperties({ page: 1, limit: 1000 })
      .pipe(finalize(() => (this.statsLoading = false)))
      .subscribe({
        next: (response: PaginatedProperties) => {
          this.updateStats(response.data);
        },
        error: (error) => {
          console.error("Error loading stats data", error);
        },
      });
  }

  private updateStats(properties: Property[]): void {
    this.stats[0].value = properties.length;
    this.stats[1].value = properties.filter((p) => p.status === "sale").length;
    this.stats[2].value = properties.filter((p) => p.status === "rent").length;
    this.stats[3].value = properties.filter(
      (p) => p.status === "sold" || p.status === "rented"
    ).length;
  }
}
