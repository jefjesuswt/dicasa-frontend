const fs = require("fs");
const path = require("path");

// Carga el .env local (si existe) para 'bun run start'
// En Netlify/Vercel, process.env ya vendrá inyectado.
require("dotenv").config();

// 1. Lee la variable de entorno
const API_URL = process.env.API_URL;
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

// 2. Rutas a los archivos
const devEnvPath = path.resolve(
  process.cwd(),
  "src/environments/environment.ts"
);
const prodEnvPath = path.resolve(
  process.cwd(),
  "src/environments/environment.prod.ts"
);

// 3. Validación crítica para producción
// Si no hay API_URL, fallamos el build para evitar errores 502 en SSR
if (!API_URL) {
    console.error(
        "❌ ERROR FATAL: API_URL no está definida en las variables de entorno."
    );
    console.error(
        "Para producción (Netlify/Vercel), DEBES agregar la variable API_URL en el panel de control."
    );
    console.error("El build se cancelará para evitar errores en tiempo de ejecución.");
    process.exit(1);
}

// 4. Contenido para 'environment.ts' (desarrollo)
// 'ng serve' usará este
const devContent = `
export const environment = {
  production: false,
  API_URL: "${API_URL || "http://localhost:3000/api"}",
  mapboxToken: "${MAPBOX_TOKEN || ""}"
};
`;

// 5. Contenido para 'environment.prod.ts' (producción)
// 'ng build' usará este.
const prodContent = `
export const environment = {
  production: true,
  API_URL: "${API_URL}",
  mapboxToken: "${MAPBOX_TOKEN}"
};
`;


// 6. Escribir AMBOS archivos
fs.writeFileSync(devEnvPath, devContent.trim());
fs.writeFileSync(prodEnvPath, prodContent.trim());

console.log(
  `✅ Archivos de entorno (dev y prod) generados con API_URL: ${API_URL}`
);
