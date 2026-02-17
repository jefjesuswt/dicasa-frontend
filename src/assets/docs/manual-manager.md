# Manual de Usuario - Gerente

## 1. INTRODUCCIÓN

Bienvenido al Manual de Usuario para el rol de **Gerente** en la plataforma Dicasa. Este documento describe las funcionalidades a las que usted tiene acceso como gestor de oficina, incluyendo la administración del inventario inmobiliario, la gestión de la agenda de citas y el análisis de estadísticas del negocio.

Como Gerente, usted es responsable de supervisar la operación diaria de la inmobiliaria, garantizando que las propiedades estén correctamente publicadas, las citas sean atendidas a tiempo y las métricas del negocio se mantengan saludables.

## 2. ACCESO AL PANEL DE GESTIÓN

Al iniciar sesión con sus credenciales de Gerente, será dirigido automáticamente al **Panel de Gestión (Dashboard)**, donde podrá visualizar un resumen general del estado del negocio.

### 2.1. Métricas Generales

En la parte superior del dashboard encontrará las **Tarjetas de Estado** que muestran:

- **Total de Propiedades**: Cantidad total de inmuebles registrados en el sistema.
- **En Venta**: Propiedades actualmente disponibles para la venta.
- **En Alquiler**: Propiedades disponibles para arrendamiento.
- **Vendidas/Rentadas**: Propiedades que ya completaron su transacción.

Estas métricas se actualizan en tiempo real cada vez que se realiza un cambio en el inventario.

## 3. GESTIÓN DE PROPIEDADES

El módulo de propiedades es el corazón del sistema. Desde aquí podrá administrar el ciclo de vida completo de cada inmueble.

### 3.1. Listado de Propiedades

Al seleccionar la pestaña **"Propiedades"** en el menú del dashboard, verá el listado completo de inmuebles registrados. Desde esta vista puede:

- **Buscar** propiedades por título o características.
- **Filtrar** por tipo de operación (venta/alquiler) o estado.
- **Acceder** a la ficha de cada propiedad para editarla.

### 3.2. Crear Nueva Propiedad

Para registrar un nuevo inmueble, haga clic en el botón **"Nueva Propiedad"** y complete el formulario con la siguiente información:

1. **Información Básica**:

   - **Título**: Nombre descriptivo del inmueble (ej. "Casa en Lechería con vista al mar").
   - **Descripción**: Detalle completo de las características y beneficios.
   - **Precio**: Monto en la moneda correspondiente.
   - **Tipo de Inmueble**: Casa, Apartamento, Local Comercial, Terreno, etc.
   - **Tipo de Operación**: Venta o Alquiler.

2. **Ubicación**:

   - Seleccione el **Estado** (ej. Anzoátegui).
   - Seleccione la **Ciudad** (ej. Lechería, Barcelona, Puerto La Cruz).
   - Ingrese la **dirección detallada**.
   - Utilice el **mapa interactivo** para posicionar la ubicación exacta: puede usar la lupa para buscar una dirección o arrastrar el marcador manualmente.

3. **Características Físicas**:

   - Metros cuadrados de construcción.
   - Número de habitaciones.
   - Número de baños.
   - Puestos de estacionamiento.

4. **Imágenes**:

   - Cargue fotografías del inmueble.
   - **Recomendación**: Use imágenes en formato JPG o PNG, con un peso menor a 2MB por imagen para una carga óptima.
   - Las imágenes se mostrarán en una galería en la ficha pública de la propiedad.

5. **Estado de Publicación**:
   - **Disponible**: Visible al público en el portal.
   - **Oculta**: No visible al público (en preparación).
   - **Vendida/Rentada**: Transacción completada.

### 3.3. Editar una Propiedad

Para modificar una propiedad existente:

1. Ubique la propiedad en el listado.
2. Haga clic en el botón de **edición** (ícono de lápiz).
3. Modifique los campos necesarios.
4. Guarde los cambios.

Todos los campos son editables, incluyendo las imágenes (puede agregar nuevas o eliminar las existentes).

### 3.4. Eliminar una Propiedad

Al eliminar una propiedad, esta **no se borra permanentemente** de forma inmediata. El sistema utiliza un mecanismo de **eliminación lógica (Soft Delete)** que:

- Marca la propiedad como eliminada y la oculta del portal público.
- Preserva el historial y las estadísticas asociadas.
- Permite su recuperación en caso de error.

> **Nota**: La eliminación definitiva se realiza periódicamente mediante procesos automatizados del sistema.

## 4. GESTIÓN DE CITAS

El módulo de citas le permite supervisar y administrar todas las visitas programadas por los clientes.

### 4.1. Listado de Citas

Al seleccionar la pestaña **"Agenda"** en el menú, accederá al listado completo de citas. Puede filtrarlas por:

- **Estado**: Pendientes, Confirmadas, Canceladas o Completadas.
- **Rango de Fechas**: Para ver citas en un período específico.
- **Agente asignado**: Para revisar la carga de trabajo de cada agente.

