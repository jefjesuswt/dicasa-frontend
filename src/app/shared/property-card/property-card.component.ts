import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Property } from '../../models/property.model';

@Component({
  selector: 'shared-property-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-card.component.html',
})
export class PropertyCardComponent {
  @Input() property!: Property;

  getStatusClass(status: string): string {
    switch (status) {
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'rent':
        return 'bg-blue-100 text-blue-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'rented':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'sale':
        return 'En Venta';
      case 'rent':
        return 'En Alquiler';
      case 'sold':
        return 'Vendido';
      case 'rented':
        return 'Alquilado';
      default:
        return 'Disponible';
    }
  }
}
