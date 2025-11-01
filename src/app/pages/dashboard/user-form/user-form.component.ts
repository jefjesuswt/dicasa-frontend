import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { finalize, Observable, of } from "rxjs";
import { HotToastService } from "@ngxpert/hot-toast";

import {
  NgxIntlTelInputModule,
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from "ngx-intl-tel-input";

import {
  CreateUserPayload,
  UpdateUserPayload,
  UsersService,
} from "../../../services/users.service";
import { User } from "../../../interfaces/users";
import { UserRole } from "../../../interfaces/users/roles.enum";

@Component({
  selector: "dashboard-user-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxIntlTelInputModule],
  templateUrl: "./user-form.component.html",
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usersService = inject(UsersService);
  private toast = inject(HotToastService);

  userForm!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  pageTitle = "Agregar Nuevo Usuario";
  initialLoading = true;
  isSaving = false;

  searchCountryField = [SearchCountryField.Iso2, SearchCountryField.Name];
  preferredCountries: CountryISO[] = [
    CountryISO.Venezuela,
    CountryISO.UnitedStates,
  ];
  phoneFormat = PhoneNumberFormat.International;
  CountryISO = CountryISO;

  ngOnInit(): void {
    this.initializeForm();

    this.route.paramMap.subscribe((params) => {
      const id = params.get("id");
      if (id) {
        this.isEditMode = true;
        this.userId = id;
        this.pageTitle = "Editar Usuario";
        this.userForm.get("password")?.disable();
        this.userForm.get("confirmPassword")?.disable();
        this.loadUserData(id);
      } else {
        this.isEditMode = false;
        this.userId = null;
        this.pageTitle = "Agregar Nuevo Usuario";
        this.userForm.get("password")?.enable();
        this.userForm.get("confirmPassword")?.enable();
        this.userForm
          .get("password")
          ?.setValidators([Validators.required, Validators.minLength(6)]);
        this.userForm
          .get("confirmPassword")
          ?.setValidators([Validators.required]);
        this.initialLoading = false;
      }
      this.userForm.get("password")?.updateValueAndValidity();
      this.userForm.get("confirmPassword")?.updateValueAndValidity();
    });
  }

  private initializeForm(): void {
    this.userForm = this.fb.group(
      {
        name: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        phoneNumber: [null, [Validators.required]],
        rolesGroup: this.fb.group({
          isAdmin: [false],
          isSuperAdmin: [{ value: false, disabled: true }],
        }),

        password: [""],
        confirmPassword: [""],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  private passwordMatchValidator(form: FormGroup) {
    if (form.get("password")?.enabled && form.get("confirmPassword")?.enabled) {
      const password = form.get("password")?.value;
      const confirmPassword = form.get("confirmPassword")?.value;
      if (password !== confirmPassword) {
        form.get("confirmPassword")?.setErrors({ mismatch: true });
      } else {
        if (form.get("confirmPassword")?.hasError("mismatch")) {
          form.get("confirmPassword")?.setErrors(null);
        }
      }
    } else {
      if (form.get("confirmPassword")?.hasError("mismatch")) {
        form.get("confirmPassword")?.setErrors(null);
      }
    }
    return null;
  }

  private loadUserData(id: string): void {
    this.usersService
      .getUserById(id)
      .pipe(finalize(() => (this.initialLoading = false)))
      .subscribe({
        next: (user) => {
          this.patchForm(user);
        },
        error: (errMessage) => {
          this.toast.error(`Error al cargar usuario: ${errMessage}`);
          this.router.navigate(["/dashboard/users"]);
        },
      });
  }

  private patchForm(user: User): void {
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      rolesGroup: {
        isAdmin: user.roles.includes(UserRole.ADMIN),
        isSuperAdmin: user.roles.includes(UserRole.SUPERADMIN),
      },
    });
    this.userForm.markAsPristine();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.toast.error("Por favor, revisa los campos del formulario.");
      this.userForm.markAllAsTouched();
      if (this.phoneNumber?.invalid) {
        this.phoneNumber.markAsTouched();
      }
      return;
    }

    const phoneValueObject = this.phoneNumber?.value;
    const internationalPhoneNumber = phoneValueObject?.internationalNumber;

    if (!internationalPhoneNumber) {
      this.toast.error("Número de teléfono inválido o incompleto.");
      this.phoneNumber?.setErrors({ invalidNumberFormat: true });
      this.phoneNumber?.markAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.userForm.value;

    const finalRoles: UserRole[] = [];
    if (formValue.rolesGroup.isAdmin) {
      finalRoles.push(UserRole.ADMIN);
      finalRoles.push(UserRole.USER);
    } else {
      finalRoles.push(UserRole.USER);
    }
    const uniqueRoles = [...new Set(finalRoles)];

    let action$: Observable<User>;

    if (this.isEditMode && this.userId) {
      //editar
      const payload: UpdateUserPayload = {
        name: formValue.name,
        email: formValue.email,
        phoneNumber: internationalPhoneNumber,
        roles: uniqueRoles,
      };
      action$ = this.usersService.updateUser(this.userId, payload);
    } else {
      //crear
      const payload: CreateUserPayload = {
        name: formValue.name,
        email: formValue.email,
        roles: uniqueRoles,
        password: formValue.password,
        phoneNumber: internationalPhoneNumber,
      };
      action$ = this.usersService.createUser(payload);
    }

    action$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: (savedUser) => {
        this.toast.success(
          `Usuario ${this.isEditMode ? "actualizado" : "creado"} con éxito.`
        );
        this.router.navigate(["/dashboard/users"]);
      },
      error: (errMessage) => {
        this.toast.error(`Error al guardar usuario: ${errMessage}`);
      },
    });
  }

  get phoneNumber() {
    return this.userForm.get("phoneNumber");
  }

  cancel(): void {
    this.router.navigate(["/dashboard/users"]);
  }
}
