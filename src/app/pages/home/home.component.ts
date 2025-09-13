import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, PropertyCardComponent],
  templateUrl: './home.component.html',
  styles: [],
})
export class HomeComponent implements OnInit {
  featuredProperties: any[] = [];

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    this.featuredProperties = this.propertyService.getFeaturedProperties();
  }
}
