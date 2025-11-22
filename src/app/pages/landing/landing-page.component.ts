import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChildren,
  QueryList,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./landing-page.component.html",
  styles: [
    `
      .font-mono {
        font-family: "Courier New", Courier, monospace;
      }

      .bg-grid {
        background-size: 40px 40px;
        background-image: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.03) 1px,
            transparent 1px
          ),
          linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.03) 1px,
            transparent 1px
          );
      }

      .hover-line::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0%;
        height: 1px;
        background-color: #38bdf8;
        transition: width 0.3s ease;
      }

      .hover-line:hover::after {
        width: 100%;
      }

      /* CLASES PARA EL SCROLL SPY */
      /* Cuando el elemento tiene la clase 'is-visible' (puesta por JS al hacer scroll),
       se comporta igual que si tuviera hover */
      .reveal-on-scroll {
        transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Soporte para que la clase active los efectos en mobile */
      .reveal-on-scroll.is-visible .scroll-target-grayscale {
        filter: grayscale(0) !important;
      }

      .reveal-on-scroll.is-visible .scroll-target-opacity {
        opacity: 1 !important;
      }

      .reveal-on-scroll.is-visible .scroll-target-border {
        opacity: 1 !important;
      }
    `,
  ],
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {
  private observer: IntersectionObserver | null = null;
  private document = inject(DOCUMENT);

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

  featuredProperties = [
    {
      id: "1",
      title: "RESIDENCIAS PLAZA MAYOR",
      location: "LECHERÍA",
      price: 450000,
      image:
        "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1000&auto=format&fit=crop",
      area: 350,
    },
    {
      id: "2",
      title: "VILLA MARINA CLUB",
      location: "PUERTO LA CRUZ",
      price: 280000,
      image:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop",
      area: 210,
    },
    {
      id: "3",
      title: "LOFT NUEVA BARCELONA",
      location: "BARCELONA",
      price: 85000,
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
      area: 95,
    },
  ];

  ngAfterViewInit() {
    // Configuración del Observer para detectar scroll
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.4, // Se activa cuando el 40% del elemento es visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          // Opcional: Si quieres que se apague al salir de pantalla, descomenta esto:
          entry.target.classList.remove("is-visible");
        }
      });
    }, options);

    // Seleccionar todos los elementos que queremos animar
    const elements = this.document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => this.observer?.observe(el));
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