### 4.2. Estados de las Citas

Las citas pasan por los siguientes estados:

| Estado                     | Descripción                                                               |
| :------------------------- | :------------------------------------------------------------------------ |
| **PENDING (Pendiente)**    | El cliente ha solicitado la visita. Requiere acción por parte del equipo. |
| **CONFIRMED (Confirmada)** | La visita ha sido aprobada. El cliente recibirá una notificación.         |
| **CANCELED (Cancelada)**   | La visita fue cancelada por el equipo o el cliente.                       |
| **COMPLETED (Completada)** | La visita ya se realizó. Se conserva para historial y estadísticas.       |

### 4.3. Aprobar o Rechazar Citas

Cuando un cliente solicita una visita, la cita aparece con estado **Pendiente**. Usted puede:

1. **Confirmar** la cita: Se notificará al cliente con la fecha y hora acordada.
2. **Cancelar** la cita: Se notificará al cliente el motivo de la cancelación.

### 4.4. Reasignar Agente

Si el agente originalmente asignado a una propiedad no puede atender una cita (por vacaciones, enfermedad u otra razón), puede **reasignar** la cita a otro agente disponible sin necesidad de cancelarla y crearla nuevamente:

1. Abra la cita en cuestión.
2. Utilice la opción de **reasignar agente**.
3. Seleccione el nuevo agente de la lista de agentes disponibles.
4. Confirme la reasignación.

### 4.5. Crear Cita Manualmente

Además de las citas que crean los clientes, usted puede crear citas manualmente:

1. Haga clic en **"Nueva Cita"**.
2. Seleccione la propiedad, el cliente y el agente.
3. Defina la fecha y hora.
4. Agregue notas opcionales.

> **Importante**: El sistema no permite programar citas en fechas pasadas.

## 5. ANÁLISIS DE ESTADÍSTICAS

El módulo de estadísticas le proporciona herramientas visuales para analizar el rendimiento del negocio y tomar decisiones informadas.

### 5.1. Acceso a Estadísticas

Seleccione la pestaña **"Estadísticas"** en el menú del dashboard para acceder a los gráficos y reportes.

### 5.2. Métricas Disponibles

Las estadísticas incluyen:

- **Distribución de Propiedades**: Gráficos que muestran la proporción de inmuebles por tipo de operación (venta vs. alquiler), por tipo de inmueble y por estado.
- **Actividad de Citas**: Volumen de citas por período, tasas de confirmación y cancelación.
- **Rendimiento de Agentes**: Cantidad de propiedades asignadas y citas gestionadas por cada agente.
- **Propiedades Populares**: Estadísticas sobre las propiedades más consultadas por los clientes.

### 5.3. Cómo Interpretar los Gráficos

- **Gráficos de Barras**: Permiten comparar valores entre categorías (ej. propiedades por ciudad).
- **Gráficos Circulares**: Muestran la distribución porcentual (ej. proporción de ventas vs. alquileres).
- **Líneas de Tendencia**: Indican la evolución de métricas a lo largo del tiempo.

> **Consejo**: Utilice las estadísticas para identificar oportunidades de mejora, como ciudades con alta demanda pero poca oferta, o agentes con baja actividad.

## 6. SOLUCIÓN DE PROBLEMAS FRECUENTES

| Síntoma                                     | Causa Probable                                                            | Solución Sugerida                                                 |
| :------------------------------------------ | :------------------------------------------------------------------------ | :---------------------------------------------------------------- |
| **No veo una propiedad que acabo de crear** | El estado puede estar en "Oculta".                                        | Verifique el estado de publicación en la edición de la propiedad. |
| **No puedo reasignar un agente**            | No hay otros agentes registrados en el sistema.                           | Solicite al Administrador registrar nuevos agentes.               |
| **Las estadísticas no se actualizan**       | Los datos se actualizan en tiempo real, pero puede haber un leve retraso. | Recargue la página o espere unos segundos.                        |
| **Error al subir imagen de propiedad**      | Imagen muy pesada o formato no soportado.                                 | Asegúrese de que sea JPG/PNG y pese menos de 5MB.                 |
| **No puedo agendar cita en una fecha**      | La fecha seleccionada es pasada.                                          | Seleccione una fecha futura válida.                               |
| **El sistema me sacó de la sesión**         | El token de seguridad expiró (2 horas).                                   | Inicie sesión nuevamente. Es una medida de seguridad.             |

## 7. GLOSARIO DE TÉRMINOS

- **Dashboard**: Tablero de control visual con estadísticas y accesos rápidos.
- **Soft Delete**: Borrado lógico. La propiedad se oculta pero no se destruye inmediatamente.
- **Staff**: Término que agrupa a Agentes, Gerentes y Administradores.
- **RBAC**: Control de Acceso Basado en Roles. Define qué puede hacer cada usuario según su rol.
- **OTP**: Código de un solo uso enviado al correo para verificaciones de seguridad.
