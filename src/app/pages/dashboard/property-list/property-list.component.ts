import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PropertyService } from "../../../services/property.service";
import { Property } from "../../../interfaces/properties";
import { finalize } from "rxjs";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ToastService } from "../../../services/toast.service";
import { DialogComponent } from "../../../shared/dialog/dialog.component";
import { QueryPropertiesParams } from "../../../interfaces/properties/query-property.interface";
import { PaginatedProperties } from "../../../interfaces/properties/paginated-properties.interface";
import {
  DropdownOption,
  SearchBarComponent,
  SearchParams,
} from "../../../shared/search-bar/search-bar.component";
import { PropertyStatus } from "../../../interfaces/properties/property-status.enum";
import { DashboardPropertyCardComponent } from "../../../components/dashboard/dashboard-property-card/dashboard-property-card.component";
import { ToggleSwitch } from "primeng/toggleswitch";

@Component({
  selector: "dashboard-property-list",
  imports: [
    CommonModule,
    FormsModule,
    DashboardPropertyCardComponent,
    DialogComponent,
    SearchBarComponent,
    ToggleSwitch,
  ],
  templateUrl: "./property-list.component.html",
})
export class PropertyListComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private toast = inject(ToastService);

  public Math = Math;

  public properties: Property[] = [];
  public loading = true;
  public error: string | null = null;
  public showDeleted = false;
  public showAdvancedFilters = false; // Control for collapsible filters

  // filter
  searchQuery: string = "";
  selectedType: string = "all";
  currentStatus: string = "all";
  statusList: PropertyStatus[] = ["sale", "rent", "sold", "rented"];

  // Advanced filters
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedSort: string = "createdAt";
  selectedOrder: 'asc' | 'desc' = "desc";
  selectedBedrooms: number | null = null;

  // Sort options
  sortOptions = [
    { label: "Más Recientes", value: "createdAt", order: "desc" },
    { label: "Más Antiguos", value: "createdAt", order: "asc" },
    { label: "Precio: Mayor a Menor", value: "price", order: "desc" },
    { label: "Precio: Menor a Mayor", value: "price", order: "asc" },
    { label: "Habitaciones", value: "bedrooms", order: "desc" },
  ];

  // Status options for dropdown
  statusOptions: DropdownOption[] = [
    { value: "all", label: "Todos los Estatus" },
    { value: "sale", label: "En Venta" },
    { value: "rent", label: "En Alquiler" },
    { value: "sold", label: "Vendido" },
    { value: "rented", label: "Alquilado" },
  ];

  public propertyTypeOptions: DropdownOption[] = [
    { value: "apartment", label: "Apartamento" },
    { value: "house", label: "Casa" },
    { value: "villa", label: "Villa" },
    { value: "land", label: "Terreno" },
    { value: "commercial", label: "Comercial" },
  ];

  // dialogs
  public isDeleteDialogOpen = false;
  public propertyToDelete: Property | null = null;
  public isDeleting = false;

  // pagination
  public totalProperties = 0;
  public currentPage = 1;
  public rowsPerPage = 10;

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    const params: QueryPropertiesParams = {
      page: this.currentPage,
      limit: this.rowsPerPage,
      search: this.searchQuery || undefined,
      type: this.selectedType === "all" ? undefined : this.selectedType,
      status:
        this.currentStatus === "all"
          ? undefined
          : (this.currentStatus as PropertyStatus),
      includeDeleted: this.showDeleted ? true : undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      bedrooms: this.selectedBedrooms || undefined,
      sortBy: this.selectedSort,
      sortOrder: this.selectedOrder,
    };

    this.loading = true;
    this.error = null;
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
    this.currentStatus = params.status || 'all';
    this.minPrice = params.minPrice ?? null;
    this.maxPrice = params.maxPrice ?? null;
    this.selectedBedrooms = params.bedrooms ?? null;
    this.selectedSort = params.sortBy || 'createdAt';
    this.selectedOrder = params.sortOrder || 'desc';
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
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedBedrooms = null;
    this.selectedSort = "createdAt";
    this.selectedOrder = "desc";
    this.currentPage = 1;
    this.loadProperties();
  }

  onSortChange(event: any): void {
    const selectedValue = event.target.value;
    const selectedOption = this.sortOptions.find(
      (o) => o.value + o.order === selectedValue
    );
    if (selectedOption) {
      this.selectedSort = selectedOption.value;
      this.selectedOrder = selectedOption.order as 'asc' | 'desc';
      this.currentPage = 1;
      this.loadProperties();
    }
  }

  onStatusChange(event: any): void {
    this.currentStatus = event.target.value;
    this.currentPage = 1;
    this.loadProperties();
  }

  applyAdvancedFilters(): void {
    this.currentPage = 1;
    this.loadProperties();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.minPrice) count++;
    if (this.maxPrice) count++;
    if (this.selectedBedrooms) count++;
    if (this.currentStatus !== 'all') count++;
    return count;
  }

  clearAdvancedFilters(): void {
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedBedrooms = null;
    this.currentStatus = 'all';
    this.selectedSort = 'createdAt';
    this.selectedOrder = 'desc';
    this.currentPage = 1;
    this.loadProperties();
  }

  onDeletedToggleChange(): void {
    this.currentPage = 1;
    this.loadProperties();
  }

  onPageChange(page: number): void {
    const totalPages = Math.ceil(this.totalProperties / this.rowsPerPage);
    if (page < 1 || page > totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadProperties();
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: Record<string, string> = {
      sale: "text-sky-600 dark:text-sky-400",
      rent: "text-purple-600 dark:text-purple-400",
      sold: "text-emerald-600 dark:text-emerald-400",
      rented: "text-amber-600 dark:text-amber-400",
    };
    return statusClasses[status] || "text-slate-600 dark:text-slate-400";
  }

  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      sale: "En Venta",
      rent: "En Alquiler",
      sold: "Vendido",
      rented: "Alquilado",
    };
    return statusLabels[status] || status;
  }

  getTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      house: "Casa",
      apartment: "Departamento",
      land: "Terreno",
      commercial: "Comercial",
      villa: "Villa",
    };
    return typeLabels[type] || type;
  }


  viewProperty(id: string): void {
    this.router.navigate(["/properties", id]);
  }

  editProperty(property: Property): void {
    this.router.navigate(["/dashboard/properties/edit", property._id]);
  }

  openDeleteDialog(property: Property): void {
    this.propertyToDelete = property;
    this.isDeleteDialogOpen = true;
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogOpen = false;
    this.propertyToDelete = null;
    this.isDeleting = false;
  }

  deleteProperty(): void {
    if (!this.propertyToDelete) return;

    this.isDeleting = true;
    this.propertyService
      .deleteProperty(this.propertyToDelete._id)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: () => {
          this.toast.success("Correcto", "Propiedad eliminada con éxito.");
          this.closeDeleteDialog();
          this.loadProperties();
        },
        error: (errMessage) => {
          console.error("Error deleting property", errMessage);
          this.toast.error("Error", `Error al eliminar: ${errMessage}`);

          this.isDeleting = false;
        },
      });
  }

  addProperty(): void {
    this.router.navigate(["/dashboard/properties/new"]);
  }
}
