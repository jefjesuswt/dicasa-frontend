import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Asegúrate que la ruta sea correcta

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  // Obtenemos el token de localStorage
  const token = localStorage.getItem('accessToken');
  
  // Obtenemos la URL de la API desde el environment
  const apiUrl = environment.API_URL;

  // Verificamos si la petición es para nuestra API
  const isApiRequest = req.url.startsWith(apiUrl);

  // Si tenemos token y es una petición a nuestra API, clonamos la petición
  // y le añadimos el header de autorización.
  if (token && isApiRequest) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Enviamos la petición clonada
    return next(clonedReq);
  }

  // Si no hay token o no es una petición a la API,
  // simplemente dejamos pasar la petición original.
  return next(req);
};
