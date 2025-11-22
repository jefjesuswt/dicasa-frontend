import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule, DOCUMENT } from "@angular/common";
import { RouterModule } from "@angular/router";
import { PropertyService } from "../../services/property.service";
import { Property } from "../../interfaces/properties/property.interface";

@Component({
  selector: "home-home",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  featuredProperties: Property[] = [];
  loading = true;
  error: string | null = null;

  private propertyService = inject(PropertyService);
  private document = inject(DOCUMENT);
  private observer: IntersectionObserver | null = null;

  services = [
    {
      title: "Asesoría Legal",
      icon: "pi pi-briefcase",
      desc: "Soporte jurídico especializado para garantizar transacciones seguras.",
    },
    {
      title: "Gestión Inmobiliaria",
      icon: "pi pi-building",
      desc: "Compra, venta y administración con las mejores ofertas.",
    },
    {
      title: "Consultoría Financiera",
      icon: "pi pi-chart-line",
      desc: "Optimización de procesos de inversión para maximizar retorno.",
    },
    {
      title: "Integridad & Ética",
      icon: "pi pi-shield",
      desc: "Compromiso inquebrantable con la transparencia.",
    },
  ];

  ngOnInit(): void {
    this.loadProperties();
  }

  ngAfterViewInit() {
    this.initScrollAnimations();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private loadProperties() {
    this.loading = true;
    this.propertyService.getFeaturedProperties().subscribe({
      next: (properties) => {
        this.featuredProperties = properties.slice(0, 3);
        this.loading = false;

        // Reiniciamos animaciones porque el DOM cambió
        setTimeout(() => this.initScrollAnimations(), 100);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  private initScrollAnimations() {
    this.observer?.disconnect();

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15, // Un poco más sensible para que cargue antes
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // Opcional: Dejar de observar una vez animado para mejor rendimiento
          // this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    const elements = this.document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => this.observer?.observe(el));
  }
}
