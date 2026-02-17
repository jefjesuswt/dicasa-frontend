import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { AuthService } from '../../services/auth.service';
import { PdfExportService } from '../../services/pdf-export.service';

export interface Heading {
  id: string;
  title: string;
  level: number;
  children?: Heading[];
  expanded?: boolean;
}

@Component({
  selector: 'app-manual-page',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  template: `
    <div class="min-h-screen bg-[var(--bg-dark)] text-[var(--text-secondary)] font-sans bg-grid">
      <!-- Header -->
      <header class="pt-12 pb-12 mt-14 border-b border-[var(--border-light)] bg-[var(--bg-panel)]/90 backdrop-blur-sm">
        <div class="container mx-auto px-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="inline-block px-3 py-1 border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs tracking-widest">
              MANUAL // {{ roleLabel() }}
            </div>
            <div class="h-px flex-grow bg-gradient-to-r from-sky-500/30 to-transparent"></div>
          </div>

          <h1
            class="text-4xl lg:text-5xl font-bold text-[var(--text-heading)] uppercase tracking-tight leading-none mb-2">
            Manual de
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">Usuario</span>
          </h1>
          <p class="text-[var(--text-secondary)] border-l-2 border-sky-500 pl-4 mt-4 max-w-2xl">
            Guía completa de uso del sistema Dicasa para su rol de
            <span class="text-[var(--text-heading)] font-medium">{{ roleLabel() }}</span>.
          </p>

          <button (click)="exportPdf()"
            [disabled]="pdfService.isGenerating()"
            class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-wait text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-sm">
            @if (pdfService.isGenerating()) {
              <i class="pi pi-spin pi-spinner text-sm"></i>
              <span>Generando...</span>
            } @else {
              <i class="pi pi-file-pdf text-sm"></i>
              <span>Descargar PDF</span>
            }
          </button>
        </div>
      </header>

      <!-- Content -->
      <div class="container mx-auto px-6 py-12">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Sidebar (Table of Contents) -->
          <aside class="w-full lg:w-64 shrink-0">
            <div class="sticky top-24">
              <h3 class="font-bold text-[var(--text-heading)] mb-4 uppercase text-xs tracking-widest border-b border-[var(--border-light)] pb-2">
                Contenido
              </h3>
              <nav class="flex flex-col space-y-1">
                @for (h2 of headings; track h2.id) {
                  <div class="flex flex-col">
                    <button (click)="toggleSection(h2)"
                            class="flex items-center justify-between w-full text-left cursor-pointer text-sm font-bold text-[var(--text-heading)] hover:text-[var(--color-primary)] transition-colors py-2 px-2 rounded-md hover:bg-[var(--bg-panel)] group">
                      <span class="truncate">{{ h2.title }}</span>
                      <i class="pi pi-chevron-right text-[10px] text-[var(--text-secondary)] transition-transform duration-200"
                         [class.rotate-90]="h2.expanded"></i>
                    </button>

                    @if (h2.expanded && h2.children?.length) {
                      <div class="flex flex-col mt-1 ml-2 border-l border-[var(--border-light)] pl-2 space-y-1">
                        @for (h3 of h2.children; track h3.id) {
                          <a (click)="scrollTo(h3.id)"
                             class="cursor-pointer text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors py-1.5 px-2 rounded-sm hover:bg-[var(--bg-panel)] block truncate">
                            {{ h3.title }}
                          </a>
                        }
                      </div>
                    }
                  </div>
                }
              </nav>
            </div>
          </aside>

          <!-- Main Content -->
          <main class="flex-1 min-w-0">
            <div id="manual-content-print-target" #manualContent class="bg-[var(--bg-panel)] rounded-xl shadow-sm border border-[var(--border-light)] p-8 lg:p-12">
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
                <markdown [src]="manualSrc()" (load)="onLoad($event)"></markdown>
              </article>
            </div>
          </main>
        </div>
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
export class ManualPageComponent {
  private authService = inject(AuthService);
  public pdfService = inject(PdfExportService);

  headings: Heading[] = [];

  manualSrc = computed(() => {
    if (this.authService.isAdmin()) return 'assets/docs/manual.md';
    if (this.authService.isManager()) return 'assets/docs/manual-manager.md';
    if (this.authService.isAgent()) return 'assets/docs/manual-agent.md';
    return 'assets/docs/manual.md';
  });

  roleLabel = computed(() => {
    if (this.authService.isAdmin()) return 'ADMINISTRADOR';
    if (this.authService.isManager()) return 'GERENTE';
    if (this.authService.isAgent()) return 'AGENTE';
    return 'USUARIO';
  });

  constructor(private el: ElementRef) {}

  onLoad(e: any) {
    setTimeout(() => {
      this.generateTableOfContents();
    }, 100);
  }

  generateTableOfContents() {
    this.headings = [];
    const headers = this.el.nativeElement.querySelectorAll('h2, h3');

    let currentH2: Heading | null = null;

    headers.forEach((header: HTMLElement, index: number) => {
      let slug = header.innerText.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const uniqueId = `doc-${slug}-${index}`;
      header.id = uniqueId;

      const level = parseInt(header.tagName.substring(1));
      const headingItem: Heading = {
        id: uniqueId,
        title: header.innerText,
        level: level,
        children: [],
        expanded: false
      };

      if (level === 2) {
        currentH2 = headingItem;
        this.headings.push(currentH2);
      } else if (level === 3 && currentH2) {
        currentH2.children?.push(headingItem);
      }
    });
  }

  toggleSection(section: Heading) {
    this.headings.forEach(h => {
      if (h !== section) {
        h.expanded = false;
      }
    });

    section.expanded = !section.expanded;

    if (section.expanded) {
      this.scrollTo(section.id);
    }
  }

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async exportPdf() {
    await this.pdfService.exportToPdf(
      'manual-content-print-target',
      `Manual Dicasa - ${this.roleLabel()}`
    );
  }
}
