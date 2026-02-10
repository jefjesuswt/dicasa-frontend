import {
  afterNextRender,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';
import { NgMagnizoomModule } from 'ng-magnizoom';
import { environment } from '../../../../environments/environment';

import { PropertyService } from '../../../services/property.service';
import { Property } from '../../../interfaces/properties/property.interface';
import { AppointmentFormComponent } from '../../../shared/appointment-form/appointment-form.component';
import { AvatarComponent } from '../../../shared/avatar/avatar.component';
import { SeoService } from '../../../services/seo.service';

type PropertyState = {
  property: Property | null;
  loading: boolean;
  error: string | null;
  activeImageIndex: number;
  isImageLoading: boolean;
};

const initialState: PropertyState = {
  property: null,
  loading: true,
  error: null,
  activeImageIndex: 0,
  isImageLoading: false,
};

@Component({
  selector: 'properties-property-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgMagnizoomModule,
    AppointmentFormComponent,
    AvatarComponent,
  ],
  templateUrl: './property-details.component.html',
  styles: [
    `
      /* Personalización del scrollbar para las miniaturas */
      .custom-scrollbar::-webkit-scrollbar {
        height: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #38bdf8; /* sky-400 */
      }
    `,
  ],
  animations: [
    trigger('fadeImage', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class PropertyDetailsComponent implements OnInit {
  state: PropertyState = { ...initialState };
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private seoService = inject(SeoService); // <--- INYECTAR
  private platformId = inject(PLATFORM_ID); // <--- INYECTAR

  // Property for SSR check
  isBrowser = isPlatformBrowser(this.platformId);

  private statusLabels: Record<string, string> = {
    sale: 'En Venta',
    rent: 'En Alquiler',
    sold: 'Vendida',
    rented: 'Alquilada',
  };

  /* ESTILO ARQUITECTÓNICO:
     Usamos bordes definidos y fondos sólidos semitransparentes
     en lugar de efectos "glow" difusos.
  */
  private typeLabels: Record<string, string> = {
    apartment: 'Apartamento',
    house: 'Casa',
    villa: 'Villa',
    land: 'Terreno',
    commercial: 'Comercial',
  };

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || 'No disponible';
  }

  getTypeLabel(type: string): string {
    return this.typeLabels[type] || 'No especificado';
  }

  // --- MAPA (LEAFLET) ---
  private map: any; // Usar 'any' o importar tipos si es necesario

  get googleMapsUrl(): string {
    if (
      !this.state.property?.address?.latitude ||
      !this.state.property?.address?.longitude
    ) {
      return '';
    }
    const { latitude, longitude } = this.state.property.address;
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }

  private async fixLeafletIcons(L: any): Promise<void> {
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private async initDetailsMap(lat: number, lng: number): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    // Loading Leaflet dynamically only in browser
    // Use L.default for production builds (ES module interop)
    const leafletModule = await import('leaflet');
    const L = (leafletModule as any).default || leafletModule;
    await this.fixLeafletIcons(L);

    // Small timeout to ensure container exists
    setTimeout(() => {
      const container = document.getElementById('details-map');
      if (!container) return;

      if (this.map) {
        this.map.remove();
      }

      this.map = L.map('details-map', {
        center: [lat, lng],
        zoom: 15,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      const googleLink = this.googleMapsUrl;

      const popupContent = `
          <div style="text-align: center; color: #333; padding: 5px;">
            <b style="font-size: 14px;">${this.state.property?.title}</b><br>
            <a href="${googleLink}" target="_blank" style="display:inline-block; margin-top:8px; padding:6px 12px; background:#0284c7; color:white; border-radius:4px; text-decoration:none; font-size: 12px; font-weight: bold;">
              📍 Cómo llegar
            </a>
          </div>
        `;

      const marker = L.marker([lat, lng]).addTo(this.map);
      marker.bindPopup(popupContent).openPopup();
    }, 100);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProperty(id);
      } else {
        this.setError('ID de propiedad no proporcionado');
      }
    });
  }

  private loadProperty(id: string): void {
    this.setLoading(true);

    const isServer = !isPlatformBrowser(this.platformId);
    // En SSR, limitamos el tiempo de espera a 4s para evitar que Netlify mate la función (timeout 10s).
    // Si falla, el cliente reintentará.
    const requestTimeout = isServer ? 4000 : 30000;

    console.log(
      `[PropertyDetails] Loading property ${id} (Server: ${isServer})`
    );

    this.propertyService
      .getProperty(id)
      .pipe(
        timeout(requestTimeout),
        finalize(() => this.setLoading(false))
      )
      .subscribe({
        next: (property) => {
          console.log(`[PropertyDetails] Success loading ${id}`);
          // --- SEO DINÁMICO ---
          // Esto actualiza los metadatos con la info real de la casa
          const mainImage =
            property.images && property.images.length > 0
              ? property.images[0]
              : undefined;

          this.seoService.updateSeoData(
            property.title,
            `Propiedad en ${this.getStatusLabel(property.status)}. Precio: $${
              property.price
            }. ${property.description.substring(0, 100)}...`,
            mainImage
          );
          // --------------------

          const propertyWithImages = {
            ...property,
            images: property.images?.length
              ? property.images
              : ['/assets/images/placeholder-property.jpg'],
          };
          this.setState({
            property: propertyWithImages,
            error: null,
            activeImageIndex: 0,
          });

          if (property.address?.latitude && property.address?.longitude) {
            // Iniciar mapa Leaflet
            this.initDetailsMap(
              property.address.latitude,
              property.address.longitude
            );
          }
        },
        error: (err) => {
          console.error(`[PropertyDetails] Error loading ${id}:`, err);
          // Si es timeout en SSR, no mostramos error fatal, dejamos que el cliente reintente (hydration).
          // Pero por ahora, mostramos el error para depurar.
          this.setError('Error cargando propiedad. Intente recargar.');
        },
      });
  }

  private setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  private setError(error: string | null): void {
    this.setState({ error, loading: false });
  }

  private setState(partialState: Partial<PropertyState>): void {
    this.state = { ...this.state, ...partialState };
  }

  setActiveImage(index: number): void {
    if (!this.state.property?.images?.length) return;
    const maxIndex = this.state.property.images.length - 1;
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    if (newIndex === this.state.activeImageIndex) return;
    this.setState({ activeImageIndex: newIndex });
  }

  goBack(): void {
    this.router.navigate(['/properties']);
  }

  // Getters
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
