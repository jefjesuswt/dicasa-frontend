# Manual de Usuario - Agente Inmobiliario

## 1. INTRODUCCIÓN

Bienvenido al Manual de Usuario para el rol de **Agente Inmobiliario** en la plataforma Dicasa. Este documento describe las funcionalidades disponibles para usted como agente de ventas, incluyendo la gestión de las propiedades que le han sido asignadas y la atención de las citas programadas por los clientes.

Como Agente, usted es el principal punto de contacto entre la inmobiliaria y los clientes interesados en los inmuebles. Su rol es fundamental para brindar una experiencia de atención personalizada y eficiente.

## 2. ACCESO AL SISTEMA

### 2.1. Inicio de Sesión

1. Ingrese a la plataforma a través del navegador web.
2. Haga clic en **"Iniciar Sesión"**.
3. Ingrese sus credenciales (correo y contraseña proporcionados por el administrador).
4. Una vez autenticado, tendrá acceso a las secciones correspondientes a su rol.

### 2.2. Seguridad de la Sesión

- Su sesión tiene una duración de **2 horas**. Después de ese tiempo, deberá iniciar sesión nuevamente.
- Si olvida su contraseña, utilice la opción **"¿Olvidaste tu contraseña?"** en la pantalla de login para restablecerla.

## 3. GESTIÓN DE PROPIEDADES ASIGNADAS

Como agente, usted puede ver y gestionar las propiedades que le han sido asignadas en el sistema.

### 3.1. Ver sus Propiedades

Desde el **Panel de Gestión (Dashboard)**, seleccione la pestaña **"Propiedades"** para ver el listado completo de inmuebles. Las propiedades que le han sido asignadas aparecerán identificadas.

### 3.2. Crear Nueva Propiedad

Para registrar un nuevo inmueble:

1. Haga clic en **"Nueva Propiedad"**.
2. Complete el formulario con la información requerida:
   - **Título**: Nombre descriptivo del inmueble.
   - **Descripción**: Detalle completo de las características.
   - **Precio**: Monto de venta o alquiler.
   - **Tipo**: Casa, Apartamento, Local, Terreno, etc.
   - **Operación**: Venta o Alquiler.
3. Indique la **ubicación** utilizando los selectores de Estado y Ciudad, y posicione el marcador en el mapa interactivo.
4. Agregue las **características físicas**: metros cuadrados, habitaciones, baños, estacionamiento.
5. Cargue las **imágenes** del inmueble (formato JPG/PNG, menos de 2MB por imagen).
6. Guarde la propiedad.

### 3.3. Editar Propiedades

Para modificar la información de una propiedad:

1. Ubique la propiedad en el listado.
2. Haga clic en el ícono de **edición** (lápiz).
3. Actualice los campos necesarios (precio, descripción, imágenes, estado, etc.).
4. Guarde los cambios.

### 3.4. Estados de una Propiedad

Las propiedades pueden tener los siguientes estados:

| Estado         | Descripción                                             |
| :------------- | :------------------------------------------------------ |
| **Disponible** | Visible al público en el portal web.                    |
| **Oculta**     | No visible al público (en preparación o revisión).      |
| **Vendida**    | La propiedad fue vendida. Se mantiene para historial.   |
| **Rentada**    | La propiedad fue alquilada. Se mantiene para historial. |

## 4. ATENCIÓN DE CITAS

Los clientes pueden solicitar visitas a las propiedades directamente desde el portal. Usted recibirá estas solicitudes y podrá gestionarlas.

### 4.1. Ver Citas Programadas

Desde el Dashboard, seleccione la pestaña **"Agenda"** para ver todas las citas relacionadas con sus propiedades.

### 4.2. Estados de las Citas

| Estado                     | Descripción                                                |
| :------------------------- | :--------------------------------------------------------- |
| **PENDING (Pendiente)**    | Un cliente ha solicitado una visita. Requiere su atención. |
| **CONFIRMED (Confirmada)** | La visita ha sido aprobada. El cliente será notificado.    |
| **CANCELED (Cancelada)**   | La visita fue cancelada.                                   |
| **COMPLETED (Completada)** | La visita ya se realizó.                                   |

### 4.3. Confirmar o Cancelar Citas

1. Identifique las citas con estado **Pendiente**.
2. Revise los detalles: fecha, hora, propiedad y datos del cliente.
3. **Confirme** la cita si puede asistir en la fecha indicada.
4. **Cancele** la cita si hay algún impedimento (se notificará al cliente).

### 4.4. Preparación para la Visita

Antes de una visita confirmada:

- Verifique la **dirección exacta** de la propiedad.
- Revise los **datos de contacto** del cliente (teléfono, correo).
- Consulte las **notas** que el cliente pudo haber dejado al agendar (ej. "Iré con mi familia").
- Asegúrese de que la propiedad esté **presentable** para la visita.

## 5. GESTIÓN DE PERFIL

### 5.1. Actualizar su Información

Desde la opción **"Mi Perfil"** en el menú de usuario puede:

- Actualizar su **número de teléfono** (importante para que los clientes puedan contactarlo).
- Cambiar su **foto de perfil** (Avatar).
- Revisar su **historial de citas** pasadas y futuras.

### 5.2. Cambiar Contraseña

Si desea cambiar su contraseña:

1. Acceda a su perfil.
2. Utilice la opción de cambio de contraseña.
3. La nueva contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número.

## 6. SOLUCIÓN DE PROBLEMAS FRECUENTES

| Síntoma                              | Causa Probable                            | Solución Sugerida                                           |
| :----------------------------------- | :---------------------------------------- | :---------------------------------------------------------- |
| **No veo mis propiedades asignadas** | Las propiedades pueden estar filtradas.   | Verifique los filtros aplicados en el listado.              |
| **No puedo confirmar una cita**      | La fecha puede haber pasado.              | Contacte al gerente para asistencia.                        |
| **Error al subir imagen**            | Imagen muy pesada o formato no soportado. | Use JPG/PNG de menos de 5MB.                                |
| **El sistema me sacó de la sesión**  | El token de seguridad expiró (2 horas).   | Inicie sesión nuevamente.                                   |
| **No puedo editar una propiedad**    | Puede no estar asignada a usted.          | Contacte al gerente para verificar la asignación.           |
| **Cliente no recibe notificación**   | El correo puede estar en Spam.            | Sugiera al cliente revisar su carpeta de correo no deseado. |

## 7. GLOSARIO DE TÉRMINOS

- **Dashboard**: Panel de control con acceso a propiedades y citas.
- **Soft Delete**: Borrado lógico — la propiedad se oculta pero no se destruye.
- **Staff**: Agentes, Gerentes y Administradores del sistema.
- **JWT**: Token de seguridad que valida su sesión (dura 2 horas).
- **OTP**: Código de un solo uso para verificaciones de seguridad.
