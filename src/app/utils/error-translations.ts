export interface ErrorTranslation {
  match: string | RegExp;
  message: string;
}

export const ERROR_TRANSLATIONS: ErrorTranslation[] = [
  // --- Auth & Permissions ---
  {
    match: "Unauthorized",
    message: "No tienes permiso para realizar esta acción.",
  },
  { match: "Forbidden", message: "Acceso denegado." },
  {
    match: "Invalid credentials",
    message: "Credenciales incorrectas. Verifica tu correo y contraseña.",
  },
  {
    match: "User already exists",
    message: "El usuario ya se encuentra registrado.",
  },

  // --- Validation (class-validator) ---
  // Emails
  {
    match: "email must be an email",
    message: "El correo electrónico no tiene un formato válido.",
  },
  {
    match: "email should not be empty",
    message: "El correo electrónico es obligatorio.",
  },

  // Passwords / Strings
  {
    match: /must be longer than or equal to (\d+) characters/,
    message: "Debe tener al menos $1 caracteres.",
  },
  {
    match: /(password|name|title) must be a string/,
    message: "El campo debe ser texto válido.",
  },
  {
    match: "should not be empty",
    message: "Este campo no puede estar vacío.",
  },

  // Numbers
  {
    match: "must be a number conforming to the specified constraints",
    message: "Debe ser un número válido.",
  },
  {
    match: /must not be less than (\d+)/,
    message: "No puede ser menor a $1.",
  },

  // Enums
  {
    match: /must be one of the following values/,
    message: "El valor seleccionado no es válido.",
  },

  // --- General / Fallbacks ---
  { match: "Bad Request", message: "Solicitud incorrecta." },
  { match: "Internal Server Error", message: "Error interno del servidor." },
];
