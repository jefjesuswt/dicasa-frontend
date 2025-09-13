import { Injectable } from '@angular/core';
import { Property, propertyTypes } from '../models/property.model';

export type PropertyFilter = {
  type: string;
  search: string;
};

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private properties: Property[] = [
    {
      id: 1,
      title: 'Modern Apartment in Downtown',
      price: 250000,
      location: 'New York, NY',
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      image:
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60',
      type: 'sale',
      featured: true,
    },
    {
      id: 2,
      title: 'Luxury Villa with Ocean View',
      price: 4500,
      location: 'Miami, FL',
      bedrooms: 4,
      bathrooms: 3.5,
      area: 2800,
      image:
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60',
      type: 'rent',
      featured: true,
    },
    {
      id: 3,
      title: 'Cozy Studio in the Heart of the City',
      price: 1800,
      location: 'Chicago, IL',
      bedrooms: 1,
      bathrooms: 1,
      area: 650,
      image:
        'https://images.unsplash.com/photo-1502672260266-37c4ad445d69?w=800&auto=format&fit=crop&q=60',
      type: 'rent',
      featured: false,
    },
    {
      id: 4,
      title: 'Spacious Family Home',
      price: 385000,
      location: 'Austin, TX',
      bedrooms: 3,
      bathrooms: 2,
      area: 2100,
      image:
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
      type: 'sale',
      featured: true,
    },
    {
      id: 5,
      title: 'Modern Loft in Arts District',
      price: 320000,
      location: 'Los Angeles, CA',
      bedrooms: 1,
      bathrooms: 1,
      area: 950,
      image:
        'https://images.unsplash.com/photo-1484154218962-a197def68984?w=800&auto=format&fit=crop&q=60',
      type: 'sale',
      featured: false,
    },
    {
      id: 6,
      title: 'Luxury Penthouse with City View',
      price: 5200,
      location: 'San Francisco, CA',
      bedrooms: 3,
      bathrooms: 3.5,
      area: 2400,
      image:
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&auto=format&fit=crop&q=60',
      type: 'rent',
      featured: true,
    },
  ];

  getPropertyTypes() {
    return propertyTypes;
  }

  getProperties(filter: Partial<PropertyFilter> = {}) {
    let result = [...this.properties];

    if (filter.type && filter.type !== 'all') {
      result = result.filter((property) => property.type === filter.type);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(
        (property) =>
          property.title.toLowerCase().includes(searchLower) ||
          property.location.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }

  getFeaturedProperties() {
    return this.properties.filter((property) => property.featured);
  }

  getPropertyById(id: number): Property | undefined {
    return this.properties.find((property) => property.id === id);
  }
}
