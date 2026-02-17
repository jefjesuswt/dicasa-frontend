import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private renderer: Renderer2;
  private isPrinting = false;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  isGenerating(): boolean {
    return this.isPrinting;
  }

  /**
   * Triggers the browser's native print dialog for a specific element.
   * It injects temporary styles to hide everything except the target element.
   *
   * @param elementId The ID of the DOM element to print
   * @param title Optional title for the document (sets document.title)
   */
  exportToPdf(elementId: string, title?: string): Promise<void> {
    if (this.isPrinting) return Promise.resolve();
    this.isPrinting = true;

    return new Promise((resolve) => {
      const originalTitle = document.title;
      if (title) document.title = originalTitle;

      // 1. Get source element
      const sourceEl = document.getElementById(elementId);
      if (!sourceEl) {
        console.error(`Element #${elementId} not found`);
        this.isPrinting = false;
        resolve();
        return;
      }

      // 2. Clone the element
      // We must handle Canvases manually because cloneNode() doesn't copy canvas content
      // Strategy: Convert source canvases to images in the clone
      const clone = sourceEl.cloneNode(true) as HTMLElement;

      const sourceCanvases = sourceEl.querySelectorAll('canvas');
      const cloneCanvases = clone.querySelectorAll('canvas');

      sourceCanvases.forEach((sourceCanvas, index) => {
        const cloneCanvas = cloneCanvases[index];
        if (cloneCanvas) {
          const img = document.createElement('img');
          img.src = sourceCanvas.toDataURL();
          img.style.width = '100%';
          img.style.height = 'auto';
          img.className = sourceCanvas.className; // Keep classes for styling
          cloneCanvas.parentNode?.replaceChild(img, cloneCanvas);
        }
      });

      // 3. Setup Print Container
      const printContainer = this.renderer.createElement('div');
      printContainer.id = 'print-container-wrapper';
      printContainer.appendChild(clone);
      this.renderer.appendChild(document.body, printContainer);

      // 4. Inject Print Styles
      this.renderer.addClass(document.body, 'printing-mode');
      const style = this.renderer.createElement('style');
      style.id = 'print-overrides';
      style.innerHTML = `
        @media print {
          body.printing-mode > * {
            display: none !important;
          }
          body.printing-mode > #print-container-wrapper {
            display: block !important;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
           /* Reset visibility for the clone and its children */
          body.printing-mode > #print-container-wrapper * {
             visibility: visible;
          }

          /* Styling for the print container content */
          #print-container-wrapper {
            background: white !important;
            color: black !important;
            padding: 20px;
          }

          /* Colors reset */
          #print-container-wrapper * {
             color: #1e293b !important;
             border-color: #e2e8f0 !important;
          }

          /* Utility to hide elements during print */
          .no-print {
            display: none !important;
          }

          /* Utility to force page break after an element */
          .print-break-after {
            break-after: page !important;
            page-break-after: always !important;
          }

          /* Utility to prevent element splitting across pages */
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          @page { size: auto; margin: 10mm; }
        }
        /* Hide the print container in normal view */
        #print-container-wrapper {
          display: none;
        }
      `;
      this.renderer.appendChild(document.head, style);

      // 5. Print and Cleanup
      setTimeout(() => {
        window.print();

        // Cleanup logic
        const cleanup = () => {
          this.renderer.removeClass(document.body, 'printing-mode');
          if (title) document.title = originalTitle;

          const styleEl = document.getElementById('print-overrides');
          if (styleEl) styleEl.remove();

          const container = document.getElementById('print-container-wrapper');
          if (container) container.remove();

          this.isPrinting = false;
          resolve();
        };

        // Robust cleanup detection
        const mediaQuery = window.matchMedia('print');
        const listener = (mql: MediaQueryListEvent) => {
          if (!mql.matches) {
            cleanup();
            mediaQuery.removeEventListener('change', listener);
          }
        };
        mediaQuery.addEventListener('change', listener);

        // Fallback for browsers that don't fire events properly or if user cancels quickly
        window.addEventListener('afterprint', cleanup, { once: true });

        // Ultimate fallback if everything hangs
        setTimeout(() => {
            if (this.isPrinting) cleanup();
        }, 5000); // 5 seconds max wait if events fail

      }, 500); // 500ms delay to ensure DOM and images are ready
    });
  }
}
