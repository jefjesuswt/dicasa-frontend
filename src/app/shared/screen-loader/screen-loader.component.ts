import { Component, inject } from "@angular/core";
import { ThemeService } from "../../services/theme.service";

@Component({
  selector: "shared-screen-loader",
  standalone: true,
  template: `
    <div
      class="fixed inset-0 bg-[var(--bg-dark)] z-[9999] flex items-center justify-center transition-colors duration-200"
    >
      <!-- Background Grid (Very Subtle) -->
      <div class="absolute inset-0 bg-grid opacity-[0.03]"></div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center gap-8">
        <!-- Text Logo Only (Cleaner, Corporate) -->
        @if (themeService.isDarkMode()) {
        <img
          src="assets/images/dicasa-800x260.png"
          alt="Dicasa Group"
          class="h-8 md:h-10 w-auto opacity-90 transition-all duration-200 brightness-0 invert"
        />
        } @else {
        <img
          src="assets/images/dicasa-800x260.png"
          alt="Dicasa Group"
          class="h-8 md:h-10 w-auto opacity-90 transition-all duration-200"
        />
        }

        <!-- Ultra-thin Progress Line -->
        <div class="w-32 h-[1px] bg-[var(--border-light)] overflow-hidden">
          <div
            class="h-full bg-sky-500 w-full origin-left animate-progress-line"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes progress-line {
        0% {
          transform: scaleX(0);
          transform-origin: left;
        }
        49% {
          transform: scaleX(1);
          transform-origin: left;
        }
        50% {
          transform: scaleX(1);
          transform-origin: right;
        }
        100% {
          transform: scaleX(0);
          transform-origin: right;
        }
      }
      .animate-progress-line {
        animation: progress-line 1.5s infinite ease-in-out;
      }
    `,
  ],
})
export class ScreenLoaderComponent {
  public themeService = inject(ThemeService);
}
