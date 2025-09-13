import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { PropertyService } from '../../services/property.service';
import { propertyTypes } from '../../models/property.model';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PropertyCardComponent],
  templateUrl: './properties.component.html',
  styles: [],
})
export class PropertiesComponent implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = [];
  propertyTypes = propertyTypes;
  selectedType = 'all';
  searchQuery = '';
  sortBy = 'newest';
  currentPage = 1;
  itemsPerPage = 6;

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    this.properties = this.propertyService.getProperties();
    this.filteredProperties = [...this.properties];
    this.sortProperties();
  }

  filterProperties() {
    this.filteredProperties = this.propertyService.getProperties({
      type: this.selectedType,
      search: this.searchQuery,
    });
    this.sortProperties();
  }

  sortProperties() {
    this.filteredProperties = [...this.filteredProperties].sort((a, b) => {
      switch (this.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
        default:
          return b.id - a.id;
      }
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    // In a real app, you would fetch the paginated data here
  }
}
