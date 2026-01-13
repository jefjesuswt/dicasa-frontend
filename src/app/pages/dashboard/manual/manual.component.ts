import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-manual',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  template: `
    <div class="container mx-auto px-6 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Lateral Sidebar (Table of Contents) -->
        <aside class="w-full lg:w-64 shrink-0">
          <div class="sticky top-24">
            <h3 class="font-bold text-[var(--text-heading)] mb-4 uppercase text-xs tracking-widest border-b border-[var(--border-light)] pb-2">
              Contenido
            </h3>
            <nav class="flex flex-col space-y-2">
              <a (click)="scrollTo('propiedades')"
                class="cursor-pointer text-sm font-medium text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors py-2 px-3 rounded-md hover:bg-[var(--bg-panel)] border-l-2 border-transparent hover:border-[var(--color-primary)] block">
                1. Propiedades
              </a>
              <a (click)="scrollTo('usuarios')"
                class="cursor-pointer text-sm font-medium text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors py-2 px-3 rounded-md hover:bg-[var(--bg-panel)] border-l-2 border-transparent hover:border-[var(--color-primary)] block">
                2. Usuarios
              </a>
              <a (click)="scrollTo('agenda')"
                class="cursor-pointer text-sm font-medium text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors py-2 px-3 rounded-md hover:bg-[var(--bg-panel)] border-l-2 border-transparent hover:border-[var(--color-primary)] block">
                3. Agenda
              </a>
              <a (click)="scrollTo('estadisticas')"
                class="cursor-pointer text-sm font-medium text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors py-2 px-3 rounded-md hover:bg-[var(--bg-panel)] border-l-2 border-transparent hover:border-[var(--color-primary)] block">
                4. Estadísticas
              </a>
              <a (click)="scrollTo('soporte')"
                class="cursor-pointer text-sm font-medium text-[var(--text-primary)] hover:text-[var(--color-primary)] transition-colors py-2 px-3 rounded-md hover:bg-[var(--bg-panel)] border-l-2 border-transparent hover:border-[var(--color-primary)] block">
                Soporte
              </a>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0">
          <div class="bg-[var(--bg-panel)] rounded-xl shadow-sm border border-[var(--border-light)] p-8 lg:p-12">
            <article class="prose max-w-none
              prose-headings:font-bold prose-headings:text-[var(--text-heading)]
              prose-p:text-[var(--text-primary)]
              prose-li:text-[var(--text-primary)]
              prose-strong:text-[var(--text-heading)]
              prose-headings:scroll-mt-28
              prose-a:text-[var(--color-primary)] hover:prose-a:text-[var(--color-primary-hover)]
              prose-code:text-[var(--color-primary)] prose-code:bg-[var(--bg-section-alt)] prose-code:px-1 prose-code:rounded
              prose-img:rounded-xl prose-img:border prose-img:border-[var(--border-light)]
              prose-blockquote:text-[var(--text-secondary)] prose-blockquote:border-[var(--color-primary)]
              prose-table:text-[var(--text-secondary)]
              prose-th:text-[var(--text-heading)] prose-th:font-bold prose-th:uppercase prose-th:tracking-wider
              prose-td:border-[var(--border-light)] prose-th:border-[var(--border-light)]
              prose-tr:border-[var(--border-light)]">
              <markdown [src]="'assets/docs/manual.md'" (load)="onLoad($event)"></markdown>
            </article>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class ManualComponent {

  onLoad(e: any) {
    // Optional: Add listeners or dynamic TOC generation here
  }

  scrollTo(id: string) {
    // Fallback: Try to find h2 containing text
    const headings = document.querySelectorAll('h2, h3');
    for (let i = 0; i < headings.length; i++) {
        const h = headings[i] as HTMLElement;
         // mapping: 'propiedades' -> '1. Propiedades' check
        if (h.innerText.toLowerCase().includes(id)) {
            h.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
        }
    }
  }
}
