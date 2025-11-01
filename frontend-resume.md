# Resumen del Frontend

Este documento proporciona un resumen de los servicios, componentes, guards e interceptores de la aplicación frontend de Dicasa.

## Servicios

### AuthService (`src/app/services/auth.service.ts`)
- **Propósito:** Gestiona la autenticación de usuarios, el registro y el estado de la sesión. Interactúa con los endpoints `/auth` del backend.
- **Métodos:**
  - `login(email, password)`: Autentica a un usuario.
  - `register(data)`: Registra un nuevo usuario.
  - `forgotPassword(email)`: Inicia el proceso de restablecimiento de contraseña.
  - `verifyResetCode(email, code)`: Verifica el código de restablecimiento de contraseña.
  - `resetPassword(email, newPassword, code)`: Restablece la contraseña del usuario.
  - `checkAuthStatus()`: Comprueba si el usuario está autenticado verificando el token JWT.
  - `confirmEmail(token)`: Confirma la dirección de correo electrónico de un usuario.
  - `logout()`: Cierra la sesión del usuario y limpia los datos de la sesión.
- **Dependencias:** `HttpClient`, `Router`.

### LocationService (`src/app/services/location.service.ts`)
- **Propósito:** Obtiene datos de ubicación (estados y ciudades) del backend.
- **Métodos:**
  - `getStates()`: Recupera una lista de estados.
  - `getCities(stateName)`: Recupera una lista de ciudades para un estado determinado.
- **Dependencias:** `HttpClient`.

### PropertyService (`src/app/services/property.service.ts`)
- **Propósito:** Maneja todas las operaciones relacionadas con las propiedades, incluida la obtención, creación, actualización y eliminación de propiedades.
- **Métodos:**
  - `getProperties(params)`: Obtiene una lista paginada de propiedades con filtros opcionales.
  - `getProperty(id)`: Obtiene una única propiedad por su ID.
  - `uploadPropertyImages(files)`: Sube imágenes de propiedades al backend.
  - `createProperty(payload)`: Crea una nueva propiedad.
  - `updateProperty(id, payload)`: Actualiza una propiedad existente.
  - `deleteProperty(id)`: Elimina una propiedad.
  - `getFeaturedProperties()`: Obtiene las propiedades marcadas como destacadas.
- **Dependencias:** `HttpClient`.

### UsersService (`src/app/services/users.service.ts`)
- **Propósito:** Gestiona los datos de los usuarios, incluida la obtención de listas de usuarios y la actualización de la información de los usuarios.
- **Métodos:**
  - `getUsers()`: Obtiene una lista de todos los usuarios.
  - `getAgents()`: Obtiene usuarios con roles de 'ADMIN' o 'SUPERADMIN'.
  - `getUserById(id)`: Obtiene un único usuario por su ID.
  - `createUser(payload)`: Crea un nuevo usuario.
  - `updateUser(id, payload)`: Actualiza la información de un usuario.
  - `deleteUser(id)`: Elimina un usuario.
  - `updateProfilePicture(file)`: Actualiza la foto de perfil del usuario actual.
  - `updateMyInfo(data)`: Actualiza la información personal del usuario actual.
  - `changePassword(oldPassword, newPassword)`: Cambia la contraseña del usuario actual.
- **Dependencias:** `HttpClient`.

### ScrollTopService (`src/app/services/scroll-top.service.ts`)
- **Propósito:** Se desplaza a la parte superior de la página en la navegación, excluyendo las rutas del dashboard.
- **Métodos:**
  - `enable()`: Activa la funcionalidad de desplazamiento a la parte superior.
- **Dependencias:** `Router`.

### PreloadStrategyService (`src/app/services/preload-strategy.service.ts`)
- **Propósito:** Implementa una estrategia de precarga personalizada para las rutas de Angular. Precarga todos los módulos por defecto a menos que se establezca `data: { preload: false }` en la ruta.
- **Métodos:**
  - `preload(route, load)`: Determina si se debe precargar una ruta.
- **Dependencias:** Ninguna.

## Guards

### Auth Guards (`src/app/guards/auth.guards.ts`)
- **Propósito:** Protege las rutas en función del estado de autenticación y los roles del usuario.
- **Guards:**
  - `authGuard`: Permite el acceso solo a usuarios autenticados.
  - `unauthGuard`: Permite el acceso solo a usuarios no autenticados.
  - `flowGuard`: Asegura que el usuario se encuentre en un flujo de autenticación específico (por ejemplo, restablecimiento de contraseña).
  - `adminOrSuperAdminGuard`: Permite el acceso solo a usuarios con roles de 'ADMIN' o 'SUPERADMIN'.
  - `superAdminGuard`: Permite el acceso solo a usuarios con el rol de 'SUPERADMIN'.
- **Dependencias:** `AuthService`, `Router`.

## Interceptors

### AuthInterceptor (`src/app/interceptors/auth.interceptor.ts`)
- **Propósito:** Adjunta el `accessToken` JWT al encabezado `Authorization` de las solicitudes salientes a la API del backend.
- **Dependencias:** Ninguna.

## Componentes

Un breve resumen de los componentes principales:

### Componentes Principales
- **`AppComponent`**: El componente raíz de la aplicación. Muestra el diseño principal, incluido el encabezado, el pie de página y el `router-outlet`. También muestra un cargador global durante las comprobaciones de autenticación.
- **`HeaderComponent`**: El encabezado de navegación principal. Muestra los enlaces de navegación, la información del perfil del usuario y un botón de cierre de sesión.
- **`FooterComponent`**: El pie de página de la aplicación.

### Páginas
- **`HomeComponent`**: La página de inicio, que muestra las propiedades destacadas y una barra de búsqueda.
- **`PropertiesComponent`**: La página principal de listado de propiedades. Permite a los usuarios buscar, filtrar y ver propiedades.
- **`PropertyDetailsComponent`**: Muestra la información detallada de una sola propiedad.
- **Páginas de Autenticación (`/auth`)**: Un conjunto de páginas para la autenticación de usuarios, que incluye `LoginComponent`, `RegisterComponent`, `ForgotPasswordComponent`, etc.
- **Páginas del Dashboard (`/dashboard`)**: Un área protegida para que los administradores gestionen propiedades y usuarios. Incluye `DashboardComponent`, `PropertyListComponent`, `PropertyFormComponent`, `UserListComponent` y `UserFormComponent`.
- **Páginas de Perfil (`/profile`)**: Permite a los usuarios ver y actualizar su información personal y cambiar su contraseña.

### Componentes Compartidos
- **`PropertyCardComponent`**: Una tarjeta reutilizable para mostrar un resumen de una propiedad.
- **`SearchBarComponent`**: Una barra de búsqueda para encontrar propiedades por ubicación y tipo.
- **`ButtonComponent`**: Un componente de botón genérico y personalizable.
- **`DialogComponent`**: Un componente de diálogo modal para confirmaciones y alertas.
- **`AvatarComponent`**: Muestra el avatar de un usuario, con una imagen generada como alternativa.
- **`ScreenLoaderComponent`**: Un cargador de pantalla completa para indicar actividad en segundo plano.