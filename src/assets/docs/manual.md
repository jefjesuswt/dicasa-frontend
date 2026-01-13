# Manual de Usuario - Dicasa

## 1. INTRODUCCIÓN Y ALCANCE

Bienvenido al Manual de Usuario de Dicasa, la plataforma tecnológica diseñada para optimizar la gestión inmobiliaria en el estado Anzoátegui. Este documento detalla cada funcionalidad del sistema, basándose en la arquitectura lógica del backend (NestJS) y la interfaz de usuario (Angular).

El sistema Dicasa centraliza la operación de compra, venta y alquiler de inmuebles, permitiendo una interacción fluida entre clientes potenciales, agentes inmobiliarios y administradores del sistema. Su objetivo es reducir los tiempos de respuesta, asegurar la integridad de los datos mediante validaciones estrictas y ofrecer herramientas de análisis para la toma de decisiones.

## 2. REQUISITOS DEL SISTEMA

Para garantizar el correcto funcionamiento de la plataforma web, asegúrese de cumplir con los siguientes requisitos:

- **Navegador Web**: Google Chrome (versión 90+), Mozilla Firefox, Safari o Microsoft Edge.
- **Conexión a Internet**: Banda ancha estable para la carga de imágenes de propiedades.
- **Dispositivos**: La plataforma es responsive, accesible desde computadoras de escritorio, tablets y teléfonos inteligentes.
- **Cookies y Javascript**: Deben estar habilitados en el navegador para permitir la autenticación y los mapas interactivos.

## 3. GESTIÓN DE IDENTIDAD Y ACCESO (AUTH)

La seguridad es el pilar de Dicasa. El módulo de autenticación gestiona quién entra al sistema y qué puede hacer.

### 3.1. Registro de Nuevos Usuarios

Cualquier persona que desee agendar una cita o guardar favoritos debe registrarse.

1. Diríjase al botón "Registrarse" en la barra de navegación superior.
2. Complete el formulario con los siguientes datos obligatorios:
   - **Nombre y Apellido**: (Mínimo 3 caracteres).
   - **Correo Electrónico**: Debe ser un email válido y único en el sistema.
   - **Contraseña**: Debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número (Validación de seguridad estricta).
3. Al enviar el formulario, el sistema creará su cuenta con el rol de **CLIENT**.

### 3.2. Inicio de Sesión (Login)

1. Haga clic en "Iniciar Sesión".
2. Ingrese sus credenciales.
3. **Sistema de Tokens**: Al ingresar, el sistema le otorga un "Token de Acceso" (JWT) que dura 2 horas. Si su sesión expira, deberá ingresar nuevamente por seguridad.
4. **Manejo de Errores**: Si introduce la contraseña incorrecta varias veces, el sistema le alertará.

### 3.3. Recuperación y Restablecimiento de Contraseña

Si ha olvidado su clave, el sistema cuenta con un flujo seguro de recuperación:

1. En la pantalla de login, seleccione "¿Olvidaste tu contraseña?".
2. Ingrese su correo electrónico registrado.
3. El sistema enviará un código numérico (OTP) o un enlace a su bandeja de entrada (revisar Spam).
4. Ingrese el código en la pantalla de verificación.
5. Establezca su nueva contraseña. **Nota**: No puede utilizar la misma contraseña que tenía anteriormente.

### 3.4. Verificación de Correo Electrónico

Para garantizar que los usuarios son reales y evitar bots:

- Tras el registro, recibirá un correo con un código de 6 dígitos.
- Debe ingresar este código en la plataforma para activar su cuenta.
- **Importante**: Las cuentas no verificadas no podrán agendar citas.

## 4. ROLES Y PERMISOS

El sistema Dicasa opera bajo un esquema de Control de Acceso Basado en Roles (RBAC). Identifique su rol para saber qué funciones tiene disponibles:

| Role                      | Descripción y Alcance                                                                                                               |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- |
| **CLIENT (Cliente)**      | Usuario público. Puede buscar propiedades, ver detalles, gestionar su perfil y agendar/cancelar sus propias citas.                  |
| **AGENT (Agente Inmob.)** | Personal de ventas. Puede gestionar las propiedades asignadas a él, ver sus citas programadas y atender solicitudes de clientes.    |
| **MANAGER (Gerente)**     | Gestor de oficina. Puede crear/editar usuarios (Agentes/Clientes), gestionar todas las propiedades, reasignar citas y ver reportes. |
| **ADMIN (Administrador)** | Acceso total. Incluye gestión de respaldos (Backup), logs de seguridad, eliminación definitiva y configuración avanzada.            |

