import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  afterNextRender,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { PropertyCardComponent } from '../../../shared/property-card/property-card.component';
import { ComparisonService } from '../../../services/comparison.service';
import {
  DropdownOption,
  SearchBarComponent,
  SearchParams,
} from '../../../shared/search-bar/search-bar.component';
import { FormsModule } from '@angular/forms';
import { Property } from '../../../interfaces/properties/property.interface';
import { finalize } from 'rxjs';
import { PaginatedProperties } from '../../../interfaces/properties/paginated-properties.interface';
import { QueryPropertiesParams } from '../../../interfaces/properties/query-property.interface';
import { PropertyStatus } from '../../../interfaces/properties/property-status.enum';
import Fingerprint from 'fingerprinter-js';
import { AnalyticsService } from '../../../services/analytics.service';
import { v4 as uuidv4 } from 'uuid';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'properties-properties',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PropertyCardComponent,
    SearchBarComponent,
    FormsModule,
  ],
  templateUrl: './properties.component.html',
  styles: [
    `
      .transition-opacity {
        transition: opacity 0.3s ease-in-out;
      }
      @keyframes loading-bar {
        0% {
          transform: translateX(-100%) scaleX(0.2);
        }
        50% {
          transform: translateX(0%) scaleX(0.5);
        }
        100% {
          transform: translateX(100%) scaleX(0.2);
        }
      }
      .bg-grid {
        background-image: radial-gradient(
          var(--border-light) 1px,
          transparent 1px
        );
        background-size: 30px 30px;
      }
    `,
  ],
})
export class PropertiesComponent implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  properties: Property[] = [];
  loading = true;
  isInitialLoad = true;
  error: string | null = null;

  searchQuery: string = '';
  selectedType: string = 'all';
  currentStatus: string = 'all';
  statusList: PropertyStatus[] = ['sale', 'rent'];

  public propertyTypeOptions: DropdownOption[] = [
    { value: 'apartment', label: 'Apartamento' },
    { value: 'house', label: 'Casa' },
    { value: 'villa', label: 'Villa' },
    { value: 'land', label: 'Terreno' },
    { value: 'commercial', label: 'Comercial' },
  ];

  // Status options for public view
  public statusOptions: DropdownOption[] = [
    { value: 'all', label: 'Todos los Estatus' },
    { value: 'sale', label: 'En Venta' },
    { value: 'rent', label: 'En Alquiler' },
  ];

  // Sort options
  public sortOptions = [
    { label: 'Más Recientes', value: 'createdAt', order: 'desc' },
    { label: 'Más Antiguos', value: 'createdAt', order: 'asc' },
    { label: 'Precio: Mayor a Menor', value: 'price', order: 'desc' },
    { label: 'Precio: Menor a Mayor', value: 'price', order: 'asc' },
  ];

  // Advanced filters
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedSort: string = 'createdAt';
  selectedOrder: 'asc' | 'desc' = 'desc';

  public totalProperties = 0;
  public currentPage = 1;
  public itemsPerPage = 10;

  private propertyService = inject(PropertyService);
  private analyticsService = inject(AnalyticsService);
  private seoService = inject(SeoService);
  public comparisonService = inject(ComparisonService);

  constructor() {
    afterNextRender(() => {
      this.initScrollObserver();
    });
  }

  async ngOnInit(): Promise<void> {
    // SEO
    this.seoService.updateSeoData(
      'Propiedades',
      'Explora nuestro catálogo de casas, apartamentos y terrenos en venta y alquiler en Lechería.'
    );

    this.loadProperties();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private initScrollObserver() {
    this.observer?.disconnect();

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, options);

    setTimeout(() => {
      const elements = this.document.querySelectorAll('.reveal-on-scroll');
      elements.forEach((el) => this.observer?.observe(el));
    }, 100);
  }

  loadProperties(): void {
    this.loading = true;
    this.error = null;

    const params: QueryPropertiesParams = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchQuery || undefined,
      type: this.selectedType === 'all' ? undefined : this.selectedType,
      status:
        this.currentStatus === 'all'
          ? undefined
          : (this.currentStatus as PropertyStatus),
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      sortBy: this.selectedSort,
      sortOrder: this.selectedOrder,
    };

    this.propertyService
      .getPublicProperties(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.isInitialLoad = false;
        })
      )
      .subscribe({
        next: (response: PaginatedProperties) => {
          this.properties = response.data;
          this.totalProperties = response.total;

          if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => this.initScrollObserver(), 100);
          }
        },
        error: (errMessage) => {
          this.error = errMessage;
        },
      });
  }

  onSearch(params: SearchParams): void {
    this.searchQuery = params.query;
    this.selectedType = params.selectedValue;
    this.currentStatus = params.status || 'all';
    this.minPrice = params.minPrice ?? null;
    this.maxPrice = params.maxPrice ?? null;
    this.selectedSort = params.sortBy || 'createdAt';
    this.selectedOrder = params.sortOrder || 'desc';
    this.currentPage = 1;
    this.loadProperties();
  }

  onTypeChange(): void {
    this.currentPage = 1;
    this.loadProperties();
  }

  filterByStatus(status: string): void {
    this.currentStatus = status;
    this.currentPage = 1;
    this.loadProperties();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedType = 'all';
    this.currentStatus = 'all';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedSort = 'createdAt';
    this.selectedOrder = 'desc';
    this.currentPage = 1;
    this.loadProperties();
  }

  get totalPages(): number {
    return Math.ceil(this.totalProperties / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadProperties();

    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      apartment: 'Apartamento',
      house: 'Casa',
      villa: 'Villa',
      land: 'Terreno',
      commercial: 'Comercial',
    };
    return labels[type] || type;
  }
}
