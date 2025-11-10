const fs = require("fs");
const path = require("path");

// Carga el .env local (si existe) para 'bun run start'
// En Netlify/Vercel, process.env ya vendrá inyectado.
require("dotenv").config();

// 1. Lee la variable de entorno
const API_URL = process.env.API_URL;
const ANALYTICS_API_URL = process.env.ANALYTICS_API_URL;

if (!API_URL) {
  console.warn(
    `ADVERTENCIA: API_URL no está definida. La app no se conectará.
     Asegúrate de tener un .env local o variables de entorno en tu CI/CD.`
  );
}

// 2. Contenido para 'environment.ts' (desarrollo)
// 'ng serve' usará este
const devContent = `
export const environment = {
  production: false,
  API_URL: "${API_URL || "http://localhost:3000/api"}",
  ANALYTICS_API_URL: "${ANALYTICS_API_URL || "http://localhost:3000/api"}"
};
`;

// 3. Contenido para 'environment.prod.ts' (producción)
// 'ng build' usará este
const prodContent = `
export const environment = {
  production: true,
  API_URL: "${API_URL}",
  ANALYTICS_API_URL: "${ANALYTICS_API_URL}"
};
`;

// 4. Rutas a los archivos
const devEnvPath = path.resolve(
  process.cwd(),
  "src/environments/environment.ts"
);
const prodEnvPath = path.resolve(
  process.cwd(),
  "src/environments/environment.prod.ts"
);

// 5. Escribir AMBOS archivos
fs.writeFileSync(devEnvPath, devContent.trim());
fs.writeFileSync(prodEnvPath, prodContent.trim());

console.log(
  `✅ Archivos de entorno (dev y prod) generados con API_URL: ${API_URL}`
);
