import { Component, inject, OnInit, ViewChild, ElementRef, PLATFORM_ID, Inject } from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastService } from "../../../services/toast.service";
import { finalize, switchMap, tap } from "rxjs/operators";
import { Observable, of } from "rxjs";

import { PropertyService } from "../../../services/property.service";
import { Property } from "../../../interfaces/properties/property.interface";
import {
  CreatePropertyPayload,
  UpdatePropertyPayload,
} from "../../../services/property.service";

import { State } from "../../../interfaces/location/states.interface";
import { LocationService } from "../../../services/location.service";
import { User } from "../../../interfaces/users";
import { UsersService } from "../../../services/users.service";

import * as L from 'leaflet';
import 'leaflet-control-geocoder';
import { environment } from '../../../../environments/environment';

// Fix moved to ngOnInit to avoid SSR crash

@Component({
  selector: "app-property-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./property-form.component.html",
})
export class PropertyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private toast = inject(ToastService);
  private location = inject(LocationService);
  private usersService = inject(UsersService);
  private platformId = inject(PLATFORM_ID);

  propertyForm!: FormGroup;
  isAgentMode = false;
  isEditMode = false;
  propertyId: string | null = null;
  agents: User[] = [];
  pageTitle = "Agregar Nueva Propiedad";
  initialLoading = true;
  isSaving = false;

  // imagenes
  selectedFiles: File[] = [];
  existingImageUrls: string[] = [];
  imagePreviews: string[] = [];
  isUploadingImages = false;

  // location
  states: State[] = [];
  cities: string[] = [];
  isLoadingCities = false;

  // --- VARIABLES DEL MAPA (LEAFLET) ---
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private defaultLat = 10.136;
  private defaultLng = -64.686;

  ngOnInit(): void {
    // Check for Agent Mode
    this.isAgentMode = this.route.snapshot.data['isAgentMode'] || false;

    this.initializeForm();

    this.location
      .getStates()
      .pipe(
        tap((states) => {
          this.states = states;
        }),
        // Solo cargar agentes si NO estamos en modo agente
        switchMap(() => this.isAgentMode ? of([]) : this.usersService.getAgents()),
        tap((agents) => {
          this.agents = agents;
        }),
        switchMap(() => this.route.paramMap),
        switchMap((params) => {
          const id = params.get("id");
          if (id) {
            this.isEditMode = true;
            this.propertyId = id;
            this.pageTitle = this.isAgentMode ? "Editar Mi Propiedad" : "Editar Propiedad";

            return this.propertyService.getProperty(id);
          } else {
            this.isEditMode = false;
            this.propertyId = null;
            this.pageTitle = "Agregar Nueva Propiedad";
            return of(null);
          }
        }),
        finalize(() => {
          this.initialLoading = false;
        })
      )
      .subscribe({
        next: (property) => {
          this.initialLoading = false;

          if (property && this.isEditMode) {
            this.patchForm(property);
            this.existingImageUrls = [...property.images];
            this.propertyForm.markAsPristine();
            // Iniciar mapa con la propiedad cargada
            setTimeout(() => this.initMap(property), 500);
          } else {
            // Modo creación: iniciar mapa default
            setTimeout(() => this.initMap(), 500);
          }
        },
        error: (errMessage) => {
          this.initialLoading = false;
          this.toast.error("Error", `Error al cargar la propiedad: ${errMessage}`);
        },
      });
  }

  private initializeForm(): void {
    this.propertyForm = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(5)]],
      description: ["", [Validators.required, Validators.minLength(20)]],
      price: [null, [Validators.required, Validators.min(1)]],
      bedrooms: [0, [Validators.required, Validators.min(0)]],
      bathrooms: [0, [Validators.required, Validators.min(0)]],
      area: [null, [Validators.required, Validators.min(1)]],
      type: ["house", Validators.required],
      status: ["sale", Validators.required],
      featured: [false],

      address: this.fb.group({
        address: ["", Validators.required],
        city: ["", Validators.required],
        state: ["", Validators.required],
        country: ["Venezuela", Validators.required],
        latitude: [null],
        longitude: [null]
      }),

      features: this.fb.group({
        hasParking: [false],
        hasFurniture: [false],
        hasPool: [false],
        hasGarden: [false],
        isPetFriendly: [false],
      }),

      agent: [null, this.isAgentMode ? [] : Validators.required],
    });

    this.setupConditionalValidators();

    this.propertyForm
      .get("address.state")
      ?.valueChanges.subscribe((stateName) => {
        if (stateName) {
          // 👇 Llama a updateCities SIN el segundo parámetro.
          // updateCities ahora se encargará de resetear la ciudad.
          this.updateCities(stateName);
        } else {
          // Si el estado se borra, limpia las ciudades
          this.cities = [];
          this.propertyForm.get("address.city")?.setValue("");
        }
      });
  }

  private updateCities(stateName: string, cityToSelect?: string): void {
    this.isLoadingCities = true;
    this.cities = [];

    if (!stateName) {
      this.isLoadingCities = false;
      return;
    }

    this.location
      .getCities(stateName)
      .pipe(finalize(() => (this.isLoadingCities = false)))
      .subscribe({
        next: (cities) => {
          this.cities = cities;
          if (cityToSelect) {
            this.propertyForm.get("address.city")?.setValue(cityToSelect);
          } else {
            this.propertyForm.get("address.city")?.setValue("");
          }
        },
        error: (err) => {
          this.toast.error("Error", `Error al cargar ciudades: ${err.message}`);
          this.cities = [];
        },
      });
  }

  private patchForm(property: Property): void {
    this.propertyForm.patchValue(
      {
        title: property.title,
        description: property.description,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        type: property.type,
        status: property.status,
        featured: property.featured,
        address: {
          address: property.address?.address || "",
          state: property.address?.state || "",
          country: property.address?.country || "Venezuela",
        },
        features: {
          hasParking: property.features?.hasParking ?? false,
          hasFurniture: property.features?.hasFurniture ?? false,
          hasPool: property.features?.hasPool ?? false,
          hasGarden: property.features?.hasGarden ?? false,
          isPetFriendly: property.features?.isPetFriendly ?? false,
        },
        agent: property.agent?._id || null,
      },
      { emitEvent: false }
    );

    const stateValue = this.propertyForm.get("address.state")?.value;
    if (stateValue) {
      this.updateCities(stateValue, property.address?.city);
    }

    // Actualizar mapa si tiene coordenadas
    // El mapa se iniciará cuando se cargue la vista, pero si ya estamos aquí, podemos intentar resetearlo o guardar los valores
    // para que initMap los lea del formulario
    if (property.address?.latitude && property.address?.longitude) {
      // Los valores ya se parcharon al formulario arriba
    }

    this.toggleResidentialFields(
      property.type,
      this.propertyForm.get("bedrooms")!,
      this.propertyForm.get("bathrooms")!
    );
  }

  // --- EVENTOS DEL MAPA ---
  // --- LEAFLET MAP LOGIC ---
  private initMap(property?: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const container = document.getElementById('map-container');
    if (!container) return;

    if (this.map) {
      this.map.remove();
    }

    // Coordenadas iniciales
    let lat = this.defaultLat;
    let lng = this.defaultLng;

    // Si pasamos propiedad o el formulario ya tiene valores
    if (property?.address?.latitude && property?.address?.longitude) {
      lat = property.address.latitude;
      lng = property.address.longitude;
    } else {
      const formLat = this.propertyForm.get('address.latitude')?.value;
      const formLng = this.propertyForm.get('address.longitude')?.value;
      if (formLat && formLng) {
        lat = formLat;
        lng = formLng;
      }
    }

    this.map = L.map('map-container').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

    const updateFn = (lat: number, lng: number) => {
      this.propertyForm.get('address')?.patchValue({ latitude: lat, longitude: lng });
      this.propertyForm.markAsDirty();
    };

    this.marker.on('dragend', () => {
      if (this.marker) {
        const { lat, lng } = this.marker.getLatLng();
        updateFn(lat, lng);
      }
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.marker) {
        this.marker.setLatLng(e.latlng);
        updateFn(e.latlng.lat, e.latlng.lng);
      }
    });

    // NOMINATIM GEOCODER (OSM)
    // @ts-ignore
    const Geocoder = L.Control.Geocoder.nominatim({
      geocodingQueryParams: {
        countrycodes: 've',
        'accept-language': 'es'
      }
    });

    // @ts-ignore
    new L.Control.Geocoder({
      defaultMarkGeocode: false,
      placeholder: 'Buscar (ej: Santiago Mariño)...',
      geocoder: Geocoder
    })
      .on('markgeocode', (e: any) => {
        const center = e.geocode.center;
        this.map?.setView(center, 16);
        this.marker?.setLatLng(center);
        updateFn(center.lat, center.lng);
      })
      .addTo(this.map);
  }


  onSubmit(): void {
    if (this.propertyForm.invalid) {
      this.toast.error("Formulario Inválido", "Por favor, revisa los campos del formulario.");
      this.propertyForm.markAllAsTouched();
      return;
    }

    const hasImages = this.selectedFiles.length > 0 || this.existingImageUrls.length > 0;

    if (!hasImages) {
      this.toast.error(
        "Imagen Requerida",
        "Debes seleccionar al menos una imagen para la propiedad."
      );
      return;
    }

    this.isSaving = true;

    let upload$: Observable<string[]> = of([]);
    if (this.selectedFiles.length > 0) {
      this.isUploadingImages = true;
      upload$ = this.propertyService
        .uploadPropertyImages(this.selectedFiles)
        .pipe(finalize(() => (this.isUploadingImages = false)));
    }

    upload$
      .pipe(
        switchMap((newUrls) => {
          const finalImageUrls = [...this.existingImageUrls, ...newUrls];

          const formValue = this.propertyForm.value;
          const basePayload = {
            ...formValue,
            images: finalImageUrls,
            agentId: formValue.agent,
          };
          delete basePayload.agent;

          let action$: Observable<Property>;
          if (this.isEditMode && this.propertyId) {
            const payload: UpdatePropertyPayload = basePayload;
            action$ = this.propertyService.updateProperty(
              this.propertyId,
              payload
            );
          } else {
            const payload: CreatePropertyPayload = basePayload;
            action$ = this.propertyService.createProperty(payload);
          }
          return action$;
        }),
        finalize(() => (this.isSaving = false)) // End overall saving process
      )
      .subscribe({
        next: (savedProperty) => {
          this.toast.success(
            "Éxito",
            `Propiedad ${this.isEditMode ? "actualizada" : "creada"} con éxito!`
          );
          this.router.navigate(["/dashboard/properties"]);
        },
        error: (errMessage) => {
          // Handle potential upload errors caught by upload$ OR form submission errors
          this.toast.error("Error", `Error al guardar: ${errMessage}`);
          // Ensure loading states are reset on error
          this.isUploadingImages = false;
          this.isSaving = false;
        },
      });
  }

  onFileSelect(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if (files) {
      this.selectedFiles = Array.from(files);
      this.generatePreviews();
    }
    element.value = "";
  }

  private generatePreviews(): void {
    this.imagePreviews = [];
    this.selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    this.existingImageUrls.splice(index, 1);
    this.propertyForm.markAsDirty();
  }

  cancel(): void {
    if (this.isAgentMode) {
      this.router.navigate(["/profile/my-properties"]);
    } else {
      this.router.navigate(["/dashboard/properties"]);
    }
  }

  get title() {
    return this.propertyForm.get("title");
  }

  get isResidentialType(): boolean {
    const type = this.propertyForm.get("type")?.value;
    return type === "house" || type === "apartment" || type === "villa";
  }

  private setupConditionalValidators(): void {
    const typeControl = this.propertyForm.get("type");
    const bedroomsControl = this.propertyForm.get("bedrooms");
    const bathroomsControl = this.propertyForm.get("bathrooms");

    if (!typeControl || !bedroomsControl || !bathroomsControl) return;

    typeControl.valueChanges.subscribe((type) => {
      this.toggleResidentialFields(type, bedroomsControl, bathroomsControl);
    });
  }

  private toggleResidentialFields(
    type: string,
    bedrooms: AbstractControl,
    bathrooms: AbstractControl
  ): void {
    const isResidential =
      type === "house" || type === "apartment" || type === "villa";

    if (isResidential) {
      bedrooms.setValidators([Validators.required, Validators.min(0)]);
      bathrooms.setValidators([Validators.required, Validators.min(0)]);
      bedrooms.enable();
      bathrooms.enable();
    } else {
      bedrooms.clearValidators();
      bathrooms.clearValidators();
      bedrooms.disable();
      bathrooms.disable();
      bedrooms.setValue(0);
      bathrooms.setValue(0);
    }
    bedrooms.updateValueAndValidity();
    bathrooms.updateValueAndValidity();
  }
}
