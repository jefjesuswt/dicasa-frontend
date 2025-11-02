import { Component, inject, OnInit } from "@angular/core";
import { trigger, transition, style, animate } from "@angular/animations";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { NgMagnizoomModule } from "ng-magnizoom";

import { PropertyService } from "../../../services/property.service";
import { Property } from "../../../interfaces/properties/property.interface";
import { AppointmentFormComponent } from "../../../shared/appointment-form/appointment-form.component";
import { AvatarComponent } from "../../../shared/avatar/avatar.component";

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
    NgMagnizoomModule,
    AppointmentFormComponent,
    AvatarComponent,
  ],
  templateUrl: "./property-details.component.html",
  animations: [
    trigger("slideUpDown", [
      transition(":increment", [
        style({ opacity: 0, transform: "translateY(5%)" }),
        animate(
          "300ms ease-out",
          style({ opacity: 1, transform: "translateY(0%)" })
        ),
      ]),

      transition(":decrement", [
        style({ opacity: 0, transform: "translateY(-5%)" }),
        animate(
          "300ms ease-out",
          style({ opacity: 1, transform: "translateY(0%)" })
        ),
      ]),
    ]),
  ],
})
export class PropertyDetailsComponent implements OnInit {
  state: PropertyState = { ...initialState };
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);

  private statusLabels: Record<string, string> = {
    sale: "En Venta",
    rent: "En Alquiler",
    sold: "Vendida",
    rented: "Alquilada",
  };
  private statusClasses: Record<string, string> = {
    sale: "bg-green-100 text-green-800",
    rent: "bg-blue-100 text-blue-800",
    sold: "bg-gray-100 text-gray-800",
    rented: "bg-yellow-100 text-yellow-800",
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
    return this.statusClasses[status] || "bg-gray-100 text-gray-800";
  }

  getTypeLabel(type: string): string {
    return this.typeLabels[type] || "No especificado";
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id");
      if (id) {
        this.loadProperty(id);
      } else {
        this.setError("No property ID provided");
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
          const propertyWithImages = {
            ...property,
            images: property.images?.length
              ? property.images
              : ["/assets/images/placeholder-property.jpg"],
          };

          this.setState({
            property: propertyWithImages,
            error: null,
          });
        },
        error: (errorMessage) => {
          console.error("Error loading property:", errorMessage);
          this.setError(errorMessage);
        },
      });
  }

  private setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  private setError(error: string | null): void {
    this.setState({
      error,
      loading: false,
    });
  }

  private setState(partialState: Partial<PropertyState>): void {
    this.state = { ...this.state, ...partialState };
  }

  setActiveImage(index: number): void {
    if (!this.state.property?.images?.length) return;

    const maxIndex = this.state.property.images.length - 1;
    const newIndex = Math.max(0, Math.min(index, maxIndex));

    if (newIndex === this.state.activeImageIndex) {
      return;
    }

    this.setState({ isImageLoading: true });

    setTimeout(() => {
      this.setState({
        activeImageIndex: newIndex,
        isImageLoading: false,
      });
    }, 0);
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
    this.router.navigate(["/properties"]);
  }

  onContactSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const contactData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    };

    console.log("Contact form submitted:", contactData);

    alert("¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.");
    form.reset();
  }

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

  get isImageLoading(): boolean {
    return this.state.isImageLoading;
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    if (element) {
      element.src = "/assets/images/placeholder-property.png";
    }
  }
}
