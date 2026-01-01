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
                class="cursor-pointer text-sm text-[var(--text-secondary)] hover:text-sky-500 transition-colors py-1 px-2 rounded hover:bg-[var(--bg-panel)] border-l-2 border-transparent hover:border-sky-500">
                1. Propiedades
              </a>
              <a (click)="scrollTo('usuarios')"
                class="cursor-pointer text-sm text-[var(--text-secondary)] hover:text-sky-500 transition-colors py-1 px-2 rounded hover:bg-[var(--bg-panel)] border-l-2 border-transparent hover:border-sky-500">
                2. Usuarios
              </a>
              <a (click)="scrollTo('agenda')"
                class="cursor-pointer text-sm text-[var(--text-secondary)] hover:text-sky-500 transition-colors py-1 px-2 rounded hover:bg-[var(--bg-panel)] border-l-2 border-transparent hover:border-sky-500">
                3. Agenda
              </a>
              <a (click)="scrollTo('estadisticas')"
                class="cursor-pointer text-sm text-[var(--text-secondary)] hover:text-sky-500 transition-colors py-1 px-2 rounded hover:bg-[var(--bg-panel)] border-l-2 border-transparent hover:border-sky-500">
                4. Estadísticas
              </a>
              <a (click)="scrollTo('soporte')"
                class="cursor-pointer text-sm text-[var(--text-secondary)] hover:text-sky-500 transition-colors py-1 px-2 rounded hover:bg-[var(--bg-panel)] border-l-2 border-transparent hover:border-sky-500">
                Soporte
              </a>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0">
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 lg:p-12">
            <article class="prose prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-100
              prose-headings:scroll-mt-28
              prose-a:text-sky-500 hover:prose-a:text-sky-600
              prose-strong:text-slate-900 dark:prose-strong:text-white
              prose-code:text-sky-500 prose-code:bg-sky-50 dark:prose-code:bg-sky-900/20 prose-code:px-1 prose-code:rounded
              prose-img:rounded-xl prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800">
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
