import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <!-- Property Image -->
      <div class="relative">
        <img 
          [src]="property.image" 
          [alt]="property.title" 
          class="w-full h-48 md:h-56 object-cover"
        >
        <div class="absolute top-2 right-2">
          <span 
            class="px-3 py-1 rounded-full text-xs font-semibold"
            [ngClass]="{
              'bg-green-100 text-green-800': property.type === 'sale',
              'bg-blue-100 text-blue-800': property.type === 'rent'
            }"
          >
            {{ property.type === 'sale' ? 'For Sale' : 'For Rent' }}
          </span>
        </div>
      </div>

      <!-- Property Details -->
      <div class="p-4">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ property.title }}</h3>
          <p class="text-indigo-600 font-bold">
            {{ property.type === 'sale' ? '$' + (property.price | number) : '$' + property.price + '/mo' }}
          </p>
        </div>
        
        <p class="text-gray-600 text-sm mb-3">
          <i class="fas fa-map-marker-alt text-red-500 mr-1"></i>
          {{ property.location }}
        </p>
        
        <div class="flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-3 mt-3">
          <span><i class="fas fa-bed mr-1"></i> {{ property.bedrooms }} Beds</span>
          <span><i class="fas fa-bath mr-1"></i> {{ property.bathrooms }} Baths</span>
          <span><i class="fas fa-ruler-combined mr-1"></i> {{ property.area }} m²</span>
        </div>

        <button 
          [routerLink]="['/properties', property.id]"
          class="mt-4 w-full bg-indigo-100 text-indigo-700 py-2 rounded-md font-medium hover:bg-indigo-200 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class PropertyCardComponent {
  @Input() property!: Property;
}
