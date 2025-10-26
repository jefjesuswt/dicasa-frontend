import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { HotToastService } from "@ngxpert/hot-toast";
import { finalize } from "rxjs/operators";
import {
  CountryISO,
  NgxIntlTelInputModule,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";
import { parsePhoneNumberFromString } from "libphonenumber-js/max";

import { UsersService } from "../../../services/users.service";
import { AuthService } from "../../../services/auth.service";

import { AvatarComponent } from "../../../shared/avatar/avatar.component";

@Component({
  selector: "profile-my-info",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    AvatarComponent,
  ],
  templateUrl: "./my-info.component.html", // Asegúrate que el path sea correcto
})
export class MyInfoComponent implements OnInit {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private toast = inject(HotToastService);

  currentUser = this.authService.currentUser;
  loadingPassword = false;
  loadingInfo = false;
  showPasswordForm = false;
  uploadingPicture = false;

  @ViewChild("fileInput") fileInput!: ElementRef;

  searchCountryField = [SearchCountryField.Iso2, SearchCountryField.Name];
  preferredCountries: CountryISO[] = [
    CountryISO.Venezuela,
    CountryISO.UnitedStates,
  ];
  phoneFormat = PhoneNumberFormat.International;
  CountryISO = CountryISO;

  infoForm: FormGroup = this.fb.group({
    name: ["", Validators.required],
    email: [{ value: "", disabled: true }, Validators.required],
    phoneNumber: [null, [Validators.required]],
  });

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ["", Validators.required],
      newPassword: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  defaultAvatar: string = `https://api.dicebear.com/9.x/avataaars/svg?seed=User`;

  ngOnInit(): void {
    const user = this.currentUser();

    if (user && user.phoneNumber) {
      const fullCleanNumber = user.phoneNumber.replace(/[\s-]/g, "");
      let numberToPatch = fullCleanNumber;
      try {
        const phoneNumber = parsePhoneNumberFromString(fullCleanNumber);
        if (phoneNumber && phoneNumber.nationalNumber) {
          numberToPatch = phoneNumber.nationalNumber;
        }
      } catch (error) {
        console.error("Error parsing phone number:", error);
        numberToPatch = fullCleanNumber;
      }

      this.infoForm.patchValue({
        name: user.name,
        email: user.email,
        phoneNumber: numberToPatch,
      });
    }
  }

  // --- Método para cambiar el estado ---
  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
  }

  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const pass = g.get("newPassword")?.value;
    const confirmPass = g.get("confirmPassword")?.value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  // --- Getters ---
  get name() {
    return this.infoForm.get("name");
  }
  get email() {
    return this.infoForm.get("email");
  }
  get phoneNumber() {
    return this.infoForm.get("phoneNumber");
  }

  // --- Submit Handlers ---
  onInfoSubmit(): void {
    const user = this.currentUser();

    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      this.toast.error("Por favor, revisa tu información.");
      return;
    }

    const phoneValue = this.infoForm.value.phoneNumber;
    let internationalPhoneNumber: string;

    if (
      typeof phoneValue === "object" &&
      phoneValue !== null &&
      phoneValue.internationalNumber
    ) {
      internationalPhoneNumber = phoneValue.internationalNumber;
    } else if (typeof phoneValue === "string" && user?.phoneNumber) {
      internationalPhoneNumber = user.phoneNumber.replace(/[\s-]/g, "");
    } else {
      this.toast.error("Número de teléfono inválido.");
      this.phoneNumber?.setErrors({ invalidNumber: true });
      return;
    }

    const updatedData = {
      name: this.infoForm.value.name,
      phoneNumber: internationalPhoneNumber,
    };

    this.loadingInfo = true;

    // 1. Llama al UsersService
    this.usersService
      .updateMyInfo(updatedData)
      .pipe(finalize(() => (this.loadingInfo = false)))
      .subscribe({
        next: (updatedUser) => {
          // 2. Llama al AuthService para actualizar el estado global
          this.authService.updateCurrentUserState(updatedUser);

          this.toast.success("Información actualizada con éxito.");
        },
        error: (errMessage) => {
          this.toast.error(errMessage);
        },
      });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files?.[0];

    if (!file) return; // El usuario cerró el diálogo

    // Validación de tipo (corresponde con tu ParseFilePipe en NestJS)
    if (
      ![
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "image/gif",
      ].includes(file.type)
    ) {
      this.toast.error("Tipo de archivo no válido.");
      return;
    }

    // Validación de tamaño (5MB, corresponde con tu ParseFilePipe)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      this.toast.error("La imagen es muy grande (máx 5MB).");
      return;
    }

    this.uploadingPicture = true;

    // 1. Llama al UsersService
    this.usersService
      .updateProfilePicture(file)
      .pipe(
        finalize(() => {
          this.uploadingPicture = false;
          // Resetea el input para que pueda subir la misma foto otra vez
          if (this.fileInput) {
            this.fileInput.nativeElement.value = "";
          }
        })
      )
      .subscribe({
        next: (updatedUser) => {
          // 2. Llama al AuthService para actualizar el estado global
          this.authService.updateCurrentUserState(updatedUser);

          this.toast.success("¡Foto de perfil actualizada!");
        },
        error: (errMessage) => {
          this.toast.error(errMessage);
        },
      });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.loadingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.usersService
      .changePassword(currentPassword, newPassword)
      .pipe(finalize(() => (this.loadingPassword = false)))
      .subscribe({
        next: (response) => {
          this.toast.success(response.message || "¡Contraseña actualizada!");
          this.passwordForm.reset();
          this.showPasswordForm = false; // Oculta el form después de éxito
        },
        error: (errMessage) => {
          this.toast.error(errMessage);
        },
      });
  }

  triggerFileInput(): void {
    if (!this.uploadingPicture) {
      this.fileInput.nativeElement.click();
    }
  }

  onImageError(event: Event): void {
    const element = event.target as HTMLImageElement;
    element.src = this.defaultAvatar;
  }
}
