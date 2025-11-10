import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { PropertyService } from "../../../services/property.service";
import { PropertyCardComponent } from "../../../shared/property-card/property-card.component";
import {
  DropdownOption,
  SearchBarComponent,
  SearchParams,
} from "../../../shared/search-bar/search-bar.component";
import { FormsModule } from "@angular/forms";
import { Property } from "../../../interfaces/properties/property.interface";
import { finalize } from "rxjs";
import { PaginatedProperties } from "../../../interfaces/properties/paginated-properties.interface";
import { QueryPropertiesParams } from "../../../interfaces/properties/query-property.interface";
import { PropertyStatus } from "../../../interfaces/properties/property-status.enum";
import Fingerprint from "fingerprinter-js";
import { AnalyticsService } from "../../../services/analytics.service";
import { v4 as uuidv4 } from "uuid";

@Component({
  selector: "properties-properties",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PropertyCardComponent,
    SearchBarComponent,
    FormsModule,
  ],
  templateUrl: "./properties.component.html",
})
export class PropertiesComponent implements OnInit {
  // status
  properties: Property[] = [];
  loading = true;
  error: string | null = null;

  // filter
  searchQuery: string = "";
  selectedType: string = "all";
  currentStatus: string = "all";
  statusList: PropertyStatus[] = ["sale", "rent", "sold", "rented"];

  public propertyTypeOptions: DropdownOption[] = [
    { value: "apartment", label: "Apartamento" },
    { value: "house", label: "Casa" },
    { value: "villa", label: "Villa" },
    { value: "land", label: "Terreno" },
    { value: "commercial", label: "Comercial" },
  ];

  // paging
  public totalProperties = 0;
  public currentPage = 1;
  public itemsPerPage = 10;

  private propertyService = inject(PropertyService);
  private analyticsService = inject(AnalyticsService);

  constructor() {}

  async ngOnInit(): Promise<void> {
    this.loadProperties();

    this.initializeAnalytics();
  }

  loadProperties(): void {
    this.loading = true;
    this.error = null;

    const params: QueryPropertiesParams = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchQuery || undefined,
      type: this.selectedType === "all" ? undefined : this.selectedType,
      status:
        this.currentStatus === "all"
          ? undefined
          : (this.currentStatus as PropertyStatus),
    };

    this.propertyService
      .getProperties(params)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: PaginatedProperties) => {
          this.properties = response.data;
          this.totalProperties = response.total;
        },
        error: (errMessage) => {
          this.error = errMessage;
        },
      });
  }

  onSearch(params: SearchParams): void {
    this.searchQuery = params.query;
    this.selectedType = params.selectedValue;
    this.currentPage = 1;
    this.loadProperties();
  }

  onTypeChange(): void {
    this.currentPage = 1;
    this.loadProperties();
  }

  filterByStatus(status: string): void {
    this.currentStatus = status;
    this.currentPage = 1;
    this.loadProperties();
  }

  resetFilters(): void {
    this.searchQuery = "";
    this.selectedType = "all";
    this.currentStatus = "all";
    this.currentPage = 1;
    this.loadProperties();
  }

  get totalPages(): number {
    return Math.ceil(this.totalProperties / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadProperties();
    window.scrollTo(0, 0);
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      apartment: "Apartment",
      house: "House",
      villa: "Villa",
      land: "Land",
      commercial: "Commercial",
    };
    return labels[type] || type;
  }

  private async getStableFingerprint(): Promise<string> {
    const storageKey = "dicasa-fingerprint";
    let fp = localStorage.getItem(storageKey);

    if (fp) {
      return fp;
    }

    const { fingerprint } = await Fingerprint.generate();
    localStorage.setItem(storageKey, fingerprint);
    return fingerprint;
  }

  private async initializeAnalytics(): Promise<void> {
    try {
      // 1. Obtener Fingerprint (ahora usa la nueva función)
      const fingerprint = await this.getStableFingerprint(); // <- CAMBIO AQUÍ
      const path = window.location.pathname;

      // 2. Registrar la visita
      this.analyticsService.logVisit({ fingerprint, path }).subscribe();

      // 3. Manejar la Sesión (esto ya está bien)
      let sessionId = sessionStorage.getItem("analyticsSessionId");

      if (sessionId) {
        this.analyticsService.startHeartbeatLoop(sessionId);
      } else {
        sessionId = uuidv4();
        sessionStorage.setItem("analyticsSessionId", sessionId);

        this.analyticsService
          .startSession({ sessionId, fingerprint })
          .subscribe({
            next: () => {
              if (!sessionId) return;
              this.analyticsService.startHeartbeatLoop(sessionId);
            },
            error: (err) => console.error("Failed to create session", err),
          });
      }
    } catch (error) {
      console.error("Error during analytics initialization:", error);
    }
  }
}
