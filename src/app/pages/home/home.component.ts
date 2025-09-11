import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, PropertyCardComponent],
  template: `
    <!-- Hero Section -->
    <div class="relative bg-indigo-700 text-white">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-50"></div>
        <img 
          src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&auto=format&fit=crop&q=60" 
          alt="Luxury Home"
          class="w-full h-full object-cover"
        >
      </div>
      <div class="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">Find Your Perfect Home</h1>
        <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Discover a wide range of properties for sale and rent in the most desirable locations.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a 
            routerLink="/properties" 
            class="bg-white text-indigo-700 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
          >
            Browse Properties
          </a>
          <a 
            href="#featured" 
            class="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            View Featured
          </a>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="max-w-6xl mx-auto px-4 -mt-8 mb-16">
      <div class="bg-white rounded-xl shadow-xl p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="col-span-1 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input 
              type="text" 
              placeholder="City, neighborhood, or address"
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>All Types</option>
              <option>For Sale</option>
              <option>For Rent</option>
            </select>
          </div>
          <div class="flex items-end">
            <button class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Properties -->
    <div id="featured" class="max-w-7xl mx-auto px-4 py-12">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Explore our handpicked selection of premium properties in the most sought-after locations.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <ng-container *ngFor="let property of featuredProperties">
          <app-property-card [property]="property"></app-property-card>
        </ng-container>
      </div>

      <div class="text-center mt-12">
        <a 
          routerLink="/properties"
          class="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          View All Properties
        </a>
      </div>
    </div>

    <!-- Why Choose Us -->
    <div class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Why Choose Us</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            We provide the best service and the most complete property options for you.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-home text-2xl text-indigo-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Wide Range of Properties</h3>
            <p class="text-gray-600">From apartments to villas, we have a variety of properties to suit your needs.</p>
          </div>

          <div class="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-hand-holding-usd text-2xl text-indigo-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">Best Prices</h3>
            <p class="text-gray-600">We offer competitive prices and the best deals in the market.</p>
          </div>

          <div class="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-headset text-2xl text-indigo-600"></i>
            </div>
            <h3 class="text-xl font-semibold mb-2">24/7 Support</h3>
            <p class="text-gray-600">Our dedicated team is always ready to assist you with any questions.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  featuredProperties: any[] = [];

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    this.featuredProperties = this.propertyService.getFeaturedProperties();
  }
}
