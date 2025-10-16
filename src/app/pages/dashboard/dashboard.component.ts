import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';



// Define the type for the status mapping
const statusTypes = ['for_sale', 'for_rent', 'sold', 'rented'] as const;
type StatusType = typeof statusTypes[number];

// Define the type for the type mapping
const propertyTypes = ['house', 'apartment', 'land', 'commercial', 'villa'] as const;

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  textColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  properties: Property[] = [];
  loading = true;
  error: string | null = null;

  // Stats for the dashboard cards
  stats: StatCard[] = [
    { 
      title: 'Total de Propiedades', 
      value: 0, 
      icon: 'pi pi-home', 
      color: 'bg-blue-100', 
      textColor: 'text-blue-800' 
    },
    { 
      title: 'En Venta', 
      value: 0, 
      icon: 'pi pi-tag', 
      color: 'bg-green-100', 
      textColor: 'text-green-800' 
    },
    { 
      title: 'En Renta', 
      value: 0, 
      icon: 'pi pi-key', 
      color: 'bg-purple-100', 
      textColor: 'text-purple-800' 
    },
    { 
      title: 'Vendidas/Rentadas', 
      value: 0, 
      icon: 'pi pi-check-circle', 
      color: 'bg-yellow-100', 
      textColor: 'text-yellow-800' 
    }
  ];

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.loading = true;
    this.error = null;
    
    try {
      const properties = this.propertyService.getProperties();
      this.properties = properties;
      this.updateStats(properties);
      this.loading = false;
    } catch (error) {
      console.error('Error loading properties', error);
      this.error = 'Error al cargar las propiedades';
      this.loading = false;
    }
  }

  private updateStats(properties: Property[]): void {
    this.stats[0].value = properties.length;
    this.stats[1].value = properties.filter(p => p.status === 'sale').length; // Changed from 'for_sale' to 'sale'
    this.stats[2].value = properties.filter(p => p.status === 'rent').length; // Changed from 'for_rent' to 'rent'
    this.stats[3].value = properties.filter(p => p.status === 'sold' || p.status === 'rented').length;
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: Record<string, string> = {
      'sale': 'bg-blue-100 text-blue-800',
      'rent': 'bg-purple-100 text-purple-800',
      'sold': 'bg-green-100 text-green-800',
      'rented': 'bg-yellow-100 text-yellow-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'sale': 'En Venta',
      'rent': 'En Renta',
      'sold': 'Vendido',
      'rented': 'Rentado'
    };
    return statusLabels[status] || status;
  }

  getTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      'house': 'Casa',
      'apartment': 'Departamento',
      'land': 'Terreno',
      'commercial': 'Comercial',
      'villa': 'Villa'
    };
    return typeLabels[type] || type;
  }

  // Navigation methods
  viewProperty(id: number): void {
    this.router.navigate(['/properties', id]);
  }

  editProperty(property: Property): void {
    // Will be implemented later
    console.log('Edit property:', property.id);
  }

  deleteProperty(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
      this.propertyService.deleteProperty(id).subscribe({
        next: () => {
          this.loadProperties(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting property', error);
          this.error = 'Error al eliminar la propiedad';
        }
      });
    }
  }

  addProperty(): void {
    // Will be implemented later
    console.log('Add new property');
  }
}
