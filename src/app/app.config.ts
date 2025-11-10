import {
  ApplicationConfig,
  LOCALE_ID,
  provideZoneChangeDetection,
} from "@angular/core";
import {
  provideRouter,
  withPreloading,
  withViewTransitions,
} from "@angular/router";
import { provideHotToastConfig } from "@ngxpert/hot-toast";
import { routes } from "./app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { PreloadStrategyService } from "./services/preload-strategy.service";
import { authInterceptor } from "./interceptors/auth.interceptor";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { providePrimeNG } from "primeng/config";
import { MyPreset } from "./mypreset";
import { primeNgTranslation } from "./primeNgTranslation";

import { registerLocaleData } from "@angular/common";
import localeEs from "@angular/common/locales/es";
registerLocaleData(localeEs, "es");
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: LOCALE_ID, useValue: "es" },
    provideRouter(
      routes,
      withPreloading(PreloadStrategyService),
      withViewTransitions()
    ),
    providePrimeNG({
      translation: primeNgTranslation,
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: false,
        },
      },
    }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHotToastConfig({
      position: "bottom-center",
    }),
    provideAnimationsAsync(),
  ],
};
