import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define a type for the property state
type PropertyState = {
  property: Property | null;
  loading: boolean;
  error: string | null;
  activeImageIndex: number;
};

const initialState: PropertyState = {
  property: null,
  loading: true,
  error: null,
  activeImageIndex: 0
};

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-details.component.html',
})
export class PropertyDetailsComponent implements OnInit {
  state: PropertyState = { ...initialState };

  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProperty(id);
      } else {
        this.setError('No property ID provided');
      }
    });
  }

  private loadProperty(id: string): void {
    this.setLoading(true);
    
    try {
      const property = this.propertyService.getPropertyById(id);
      
      if (property) {
        // Ensure images array exists and has at least one image
        const propertyWithImages = {
          ...property,
          images: property.images?.length ? property.images : ['/assets/images/placeholder-property.jpg']
        };
        
        this.setState({
          property: propertyWithImages,
          loading: false,
          error: null
        });
      } else {
        this.setError('Property not found');
      }
    } catch (error) {
      console.error('Error loading property:', error);
      this.setError('Error loading property details');
    }
  }

  // State management helpers
  private setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  private setError(error: string | null): void {
    this.setState({ 
      error,
      loading: false 
    });
  }

  private setState(partialState: Partial<PropertyState>): void {
    this.state = { ...this.state, ...partialState };
  }

  // Public methods for template
  setActiveImage(index: number): void {
    if (!this.state.property?.images?.length) return;
    
    const maxIndex = this.state.property.images.length - 1;
    this.setState({
      activeImageIndex: Math.max(0, Math.min(index, maxIndex))
    });
  }

  previousImage(): void {
    if (!this.state.property?.images?.length) return;
    this.setActiveImage(this.state.activeImageIndex - 1);
  }

  nextImage(): void {
    if (!this.state.property?.images?.length) return;
    this.setActiveImage(this.state.activeImageIndex + 1);
  }

  goBack(): void {
    this.router.navigate(['/properties']);
  }

  // Getters for template
  get property(): Property | null {
    return this.state.property;
  }

  get loading(): boolean {
    return this.state.loading;
  }

  get error(): string | null {
    return this.state.error;
  }

  get activeImageIndex(): number {
    return this.state.activeImageIndex;
  }
}
