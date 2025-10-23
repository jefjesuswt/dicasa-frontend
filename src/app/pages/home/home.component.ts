import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyCardComponent } from '../../shared/property-card/property-card.component';
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'home-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PropertyCardComponent,
    SearchBarComponent,
    SectionHeaderComponent,
    ButtonComponent
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  featuredProperties: Property[] = [];

  constructor(private propertyService: PropertyService) {
    this.featuredProperties = this.propertyService.getFeaturedProperties();
  }

  onSearch(searchParams: any) {
    // Aquí puedes implementar la lógica de búsqueda
    console.log('Search params:', searchParams);
    // Por ejemplo, podrías navegar a la página de propiedades con los parámetros de búsqueda
    // this.router.navigate(['/propiedades'], { queryParams: searchParams });
  }
}
