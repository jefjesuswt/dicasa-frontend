import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { PropertyService } from "../../../services/property.service";
import { PropertyCardComponent } from "../../../shared/property-card/property-card.component";
import { SearchBarComponent } from "../../../shared/search-bar/search-bar.component";
import { FormsModule } from "@angular/forms";
import { Property } from "../../../interfaces/properties/property.interface";
import { finalize } from "rxjs";
import { PaginatedProperties } from "../../../interfaces/properties/paginated-properties.interface";
import { QueryPropertiesParams } from "../../../interfaces/properties/query-property.interface";
import { PropertyStatus } from "../../../interfaces/properties/property-status.enum";

interface SearchParams {
  query: string;
  type: string;
}

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

  // paging
  public totalProperties = 0;
  public currentPage = 1;
  public itemsPerPage = 10;

  private propertyService = inject(PropertyService);

  constructor() {}

  ngOnInit(): void {
    this.loadProperties();
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
    this.selectedType = params.type || "all";
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
}
