import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngxpert/hot-toast";
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
  private toast = inject(HotToastService);
  private location = inject(LocationService);
  private usersService = inject(UsersService);

  propertyForm!: FormGroup;
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

  constructor() {}

  ngOnInit(): void {
    this.initializeForm();

    this.location
      .getStates()
      .pipe(
        tap((states) => {
          this.states = states;
        }),
        switchMap(() => this.usersService.getAgents()),
        tap((agents) => {
          this.agents = agents;
        }),
        switchMap(() => this.route.paramMap),
        switchMap((params) => {
          const id = params.get("id");
          if (id) {
            this.isEditMode = true;
            this.propertyId = id;
            this.pageTitle = "Editar Propiedad";

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
          }
        },
        error: (errMessage) => {
          this.initialLoading = false;
          this.toast.error(`Error al cargar la propiedad: ${errMessage}`);
        },
      });
  }

  private initializeForm(): void {
    this.propertyForm = this.fb.group({
      title: ["", [Validators.required, Validators.minLength(5)]],
      description: ["", [Validators.required, Validators.minLength(20)]],
      price: [null, [Validators.required, Validators.min(1)]],
      bedrooms: [null, [Validators.required, Validators.min(0)]],
      bathrooms: [null, [Validators.required, Validators.min(0)]],
      area: [null, [Validators.required, Validators.min(1)]],
      type: ["house", Validators.required],
      status: ["sale", Validators.required],
      featured: [false],

      address: this.fb.group({
        address: ["", Validators.required],
        city: ["", Validators.required],
        state: ["", Validators.required],
        country: ["Venezuela", Validators.required],
      }),

      features: this.fb.group({
        hasParking: [false],
        hasFurniture: [false],
        hasPool: [false],
        hasGarden: [false],
        isPetFriendly: [false],
      }),

      agent: [null, Validators.required],
    });

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
          this.toast.error(`Error al cargar ciudades: ${err.message}`);
          this.cities = [];
        },
      });
  }

  private patchForm(property: Property): void {
    this.propertyForm.patchValue({
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
        address: property.address.address,
        // city: property.address.city,
        state: property.address.state,
        country: property.address.country,
      },
      features: {
        hasParking: property.features.hasParking,
        hasFurniture: property.features.hasFurniture,
        hasPool: property.features.hasPool,
        hasGarden: property.features.hasGarden,
        isPetFriendly: property.features.isPetFriendly,
      },
      agent: property.agent?._id || null,
    });

    const stateValue = this.propertyForm.get("address.state")?.value;
    if (stateValue) {
      this.updateCities(stateValue, property.address.city);
    }
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) {
      this.toast.error("Por favor, revisa los campos del formulario.");
      this.propertyForm.markAllAsTouched();
      return;
    }

    if (
      this.existingImageUrls.length === 0 &&
      this.selectedFiles.length === 0
    ) {
      this.toast.error(
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
            `Propiedad ${this.isEditMode ? "actualizada" : "creada"} con éxito!`
          );
          this.router.navigate(["/dashboard/properties"]);
        },
        error: (errMessage) => {
          // Handle potential upload errors caught by upload$ OR form submission errors
          this.toast.error(`Error al guardar: ${errMessage}`);
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
    this.router.navigate(["/dashboard/properties"]);
  }

  get title() {
    return this.propertyForm.get("title");
  }
}
