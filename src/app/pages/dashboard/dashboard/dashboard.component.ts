import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { AuthService } from '../../../services/auth.service';
import { finalize } from 'rxjs';
import { Property } from '../../../interfaces/properties';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginatedProperties } from '../../../interfaces/properties/paginated-properties.interface';
import { StatCard } from '../../../interfaces/dashboard/stat-card.interface';
import { StatCardsComponent } from '../../../components/dashboard/stat-cards/stat-cards.component';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'dashboard-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, StatCardsComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);
  private destroyRef = inject(DestroyRef);
  private document = inject(DOCUMENT);
  private seoService = inject(SeoService);
  private platformId = inject(PLATFORM_ID);

  public statsLoading = true;
  public user = computed(() => this.authService.currentUser());
  public isAdmin = computed(() => this.authService.isAdmin());
  public isManager = computed(() => this.authService.isManager());
  private observer: IntersectionObserver | null = null;

  public stats: StatCard[] = [
    {
      title: 'Total de Propiedades',
      value: 0,
      icon: 'pi pi-home',
      color: 'bg-blue-100', // OJO: Estos colores quizás debas ajustarlos en el hijo luego
      textColor: 'text-blue-800',
    },
    {
      title: 'En Venta',
      value: 0,
      icon: 'pi pi-tag',
      color: 'bg-green-100',
      textColor: 'text-green-800',
    },
    {
      title: 'En Alquiler',
      value: 0,
      icon: 'pi pi-key',
      color: 'bg-purple-100',
      textColor: 'text-purple-800',
    },
    {
      title: 'Vendidas/Rentadas',
      value: 0,
      icon: 'pi pi-check-circle',
      color: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
  ];

  constructor() {
    afterNextRender(() => {
      this.initScrollAnimations();
    });
  }

  ngOnInit(): void {
    this.seoService.updateSeoData(
      'Panel de Control',
      'Gestión administrativa de propiedades y usuarios.'
    );

    this.loadStatsData();
    this.propertyService.statsUpdates$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadStatsData();
      });
  }

  // Lógica UI para animaciones (Copiada del estilo de referencia)
  ngAfterViewInit() {
    this.initScrollAnimations();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  loadStatsData(): void {
    this.statsLoading = true;
    this.propertyService
      .getProperties({ page: 1, limit: 1000 })
      .pipe(finalize(() => (this.statsLoading = false)))
      .subscribe({
        next: (response: PaginatedProperties) => {
          this.updateStats(response.data);
        },
        error: (error) => {
          console.error('Error loading stats data', error);
        },
      });
  }

  private updateStats(properties: Property[]): void {
    this.stats[0].value = properties.length;
    this.stats[1].value = properties.filter((p) => p.status === 'sale').length;
    this.stats[2].value = properties.filter((p) => p.status === 'rent').length;
    this.stats[3].value = properties.filter(
      (p) => p.status === 'sold' || p.status === 'rented'
    ).length;
  }

  private initScrollAnimations() {
    this.observer?.disconnect();

    // Check if running in browser/environment with IntersectionObserver
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const options = { root: null, rootMargin: '0px', threshold: 0.1 };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, options);

    const elements = this.document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => this.observer?.observe(el));
  }
}
