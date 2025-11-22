import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
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
import { ToastService } from "../../../services/toast.service";
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
  templateUrl: "./my-info.component.html",
  styles: [
    `
      /* --- ESTILOS PARA EL INPUT DE TELÉFONO (Match con Appointment Form) --- */
      .iti {
        width: 100%;
        display: block;
      }

      .iti__flag-container {
        padding-left: 0.8rem !important; /* Espacio izquierdo */
      }

      .iti__tel-input {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        color: white !important;
        font-family: "Courier New", monospace !important;
        font-size: 1rem !important;
        width: 100%;
        height: 100%;
        padding-left: 5.4rem !important;
      }

      .iti__country-list {
        background-color: #020617 !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(10px);
        color: #e2e8f0 !important;
        margin-top: 5px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
      }

      .iti__country:hover,
      .iti__country.iti__highlight {
        background-color: rgba(56, 189, 248, 0.1) !important;
        color: #38bdf8 !important;
      }

      .iti__arrow {
        border-top-color: #94a3b8 !important;
      }
      .iti__arrow.iti__arrow--up {
        border-bottom-color: #38bdf8 !important;
      }
    `,
  ],
})
export class MyInfoComponent implements OnInit {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService); // <--- Inyectamos el nuestro

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

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
  }

  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const pass = g.get("newPassword")?.value;
    const confirmPass = g.get("confirmPassword")?.value;
    return pass === confirmPass ? null : { mismatch: true };
  }

  get name() {
    return this.infoForm.get("name");
  }
  get email() {
    return this.infoForm.get("email");
  }
  get phoneNumber() {
    return this.infoForm.get("phoneNumber");
  }

  onInfoSubmit(): void {
    const user = this.currentUser();
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      this.toast.error(
        "Formulario Inválido",
        "Por favor revisa los campos marcados."
      );
      return;
    }

    const phoneValue = this.infoForm.value.phoneNumber;
    let internationalPhoneNumber: string;

    if (typeof phoneValue === "object" && phoneValue?.internationalNumber) {
      internationalPhoneNumber = phoneValue.internationalNumber;
    } else if (typeof phoneValue === "string" && user?.phoneNumber) {
      internationalPhoneNumber = user.phoneNumber.replace(/[\s-]/g, "");
    } else {
      this.toast.error(
        "Teléfono Inválido",
        "El formato del número no es correcto."
      );
      this.phoneNumber?.setErrors({ invalidNumber: true });
      return;
    }

    const updatedData = {
      name: this.infoForm.value.name,
      phoneNumber: internationalPhoneNumber,
    };

    this.loadingInfo = true;
    this.usersService
      .updateMyInfo(updatedData)
      .pipe(finalize(() => (this.loadingInfo = false)))
      .subscribe({
        next: (updatedUser) => {
          this.authService.updateCurrentUserState(updatedUser);
          this.toast.success(
            "Perfil Actualizado",
            "Tu información personal ha sido guardada."
          );
        },
        error: (errMessage) => {
          this.toast.error(
            "Error de Actualización",
            typeof errMessage === "string"
              ? errMessage
              : "No se pudo guardar los cambios."
          );
        },
      });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files?.[0];
    if (!file) return;

    if (
      !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
        file.type
      )
    ) {
      this.toast.warning(
        "Formato No Soportado",
        "Por favor usa JPG, PNG o WEBP."
      );
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      this.toast.warning(
        "Archivo Muy Grande",
        "La imagen no debe superar los 5MB."
      );
      return;
    }

    this.uploadingPicture = true;
    this.usersService
      .updateProfilePicture(file)
      .pipe(
        finalize(() => {
          this.uploadingPicture = false;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = "";
          }
        })
      )
      .subscribe({
        next: (updatedUser) => {
          this.authService.updateCurrentUserState(updatedUser);
          this.toast.success(
            "Foto Actualizada",
            "Tu imagen de perfil se ha renovado."
          );
        },
        error: (errMessage) => {
          this.toast.error("Error de Subida", "No se pudo procesar la imagen.");
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
          this.toast.success(
            "Seguridad Actualizada",
            response.message || "Contraseña cambiada correctamente."
          );
          this.passwordForm.reset();
          this.showPasswordForm = false;
        },
        error: (errMessage) => {
          // Aquí asumimos que el error viene como string gracias a tu lógica anterior,
          // pero el toast service espera (titulo, mensaje).
          this.toast.error(
            "Error de Seguridad",
            errMessage || "La contraseña actual es incorrecta."
          );
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
