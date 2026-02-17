import { Component, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

export interface Heading {
  id: string;
  title: string;
  level: number;
  children?: Heading[];
  expanded?: boolean;
}

@Component({
  selector: 'app-manual-manager',
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
            <nav class="flex flex-col space-y-1">
              @for (h2 of headings; track h2.id) {
                <!-- H2 Item (Parent) -->
                <div class="flex flex-col">
                  <button (click)="toggleSection(h2)"
                          class="flex items-center justify-between w-full text-left cursor-pointer text-sm font-bold text-[var(--text-heading)] hover:text-[var(--color-primary)] transition-colors py-2 px-2 rounded-md hover:bg-[var(--bg-panel)] group">
                    <span class="truncate">{{ h2.title }}</span>
                    <i class="pi pi-chevron-right text-[10px] text-[var(--text-secondary)] transition-transform duration-200"
                       [class.rotate-90]="h2.expanded"></i>
                  </button>

                  <!-- H3 Items (Children) - Collapsible -->
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
              <markdown [src]="'assets/docs/manual-manager.md'" (load)="onLoad($event)"></markdown>
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
export class ManualManagerComponent {
  headings: Heading[] = [];

  constructor(private el: ElementRef) { }

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
}
