import { Injectable } from '@angular/core';
import { Property } from '../models/property.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private properties: Property[] = [
    {
      id: 1,
      title: 'Modern Apartment in Downtown',
      location: 'New York, NY',
      price: 250000,
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&auto=format&fit=crop&q=60',
      ],
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      type: 'apartment',
      status: 'sale',
      featured: true,
      description: 'Beautiful modern apartment in the heart of the city.',
      features: {
        hasParking: true,
        hasAC: true,
        hasFurniture: true
      }
    },
    {
      id: 2,
      title: 'Luxury Villa with Pool',
      location: 'Miami, FL',
      price: 3500,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60',
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1600585154526-990dced4b71b?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1600585154518-4f4c68fad0c6?w=800&auto=format&fit=crop&q=60'
      ],
      bedrooms: 4,
      bathrooms: 3.5,
      area: 2800,
      type: 'villa',
      status: 'rent',
      featured: true,
      description: 'Stunning villa with private pool and ocean view.',
      features: {
        hasParking: true,
        hasPool: true,
        hasGarden: true,
        hasAC: true,
        isPetFriendly: true
      }
    },
    {
      id: 3,
      title: 'Cozy Studio Apartment',
      location: 'San Francisco, CA',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=60',
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1502672260266-37e1e0d1036a?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800&auto=format&fit=crop&q=60'
      ],
      bedrooms: 1,
      bathrooms: 1,
      area: 650,
      type: 'apartment',
      status: 'rent',
      featured: false,
      description: 'Cozy studio apartment in the heart of the city.',
      features: {
        hasParking: false,
        hasAC: true,
        hasFurniture: true
      }
    },
    {
      id: 4,
      title: 'Spacious Family Home',
      location: 'Austin, TX',
      price: 385000,
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1600566751989-44f0a9946c00?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1600607687939-ce7557dac7d7?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1600566751989-44f0a9946c00?w=800&auto=format&fit=crop&q=60'
      ],
      bedrooms: 3,
      bathrooms: 2,
      area: 2100,
      type: 'house',
      status: 'sale',
      featured: true,
      description: 'Beautiful family home with spacious backyard.',
      features: {
        hasParking: true,
        hasGarden: true,
        hasAC: true,
        isPetFriendly: true
      }
    },
    {
      id: 5,
      title: 'Modern Loft in Arts District',
      location: 'Los Angeles, CA',
      price: 625000,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&auto=format&fit=crop&q=60'
      ],
      bedrooms: 2,
      bathrooms: 2,
      area: 1800,
      type: 'apartment',
      status: 'sale',
      featured: true,
      description: 'Stylish loft with exposed brick and modern finishes.',
      features: {
        hasParking: true,
        hasAC: true,
        hasFurniture: false,
        hasGarden: false
      }
    },
    {
      id: 6,
      title: 'Luxury Penthouse with City View',
      location: 'San Francisco, CA',
      price: 5200,
      image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&auto=format&fit=crop&q=60',
      images: [
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1502672260266-37e1e0d1036a?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60'
      ],
      bedrooms: 3,
      bathrooms: 3.5,
      area: 2400,
      type: 'apartment',
      status: 'rent',
      featured: false,
      description: 'Luxury penthouse apartment with stunning city view.',
      features: {
        hasParking: true,
        hasAC: true,
        hasFurniture: true,
        isPetFriendly: true
      }
    },
  ];

  constructor() {}

  getProperties(): Property[] {
    return [...this.properties];
  }

  deleteProperty(id: number): Observable<void> {
    return new Observable(observer => {
      const index = this.properties.findIndex(p => p.id === id);
      if (index !== -1) {
        this.properties.splice(index, 1);
        observer.next();
        observer.complete();
      } else {
        observer.error(new Error('Property not found'));
      }
    });
  }

  getFeaturedProperties(): Property[] {
    return this.properties.filter(property => property.featured);
  }

  getPropertyById(id: string | number): Property | undefined {
    const propertyId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.properties.find(property => property.id === propertyId);
  }

  getPropertiesByStatus(status: 'sale' | 'rent' | 'sold' | 'rented'): Property[] {
    return this.properties.filter(property => property.status === status);
  }

  getPropertiesByType(type: 'apartment' | 'house' | 'villa' | 'land' | 'commercial'): Property[] {
    return this.properties.filter(property => property.type === type);
  }
}
