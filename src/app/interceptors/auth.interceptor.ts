// auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { inject, PLATFORM_ID } from "@angular/core"; // Importar inject y PLATFORM_ID
import { isPlatformBrowser } from "@angular/common"; // Importar isPlatformBrowser
import { environment } from "../../environments/environment";

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // 1. Detectar si estamos en el navegador
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // 2. Si estamos en el servidor (SSR), pasamos la petición sin tocar nada.
  // El servidor no tiene token, ni localStorage.
  if (!isBrowser) {
    return next(req);
  }

  // 3. Lógica normal (Solo corre en el navegador)
  const token = localStorage.getItem("accessToken");
  const apiUrl = environment.API_URL;
  const isApiRequest = req.url.startsWith(apiUrl);

  if (token && isApiRequest) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }

  return next(req);
};
