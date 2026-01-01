// src/app/services/utils/api-error.handler.ts
import { HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { ERROR_TRANSLATIONS } from "../../utils/error-translations";

/**
 * Traduce un mensaje de error técnico a uno amigable para el usuario
 * usando el diccionario de traducciones.
 */
function translateMessage(original: string): string {
  if (!original) return original;

  for (const trans of ERROR_TRANSLATIONS) {
    if (trans.match instanceof RegExp) {
      if (trans.match.test(original)) {
        return original.replace(trans.match, trans.message);
      }
    } else if (original.includes(trans.match)) {
      return trans.message;
    }
  }
  return original;
}

/**
 * Parsea un HttpErrorResponse y devuelve un mensaje de error legible para el usuario.
 */
export function handleApiError(error: HttpErrorResponse): Observable<never> {
  const backendMessage = error.error?.message;
  let userMessage = "Ocurrió un error inesperado. Inténtalo de nuevo.";

  if (typeof backendMessage === "string") {
    userMessage = translateMessage(backendMessage);
  } else if (Array.isArray(backendMessage)) {
    // Si es un array (ej. class-validator), traducimos cada uno y los unimos
    const uniqueMessages = [
      ...new Set(backendMessage.map((msg) => translateMessage(msg))),
    ];
    userMessage = uniqueMessages.join(". ");
  } else if (error.status === 0 || error.status >= 500) {
    userMessage =
      "Error de conexión con el servidor. Por favor, inténtalo más tarde.";
  } else if (error.status === 401) {
    userMessage = translateMessage(backendMessage) || "No autorizado.";
  } else if (error.message) {
    // Fallback al mensaje HTTP genérico si no hay body
    userMessage = error.message;
  }

  console.error("Error completo de la API:", error);

  // Devuelve un observable que falla con el mensaje amigable
  return throwError(() => userMessage);
}
