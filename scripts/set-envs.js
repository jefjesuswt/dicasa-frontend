const fs = require('fs'); 
const path = require('path');


require('dotenv').config();


const createEnvFileContent = (isProd) => {
  const envVars = {
    API_URL: process.env.API_URL,
    
  };

  if (!envVars.API_URL) {
    console.warn(
      `ADVERTENCIA: Faltan variables de entorno (API_URL).` +
      `Asegúrate de tener un .env o variables de entorno en tu pipeline.`
    );
  }

  return `export const environment = ${JSON.stringify(envVars, null, 2)};\n`;
};

const devEnvPath = path.resolve(process.cwd(), 'src/environments/environment.ts');
const prodEnvPath = path.resolve(process.cwd(), 'src/environments/environment.prod.ts');

fs.writeFileSync(devEnvPath, createEnvFileContent(false));

console.log('✅ Archivos de entorno generados exitosamente.');