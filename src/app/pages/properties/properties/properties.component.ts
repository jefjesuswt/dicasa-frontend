import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { Property, propertyTypes, PropertyType } from '../../../models/property.model';
import { PropertyCardComponent } from '../../../shared/property-card/property-card.component';
import { SearchBarComponent } from '../../../shared/search-bar/search-bar.component';
import { FormsModule } from '@angular/forms';

type PropertyStatus = 'sale' | 'rent' | 'sold' | 'rented';
type SortOption = 'price-asc' | 'price-desc' | 'newest';

interface SearchParams {
  query: string;
  type: string;
}

@Component({
  selector: 'properties-properties',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    PropertyCardComponent, 
    SearchBarComponent,
    FormsModule
  ],
  templateUrl: './properties.component.html',
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  paginatedProperties: Property[] = [];
  searchQuery: string = '';
  selectedType: string = 'all';
  currentStatus: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 12;
  
  // Available property types from the model
  propertyTypes: PropertyType[] = propertyTypes;
  
  // Status options for filtering
  statusList: PropertyStatus[] = ['sale', 'rent', 'sold', 'rented'];

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.properties = this.propertyService.getProperties();
    this.filteredProperties = [...this.properties];
    this.paginateProperties();
  }

  // Handle search from the search bar
  onSearch(params: SearchParams): void {
    this.searchQuery = params.query.toLowerCase();
    this.selectedType = params.type || 'all';
    this.currentPage = 1; // Reset to first page on new search
    this.applyFilters();
  }

  // Apply all active filters
  applyFilters(): void {
    this.filteredProperties = this.properties.filter(property => {
      // Filter by search query
      const matchesSearch = !this.searchQuery || 
        property.title.toLowerCase().includes(this.searchQuery) ||
        property.location.toLowerCase().includes(this.searchQuery);
      
      // Filter by property type
      const matchesType = this.selectedType === 'all' || 
        property.type === this.selectedType;
      
      // Filter by status
      const matchesStatus = this.currentStatus === 'all' || 
        property.status === this.currentStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
    
    this.paginateProperties();
  }

  // Handle type filter change
  onTypeChange(): void {
    this.currentPage = 1; // Reset to first page on filter change
    this.applyFilters();
  }

  // Filter by property status
  filterByStatus(status: string): void {
    this.currentStatus = status;
    this.currentPage = 1; // Reset to first page on status change
    this.applyFilters();
  }

  // Reset all filters
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedType = 'all';
    this.currentStatus = 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Pagination methods
  paginateProperties(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProperties = this.filteredProperties.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || (page > Math.ceil(this.filteredProperties.length / this.itemsPerPage))) {
      return;
    }
    this.currentPage = page;
    this.paginateProperties();
    window.scrollTo(0, 0);
  }

  // Helper methods
  getStatusCount(status: string): number {
    return this.properties.filter(p => p.status === status).length;
  }

  getTypeLabel(type: string): string {
    const labels: {[key: string]: string} = {
      'apartment': 'Apartment',
      'house': 'House',
      'villa': 'Villa',
      'land': 'Land',
      'commercial': 'Commercial'
    };
    return labels[type] || type;
  }
}
