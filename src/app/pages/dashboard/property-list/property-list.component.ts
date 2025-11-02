import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PropertyService } from "../../../services/property.service";
import { Property } from "../../../interfaces/properties";
import { finalize } from "rxjs";
import { CommonModule } from "@angular/common";
import { HotToastService } from "@ngxpert/hot-toast";
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

@Component({
  selector: "dashboard-property-list",
  imports: [
    CommonModule,
    DashboardPropertyCardComponent,
    DialogComponent,
    SearchBarComponent,
  ],
  templateUrl: "./property-list.component.html",
})
export class PropertyListComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private toast = inject(HotToastService);

  public Math = Math;

  public properties: Property[] = [];
  public loading = true;
  public error: string | null = null;

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

  getStatusBadgeClass(status: string): string {
    const statusClasses: Record<string, string> = {
      sale: "bg-blue-100 text-blue-800",
      rent: "bg-purple-100 text-purple-800",
      sold: "bg-green-100 text-green-800",
      rented: "bg-yellow-100 text-yellow-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
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

  onPageChange(event: { page: number; rows: number }): void {
    this.currentPage = event.page + 1;
    this.rowsPerPage = event.rows;
    this.loadProperties();
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
          this.toast.success("Propiedad eliminada con éxito.");
          this.closeDeleteDialog();
          this.loadProperties();
        },
        error: (errMessage) => {
          console.error("Error deleting property", errMessage);
          this.toast.error(`Error al eliminar: ${errMessage}`);

          this.isDeleting = false;
        },
      });
  }

  addProperty(): void {
    this.router.navigate(["/dashboard/properties/new"]);
  }
}
