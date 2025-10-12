export interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
  images?: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: PropertyType;
  status: PropertyStatus;
  featured?: boolean;
  description?: string;
  features?: {
    hasParking?: boolean;
    hasAC?: boolean;
    hasFurniture?: boolean;
    hasPool?: boolean;
    hasGarden?: boolean;
    isPetFriendly?: boolean;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'land' | 'commercial';
export type PropertyStatus = 'sale' | 'rent' | 'sold' | 'rented';

export const propertyTypes: PropertyType[] = ['apartment', 'house', 'villa', 'land', 'commercial'];
