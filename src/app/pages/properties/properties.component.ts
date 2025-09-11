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
  template: `
    <!-- Hero Section -->
    <div class="bg-indigo-700 text-white py-16">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-3xl md:text-4xl font-bold mb-4">
          Find Your Dream Property
        </h1>
        <p class="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Discover a wide range of properties for sale and rent in the most
          desirable locations.
        </p>

        <!-- Search Bar -->
        <div
          class="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-2 flex flex-col md:flex-row gap-2"
        >
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="filterProperties()"
              placeholder="Search by location, property type, or keyword..."
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            [(ngModel)]="selectedType"
            (change)="filterProperties()"
            class="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option *ngFor="let type of propertyTypes" [value]="type.id">
              {{ type.name }}
            </option>
          </select>
          <button
            (click)="filterProperties()"
            class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <i class="fas fa-search mr-2"></i> Search
          </button>
        </div>
      </div>
    </div>

    <!-- Properties Grid -->
    <div class="container mx-auto px-4 py-12">
      <!-- Filters -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          {{ filteredProperties.length }} Properties Found
        </h2>
        <div class="flex items-center space-x-4">
          <span class="text-gray-600">Sort by:</span>
          <select
            [(ngModel)]="sortBy"
            (change)="sortProperties()"
            class="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      <!-- Properties Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ng-container *ngFor="let property of filteredProperties">
          <app-property-card [property]="property"></app-property-card>
        </ng-container>
      </div>

      <!-- No Results -->
      <div *ngIf="filteredProperties.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <i class="fas fa-home text-5xl"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          No properties found
        </h3>
        <p class="text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>

      <!-- Pagination -->
      <div
        *ngIf="filteredProperties.length > 0"
        class="mt-12 flex justify-center"
      >
        <div class="flex space-x-2">
          <button
            *ngFor="let page of [1, 2, 3]"
            [class.bg-indigo-600]="currentPage === page"
            [class.text-white]="currentPage === page"
            [class.text-gray-700]="currentPage !== page"
            (click)="goToPage(page)"
            class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-100 transition-colors"
          >
            {{ page }}
          </button>
          <button
            class="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
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
