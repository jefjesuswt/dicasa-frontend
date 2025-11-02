import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { PropertyCardComponent } from "../../shared/property-card/property-card.component";
import { SectionHeaderComponent } from "../../shared/section-header/section-header.component";
import { ButtonComponent } from "../../shared/button/button.component";
import { PropertyService } from "../../services/property.service";
import { Property } from "../../interfaces/properties/property.interface";

@Component({
  selector: "home-home",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PropertyCardComponent,
    SectionHeaderComponent,
    ButtonComponent,
  ],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  featuredProperties: Property[] = [];
  loading = true;
  error: string | null = null;

  private propertyService = inject(PropertyService);

  ngOnInit(): void {
    this.loading = true;
    this.propertyService.getFeaturedProperties().subscribe({
      next: (properties) => {
        this.featuredProperties = properties;
        this.loading = false;
      },
      error: (errMessage) => {
        this.error = errMessage;
        this.loading = false;
      },
    });
  }

  onSearch(searchParams: any) {
    console.log("Search params:", searchParams);
  }
}
