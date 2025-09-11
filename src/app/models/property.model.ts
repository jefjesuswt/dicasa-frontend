export interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  type: 'sale' | 'rent';
  featured: boolean;
}

export const propertyTypes = [
  { id: 'all', name: 'All Properties' },
  { id: 'sale', name: 'For Sale' },
  { id: 'rent', name: 'For Rent' }
];