## 5. MÓDULO DE CLIENTES (PORTAL PÚBLICO)

Esta sección describe la experiencia para los usuarios que buscan inmuebles.

### 5.1. Búsqueda y Filtrado de Propiedades

El motor de búsqueda permite filtrar el inventario inmobiliario utilizando múltiples criterios simultáneos:

- **Ubicación**: Filtrado por Estado (ej. Anzoátegui) y Ciudad (ej. Lechería, Barcelona, Puerto La Cruz), alimentado por una base de datos local (venezuela.json).
- **Tipo de Operación**: Venta o Alquiler.
- **Rango de Precios**: Defina un presupuesto mínimo y máximo.
- **Características**: Cantidad de habitaciones, baños o puestos de estacionamiento.

### 5.2. Visualización de Detalles

Al hacer clic en una propiedad, accederá a la ficha técnica completa que incluye:

- Galería de imágenes de alta resolución.
- Descripción detallada y características (m², servicios, comodidades).
- Ubicación referencial.
- Información del Agente encargado de la propiedad.

### 5.3. Agendamiento de Visitas (Citas)

Esta es una funcionalidad crítica del sistema.

1. En la ficha de la propiedad, haga clic en "Agendar Visita".
2. Seleccione una fecha y hora en el calendario.
3. **Validación**: El sistema no permite seleccionar fechas pasadas (`is-future-date.validator.ts`).
4. Añada una nota opcional para el agente (ej. "Ir con mi esposa").
5. Confirme la solicitud.

**Estados de la Cita**:

- **PENDING (Pendiente)**: La solicitud ha sido enviada.
- **CONFIRMED (Confirmada)**: El agente ha aceptado la visita. Recibirá una notificación.
- **CANCELED (Cancelada)**: La visita no se puede realizar.
- **COMPLETED (Completada)**: La visita ya ocurrió (usado para historial).

### 5.4. Gestión de Perfil y Preferencias

En la sección "Mi Perfil" (`update-my-info.dto`), el cliente puede:

- Actualizar su número de teléfono (vital para que los agentes lo contacten).
- Cambiar su foto de perfil (Avatar).
- Visualizar el historial de sus citas pasadas y futuras.

## 6. MÓDULO DE GESTIÓN (PANEL ADMINISTRATIVO)

Área restringida para Agentes y Administradores.

### 6.1. Dashboard y Métricas

Al ingresar como staff, verá el Panel de Control (Dashboard) que ofrece una visión general del negocio en tiempo real a través del servicio de Analíticas (`analytics.service.ts`):

- **Tarjetas de Estado (Stat Cards)**:
  - Total de Propiedades Activas.
  - Citas Pendientes de Aprobación.
  - Usuarios Registrados en el mes.
- **Gráficos**: Visualización de visitas al portal y propiedades más populares.
- **Logs de Acción**: Un registro de auditoría que muestra quién hizo qué recientemente (ej. "El Agente Juan actualizó la Propiedad X").

### 6.2. Gestión de Usuarios y Staff

Exclusivo para Administradores.

- **Crear Agente**: Puede registrar nuevos usuarios y asignarles el rol de **AGENT** o **ADMIN** desde el panel.
- **Bloqueo de Usuarios**: Si se detecta un comportamiento sospechoso, el administrador puede cambiar el estado de un usuario a inactivo, impidiendo su acceso inmediato al sistema.
- **Listado de Usuarios**: Búsqueda avanzada de usuarios por nombre, correo o rol.

### 6.3. Gestión de Propiedades (Inventario)

El corazón del sistema. Permite el control total del ciclo de vida de un inmueble (CRUD).

#### A. Crear Nueva Propiedad

Formulario extenso que valida la calidad de la información:

- **Información Básica**: Título, Descripción, Precio, Tipo (Casa, Apto, Local).
- **Dirección**: Selección de Estado, Ciudad, Municipio y dirección detallada.
- **Características Físicas**: Metros cuadrados, Habitaciones, Baños, Estacionamiento.
- **Multimedia**: Carga de imágenes.
  - _Nota Técnica_: Las imágenes se procesan a través del `StorageService`. Se recomienda subir fotos en formato JPG/PNG optimizadas, con un peso menor a 2MB para no ralentizar la carga.
- **Estado**: Define si la propiedad está visible al público (Disponible) o no (Oculta, Vendida).

#### B. Edición y Eliminación

