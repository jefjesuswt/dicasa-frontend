import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule, DOCUMENT } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { HotToastService } from "@ngxpert/hot-toast";

import {
  NgxIntlTelInputModule,
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from "ngx-intl-tel-input";

import { finalize } from "rxjs/operators";
import { ContactService } from "../../services/contact.service";
import { CreateContactDto } from "../../interfaces/contact/create-contact.dto";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxIntlTelInputModule],
  templateUrl: "./contact.component.html",
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  // --- Lógica Visual (Observer) ---
  private observer: IntersectionObserver | null = null;
  private document = inject(DOCUMENT);

  // --- Lógica de Negocio ---
  loading = false;
  private fb = inject(FormBuilder);
  private toast = inject(HotToastService);
  private contactService = inject(ContactService);

  searchCountryField = [SearchCountryField.Iso2, SearchCountryField.Name];
  preferredCountries: CountryISO[] = [
    CountryISO.Venezuela,
    CountryISO.UnitedStates,
  ];
  phoneFormat = PhoneNumberFormat.International;
  CountryISO = CountryISO;

  contactForm!: FormGroup;
  isSending = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngAfterViewInit() {
    this.initScrollObserver();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private initScrollObserver() {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.2,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    const elements = this.document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => this.observer?.observe(el));
  }

  private initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phoneNumber: [null, [Validators.required]],
      message: ["", [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.toast.error("Campos incompletos o inválidos.");
      return;
    }

    const phoneValue = this.contactForm.value.phoneNumber;
    const internationalPhoneNumber = phoneValue?.internationalNumber;

    if (!internationalPhoneNumber) {
      this.loading = false;
      this.toast.error("Número de teléfono inválido.");
      this.phoneNumber?.setErrors({ invalidNumber: true });
      return;
    }

    this.isSending = true;
    const payload: CreateContactDto = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      phoneNumber: internationalPhoneNumber,
      message: this.contactForm.value.message,
    };

    this.contactService
      .sendMessage(payload)
      .pipe(finalize(() => (this.isSending = false)))
      .subscribe({
        next: (response) => {
          this.toast.success(
            response.message || "Solicitud enviada correctamente."
          );
          this.contactForm.reset();
        },
        error: (errMessage) => {
          this.toast.error(`Error de transmisión: ${errMessage}`);
        },
      });
  }

  get name() {
    return this.contactForm.get("name");
  }
  get email() {
    return this.contactForm.get("email");
  }
  get phoneNumber() {
    return this.contactForm.get("phoneNumber");
  }
  get message() {
    return this.contactForm.get("message");
  }
}
