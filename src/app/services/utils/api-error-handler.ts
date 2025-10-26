// src/app/services/utils/api-error.handler.ts
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/**
 * Parsea un HttpErrorResponse y devuelve un mensaje de error legible para el usuario.
 */
export function handleApiError(error: HttpErrorResponse): Observable<never> {
  const backendMessage = error.error?.message;
  let userMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo.';

  if (typeof backendMessage === 'string') {
    userMessage = backendMessage;
  } else if (Array.isArray(backendMessage)) {
    userMessage = backendMessage.join(', ');
  } else if (error.status === 0 || error.status >= 500) {
    userMessage = 'Error de conexión con el servidor. Por favor, inténtalo más tarde.';
  } else if (error.status === 401) {
    userMessage = backendMessage || 'No autorizado.';
  } else if (error.message) {
    userMessage = error.message;
  }

  console.error("Error completo de la API:", error);
  
  // Devuelve un observable que falla con el mensaje amigable
  return throwError(() => userMessage); 
}