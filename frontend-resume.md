# Frontend Summary

This document provides a summary of the services, components, guards, and interceptors of the Dicasa frontend application.

## Services

### AuthService (`src/app/services/auth.service.ts`)
- **Purpose:** Manages user authentication, registration, and session status. Interacts with the `/auth` endpoints of the backend.
- **Methods:**
  - `login(email, password)`: Authenticates a user.
  - `register(data)`: Registers a new user.
  - `forgotPassword(email)`: Initiates the password reset process.
  - `verifyResetCode(email, code)`: Verifies the password reset code.
  - `resetPassword(email, newPassword, code)`: Resets the user's password.
  - `checkAuthStatus()`: Checks if the user is authenticated by verifying the JWT token.
  - `confirmEmail(token)`: Confirms a user's email address.
  - `logout()`: Logs out the user and clears session data.
- **Dependencies:** `HttpClient`, `Router`.

### LocationService (`src/app/services/location.service.ts`)
- **Purpose:** Obtains location data (states and cities) from the backend.
- **Methods:**
  - `getStates()`: Retrieves a list of states.
  - `getCities(stateName)`: Retrieves a list of cities for a given state.
- **Dependencies:** `HttpClient`.

### PropertyService (`src/app/services/property.service.ts`)
- **Purpose:** Handles all operations related to properties, including obtaining, creating, updating, and deleting properties.
- **Methods:**
  - `getProperties(params)`: Gets a paginated list of properties with optional filters.
  - `getProperty(id)`: Gets a single property by its ID.
  - `uploadPropertyImages(files)`: Uploads property images to the backend.
  - `createProperty(payload)`: Creates a new property.
  - `updateProperty(id, payload)`: Updates an existing property.
  - `deleteProperty(id)`: Deletes a property.
  - `getFeaturedProperties()`: Gets properties marked as featured.
- **Dependencies:** `HttpClient`.

### UsersService (`src/app/services/users.service.ts`)
- **Purpose:** Manages user data, including obtaining user lists and updating user information.
- **Methods:**
  - `getUsers()`: Gets a list of all users.
  - `getAgents()`: Gets users with 'ADMIN' or 'SUPERADMIN' roles.
  - `getUserById(id)`: Gets a single user by their ID.
  - `createUser(payload)`: Creates a new user.
  - `updateUser(id, payload)`: Updates a user's information.
  - `deleteUser(id)`: Deletes a user.
  - `updateProfilePicture(file)`: Updates the current user's profile picture.
  - `updateMyInfo(data)`: Updates the current user's personal information.
  - `changePassword(oldPassword, newPassword)`: Changes the current user's password.
- **Dependencies:** `HttpClient`.

### AppointmentsService (`src/app/services/appointment.service.ts`)
- **Purpose:** Manages all operations related to appointments, including creation, retrieval, updating, and deletion.
- **Methods:**
  - `create(dto)`: Creates a new appointment.
  - `getAppointments(query)`: Retrieves a paginated list of appointments with optional filters.
  - `findAll()`: Retrieves all appointments.
  - `findMyAppointments()`: Retrieves all appointments for the current user.
  - `findOne(id)`: Retrieves a single appointment by its ID.
  - `update(id, dto)`: Updates an existing appointment.
  - `reassignAgent(id, dto)`: Reassigns an agent to an appointment.
  - `remove(id)`: Deletes an appointment.
- **Dependencies:** `HttpClient`.

### ScrollTopService (`src/app/services/scroll-top.service.ts`)
- **Purpose:** Scrolls to the top of the page on navigation, excluding dashboard routes.
- **Methods:**
  - `enable()`: Activates the scroll-to-top functionality.
- **Dependencies:** `Router`.

### PreloadStrategyService (`src/app/services/preload-strategy.service.ts`)
- **Purpose:** Implements a custom preloading strategy for Angular routes. Preloads all modules by default unless `data: { preload: false }` is set on the route.
- **Methods:**
  - `preload(route, load)`: Determines whether to preload a route.
- **Dependencies:** None.

## Guards

### Auth Guards (`src/app/guards/auth.guards.ts`)
- **Purpose:** Protects routes based on authentication status and user roles.
- **Guards:**
  - `authGuard`: Allows access only to authenticated users.
  - `unauthGuard`: Allows access only to unauthenticated users.
  - `flowGuard`: Ensures the user is in a specific authentication flow (e.g., password reset).
  - `adminOrSuperAdminGuard`: Allows access only to users with 'ADMIN' or 'SUPERADMIN' roles.
  - `superAdminGuard`: Allows access only to users with the 'SUPERADMIN' role.
- **Dependencies:** `AuthService`, `Router`.

## Interceptors

### AuthInterceptor (`src/app/interceptors/auth.interceptor.ts`)
- **Purpose:** Attaches the JWT `accessToken` to the `Authorization` header of outgoing requests to the backend API.
- **Dependencies:** None.

## Components

A brief summary of the main components:

### Main Components
- **`AppComponent`**: The root component of the application. Displays the main layout, including the header, footer, and `router-outlet`. It also shows a global loader during authentication checks.
- **`HeaderComponent`**: The main navigation header. Displays navigation links, user profile information, and a logout button.
- **`FooterComponent`**: The application's footer.

### Pages
- **`HomeComponent`**: The home page, which displays featured properties and a search bar.
- **`PropertiesComponent`**: The main property listing page. Allows users to search, filter, and view properties.
- **`PropertyDetailsComponent`**: Displays detailed information for a single property.
- **Authentication Pages (`/auth`)**: A set of pages for user authentication, including `LoginComponent`, `RegisterComponent`, `ForgotPasswordComponent`, etc.
- **Dashboard Pages (`/dashboard`)**: A protected area for administrators to manage properties, users and appointments. Includes `DashboardComponent`, `PropertyListComponent`, `PropertyFormComponent`, `UserListComponent`, `UserFormComponent`, `AppointmentListComponent` and `AppointmentFormComponent`.
- **Profile Pages (`/profile`)**: Allows users to view and update their personal information, change their password, view their properties and appointments.

### Shared Components
- **`PropertyCardComponent`**: A reusable card for displaying a summary of a property.
- **`SearchBarComponent`**: A search bar for finding properties by location and type.
- **`ButtonComponent`**: A generic and customizable button component.
- **`DialogComponent`**: A modal dialog component for confirmations and alerts.
- **`AvatarComponent`**: Displays a user's avatar, with a generated image as a fallback.
- **`ScreenLoaderComponent`**: A full-screen loader to indicate background activity.
- **`DashboardAppointmentCardComponent`**: A card for displaying appointment information on the dashboard.
- **`DashboardPropertyCardComponent`**: A card for displaying property information on the dashboard.
- **`StatCardsComponent`**: A component for displaying statistics on the dashboard.
- **`AppointmentFormComponent`**: A form for creating and editing appointments.
