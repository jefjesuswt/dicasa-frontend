import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  afterNextRender,
  PLATFORM_ID,
} from "@angular/core";
import { CommonModule, DOCUMENT, isPlatformBrowser } from "@angular/common";
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
import { SeoService } from "../../../services/seo.service";

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
export class PropertiesComponent implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  properties: Property[] = [];
  loading = true;
  error: string | null = null;

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

  public totalProperties = 0;
  public currentPage = 1;
  public itemsPerPage = 10;

  private propertyService = inject(PropertyService);
  private analyticsService = inject(AnalyticsService);
  private seoService = inject(SeoService);

  constructor() {
    afterNextRender(() => {
      this.initScrollObserver();
      this.initializeAnalytics();
    });
  }

  async ngOnInit(): Promise<void> {
    // SEO
    this.seoService.updateSeoData(
      "Propiedades",
      "Explora nuestro catálogo de casas, apartamentos y terrenos en venta y alquiler en Lechería."
    );

    this.loadProperties();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private initScrollObserver() {
    this.observer?.disconnect();

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    }, options);

    setTimeout(() => {
      const elements = this.document.querySelectorAll(".reveal-on-scroll");
      elements.forEach((el) => this.observer?.observe(el));
    }, 100);
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

          if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => this.initScrollObserver(), 100);
          }
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

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      apartment: "Apartamento",
      house: "Casa",
      villa: "Villa",
      land: "Terreno",
      commercial: "Comercial",
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
      const fingerprint = await this.getStableFingerprint();
      const path = window.location.pathname;

      this.analyticsService.logVisit({ fingerprint, path }).subscribe();

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
