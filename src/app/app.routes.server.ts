import { RenderMode, ServerRoute } from "@angular/ssr";

export const serverRoutes: ServerRoute[] = [
  // 1. ZONA PÚBLICA (SSG - Prerender)
  // Queremos que esto sea HTML estático puro para máxima velocidad y SEO.
  {
    path: "", // Home
    renderMode: RenderMode.Prerender,
  },
  {
    path: "landing",
    renderMode: RenderMode.Prerender,
  },
  {
    path: "contact",
    renderMode: RenderMode.Prerender,
  },

  // 2. ZONA PROPIEDADES (SSR - Server Side Rendering)
  // Necesitas SEO, pero la data puede cambiar o ser mucha para pre-renderizar todo.
  // SSR generará el HTML "al vuelo" cada vez que alguien entre.
  {
    path: "properties",
    renderMode: RenderMode.Server,
  },
  {
    path: "properties/**", // Detalle de propiedades
    renderMode: RenderMode.Server,
  },

  // 3. ZONA PRIVADA/AUTH (CSR - Client Side Rendering)
  // Aquí NO queremos SSR. El servidor no tiene localStorage ni cookies del usuario.
  // Al poner 'Client', Angular manda el "cascarón" y el navegador hace el resto.
  {
    path: "auth/**",
    renderMode: RenderMode.Client,
  },
  {
    path: "dashboard/**",
    renderMode: RenderMode.Client,
  },
  {
    path: "profile/**",
    renderMode: RenderMode.Client,
  },

  // 4. FALLBACK
  {
    path: "**",
    renderMode: RenderMode.Server, // O Client, según prefieras para 404
  },
];
