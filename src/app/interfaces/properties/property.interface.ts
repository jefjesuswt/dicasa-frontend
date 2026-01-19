import { Agent } from "./agent.interface";

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  status: string;
  featured: boolean;
  address: Address;
  features: Features;
  agent: Agent;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface Features {
  hasParking: boolean;
  hasFurniture: boolean;
  hasPool: boolean;
  hasGarden: boolean;
  isPetFriendly: boolean;
}