Se pueden modificar todos los campos de una propiedad existente.

- **Eliminación Lógica**: Al eliminar una propiedad, esta no se borra físicamente de la base de datos inmediatamente, sino que se marca como eliminada (**Soft Delete**) para preservar el historial y las estadísticas asociadas. Existen scripts de limpieza (`cleanup-deleted-properties.ts`) que corren periódicamente para eliminar definitivamente estos datos.

### 6.4. Gestión Avanzada de Citas

Los administradores tienen control total sobre la agenda:

- **Aprobación/Rechazo**: Pueden confirmar o cancelar citas solicitadas por clientes.
- **Reasignación de Agente**: Si el agente asignado a una propiedad no puede asistir (por vacaciones o enfermedad), el Administrador puede utilizar la función de "Reasignar" (`reassign-agent.dto`) para transferir la cita a otro agente disponible sin necesidad de cancelarla y crearla de nuevo.
- **Filtros**: Ver citas por rango de fechas, por estado o por agente específico.

## 7. SEGURIDAD, AUDITORÍA Y RESPALDOS

Dicasa implementa medidas de seguridad de nivel empresarial.

### Auditoría de Conexiones

El sistema registra cada intento de conexión y acción importante (`action-log.entity.ts`).

- **Qué se registra**: ID del usuario, dirección IP, tipo de acción (crear, borrar, editar), fecha y hora.
- **Para qué sirve**: Permite investigar incidentes de seguridad o errores operativos (ej. "¿Quién borró la propiedad X?").

### Sistema de Respaldos (Backups)

Exclusivo Super Admin. El módulo de respaldo (`backup.controller.ts`) permite generar copias de seguridad de la base de datos.

- **Generación**: Se puede solicitar un backup manual desde el panel.
- **Descarga**: El archivo de respaldo se genera en formato seguro y puede ser descargado para almacenamiento en frío (offline).
- **Automatización**: Se recomienda realizar respaldos semanales para evitar pérdida de información crítica.

### Protección de Datos

- **Encriptación**: Todas las contraseñas se almacenan encriptadas (Hashed). Ni siquiera los administradores pueden ver las contraseñas reales de los usuarios.
- **Sanitización**: El sistema limpia automáticamente los textos ingresados (`sanitize.decorator.ts`) para evitar ataques de inyección de código o XSS.

## 8. SOLUCIÓN DE PROBLEMAS FRECUENTES

Guía rápida para resolver incidencias comunes reportadas por los usuarios.

| Síntoma                                | Causa Probable                                       | Solución Sugerida                                                                     |
| :------------------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------ |
| **"Credenciales Inválidas" al entrar** | Contraseña errónea o usuario no registrado.          | Verifique mayúsculas. Use "Olvidé mi contraseña".                                     |
| **No llega el correo de verificación** | Filtros de SPAM o correo mal escrito.                | Revisar carpeta Spam. Verificar si el email fue escrito correctamente en el registro. |
| **Error al subir imagen de propiedad** | Imagen muy pesada o formato no soportado.            | Asegúrese de que sea JPG/PNG y pese menos de 5MB.                                     |
| **No puedo agendar cita en fecha X**   | La fecha es pasada o el agente no trabaja ese día.   | Seleccione una fecha futura válida.                                                   |
| **El sistema me sacó de la sesión**    | El token de seguridad expiró (2 horas).              | Inicie sesión nuevamente. Es una medida de seguridad.                                 |
| **"Access Denied / Forbidden"**        | Intenta acceder a una zona no permitida para su rol. | Contacte al administrador si cree que debería tener acceso.                           |

## 9. GLOSARIO DE TÉRMINOS

- **Backend**: El "cerebro" del sistema donde se procesan los datos (NestJS).
- **Frontend**: La parte visual que ven los usuarios (Angular).
- **DTO (Data Transfer Object)**: Formato estricto de datos que se envía entre el usuario y el servidor.
- **Endpoint**: Dirección web específica para realizar una acción (ej. `/api/properties`).
- **Soft Delete**: Borrado lógico. El dato se oculta pero no se destruye inmediatamente.
- **Staff**: Término que agrupa a Agentes, Administradores y Super Administradores.
- **Dashboard**: Tablero de control visual con estadísticas.
- **JWT (JSON Web Token)**: La "llave" digital que se entrega al usuario cuando inicia sesión.

---

**Dicasa Group - Tecnología Inmobiliaria**
Para soporte técnico adicional, contacte a [soporte@dicasa.com](mailto:soporte@dicasa.com)
