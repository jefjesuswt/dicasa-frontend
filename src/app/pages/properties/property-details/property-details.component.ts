import {
  afterNextRender,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from "@angular/core";
import { trigger, transition, style, animate } from "@angular/animations";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { NgMagnizoomModule } from "ng-magnizoom";

import { PropertyService } from "../../../services/property.service";
import { Property } from "../../../interfaces/properties/property.interface";
import { AppointmentFormComponent } from "../../../shared/appointment-form/appointment-form.component";
import { AvatarComponent } from "../../../shared/avatar/avatar.component";
import { SeoService } from "../../../services/seo.service";

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
  selector: "properties-property-details",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgMagnizoomModule,
    AppointmentFormComponent,
    AvatarComponent,
  ],
  templateUrl: "./property-details.component.html",
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
    trigger("fadeImage", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("400ms ease-out", style({ opacity: 1 })),
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

  private statusLabels: Record<string, string> = {
    sale: "En Venta",
    rent: "En Alquiler",
    sold: "Vendida",
    rented: "Alquilada",
  };

  /* ESTILO ARQUITECTÓNICO:
     Usamos bordes definidos y fondos sólidos semitransparentes
     en lugar de efectos "glow" difusos.
  */
  private statusClasses: Record<string, string> = {
    sale: "bg-emerald-950/50 text-emerald-400 border-emerald-500/50",
    rent: "bg-sky-950/50 text-sky-400 border-sky-500/50",
    sold: "bg-slate-800 text-slate-400 border-slate-600 line-through",
    rented: "bg-purple-950/50 text-purple-400 border-purple-500/50",
  };

  private typeLabels: Record<string, string> = {
    apartment: "Apartamento",
    house: "Casa",
    villa: "Villa",
    land: "Terreno",
    commercial: "Comercial",
  };

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || "No disponible";
  }

  getStatusClass(status: string): string {
    return (
      this.statusClasses[status] ||
      "bg-slate-800 text-slate-400 border-slate-600"
    );
  }

  getTypeLabel(type: string): string {
    return this.typeLabels[type] || "No especificado";
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }

    this.route.paramMap.subscribe((params) => {
      const id = params.get("id");
      if (id) {
        this.loadProperty(id);
      } else {
        this.setError("ID de propiedad no proporcionado");
      }
    });
  }

  private loadProperty(id: string): void {
    this.setLoading(true);
    this.propertyService
      .getProperty(id)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: (property) => {
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
              : ["/assets/images/placeholder-property.jpg"],
          };
          this.setState({
            property: propertyWithImages,
            error: null,
            activeImageIndex: 0,
          });
        },
        error: (errorMessage) => {
          this.setError(errorMessage);
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
    this.router.navigate(["/properties"]);
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
