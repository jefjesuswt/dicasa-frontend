import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9", // Sky-500 (Tu primario)
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
    // Aquí está la magia: Forzamos que la "superficie" sea oscura
    // Mapeamos la paleta Slate de Tailwind a la estructura de PrimeNG
    colorScheme: {
      light: {
        surface: {
          0: "#020617", // slate-950 (Fondo principal)
          50: "#0f172a", // slate-900 (Fondo secundario/Headers)
          100: "#1e293b", // slate-800 (Bordes suaves)
          200: "#334155", // slate-700 (Bordes fuertes)
          300: "#475569", // slate-600
          400: "#64748b", // slate-500 (Textos secundarios)
          500: "#94a3b8", // slate-400
          600: "#cbd5e1", // slate-300
          700: "#e2e8f0", // slate-200 (Texto principal)
          800: "#f1f5f9", // slate-100
          900: "#f8fafc", // slate-50 (Texto resaltado)
          950: "#ffffff",
        },
      },
    },
  },
  components: {
    datepicker: {
      colorScheme: {
        light: {
          header: {
            background: "{surface.50}",
            borderColor: "{surface.100}",
            color: "{surface.700}",
          },
          panel: {
            background: "{surface.0}",
            borderColor: "{surface.100}",
          },
        },
      },
    },
  },
});
