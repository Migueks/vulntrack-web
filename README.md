# VulnTrack Web

Frontend de **VulnTrack**, una plataforma FullStack de gestión de vulnerabilidades de ciberseguridad.

La aplicación permite consultar activos tecnológicos, vulnerabilidades y hallazgos de seguridad, gestionar el ciclo de vida de los Findings, administrar evidencias y visualizar indicadores de riesgo mediante un Dashboard interactivo.

El proyecto se ha desarrollado como parte de un Proyecto Final de Máster FullStack.

## Tecnologías

- React 19
- Vite 8
- JavaScript (ES Modules)
- React Router 7
- TanStack React Query 5
- Recharts 3
- i18next + react-i18next
- Lucide React
- CSS Modules
- CSS custom properties
- Fetch API

## Arquitectura

El frontend se organiza por responsabilidades y páginas, separando acceso a API, autenticación, componentes reutilizables, internacionalización, rutas, estilos y vistas.

```text
src/
├── api/
│   ├── apiClient.js
│   ├── assetsApi.js
│   ├── authApi.js
│   ├── findingsApi.js
│   ├── usersApi.js
│   └── vulnerabilitiesApi.js
├── components/
│   ├── findings/
│   ├── layout/
│   └── routes/
├── context/
├── i18n/
│   └── locales/
├── pages/
│   ├── AssetDetail/
│   ├── Assets/
│   ├── Dashboard/
│   ├── FindingDetail/
│   ├── Findings/
│   ├── Home/
│   ├── Login/
│   ├── NotFound/
│   ├── Profile/
│   ├── Users/
│   ├── Vulnerabilities/
│   └── VulnerabilityDetail/
├── routes/
├── styles/
├── App.jsx
└── main.jsx
```

`apiClient.js` centraliza las peticiones HTTP, el envío del JWT, la gestión de errores y las descargas protegidas.

TanStack React Query se utiliza para obtener datos, gestionar mutaciones, caché, refrescos e invalidación de consultas.

## Funcionalidades

### Home y autenticación

- Página pública de presentación.
- Inicio de sesión mediante email y contraseña.
- Persistencia de la sesión mediante JWT en `sessionStorage`.
- Recuperación del usuario autenticado.
- Cierre automático de sesión cuando la API invalida el token.
- Mensaje específico para cuentas desactivadas.
- Rutas privadas protegidas.
- Restricción de módulos según rol.

### Dashboard

- Resumen de indicadores principales.
- Hallazgos activos y cerrados.
- Hallazgos vencidos y sin asignar.
- Tendencia mensual de detecciones y cierres.
- Distribución de hallazgos activos por prioridad.
- Distribución por estado.
- Actividad reciente.
- Visualizaciones mediante Recharts.
- Navegación desde gráficos hacia Findings ya filtrados.

### Assets

- Inventario de activos tecnológicos.
- Búsqueda y filtros.
- Ordenación y paginación.
- Vista de detalle.
- Consulta de Findings relacionados.
- Interfaz responsive con tarjetas en pantallas pequeñas.

### Vulnerabilities

- Catálogo de vulnerabilidades.
- Búsqueda y filtros por severidad, categoría y estado.
- Visualización de CVE y CVSS.
- Ordenación y paginación.
- Vista de detalle.
- Consulta de Findings relacionados.
- Interfaz responsive con tarjetas en pantallas pequeñas.

### Findings

- Listado de hallazgos con búsqueda, filtros y paginación.
- Filtros por prioridad, estado y vencimiento.
- Sincronización de filtros con parámetros de URL.
- Vista de detalle con activo y vulnerabilidad relacionados.
- Asignación de responsables.
- Workflow de estados según rol y estado actual.
- Notas de seguimiento e historial.
- Confirmaciones antes de estados de cierre.
- Feedback visual de operaciones correctas y errores.
- Interfaz responsive con tarjetas en pantallas pequeñas.

### Evidencias

- Subida de PNG, JPEG, WEBP y PDF.
- Tamaño máximo de 5 MB por archivo.
- Máximo de 10 evidencias por Finding.
- Descarga autenticada mediante la API.
- Eliminación controlada por permisos.
- Confirmación antes de eliminar una evidencia.
- Feedback visual tras subir o eliminar archivos.

### Users

Módulo disponible exclusivamente para ADMIN.

- Consulta de usuarios.
- Búsqueda y filtros por rol y estado.
- Creación de cuentas.
- Edición de datos y roles.
- Activación y desactivación.
- Protección frente a la desactivación de la propia cuenta desde la interfaz.
- Confirmación antes de desactivar usuarios.
- Feedback visual de operaciones.
- Interfaz responsive con tarjetas en pantallas pequeñas.

### Profile

Disponible para cualquier usuario autenticado.

- Acceso desde el bloque de usuario del Sidebar.
- Consulta del código de usuario y rol.
- Edición del nombre y correo electrónico.
- Confirmación del correo electrónico antes de guardar cambios.
- Validación para impedir guardar correos que no coincidan.
- Cambio de contraseña desde la propia interfaz.
- Validación de la contraseña actual.
- Confirmación de la nueva contraseña.
- Cierre automático de sesión después de cambiar la contraseña.
- Actualización inmediata de los datos visibles del usuario en la interfaz.

### Internacionalización

La interfaz está disponible en:

- Español.
- Inglés.

Las traducciones se gestionan mediante `i18next` y `react-i18next`.

## Roles y permisos

| Funcionalidad | ADMIN | ANALYST | VIEWER |
| --- | --- | --- | --- |
| Consultar Dashboard | Sí | Sí | Sí |
| Consultar activos | Sí | Sí | Sí |
| Consultar vulnerabilidades | Sí | Sí | Sí |
| Consultar Findings | Sí | Sí | Sí |
| Gestionar Findings | Sí | Según asignación | No |
| Añadir notas | Sí | Según asignación | No |
| Gestionar evidencias | Sí | Según asignación | No |
| Descargar evidencias | Sí | Según asignación | No |
| Gestionar perfil propio | Sí | Sí | Sí |
| Cambiar contraseña propia | Sí | Sí | Sí |
| Gestionar usuarios | Sí | No | No |

La interfaz adapta las acciones disponibles al rol del usuario, pero **la autorización definitiva siempre se valida en el backend**.

## Rutas principales

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `/` | Pública | Página de inicio |
| `/login` | Pública | Inicio de sesión |
| `/dashboard` | Autenticado | Panel principal |
| `/assets` | Autenticado | Inventario de activos |
| `/assets/:id` | Autenticado | Detalle de activo |
| `/vulnerabilities` | Autenticado | Catálogo de vulnerabilidades |
| `/vulnerabilities/:id` | Autenticado | Detalle de vulnerabilidad |
| `/findings` | Autenticado | Listado de hallazgos |
| `/findings/:id` | Autenticado | Detalle y workflow del hallazgo |
| `/profile` | Autenticado | Gestión del perfil personal y cambio de contraseña |
| `/users` | ADMIN | Administración de usuarios |
| `*` | Pública/Autenticada | Página 404 |

## React Query y hooks

El proyecto utiliza hooks para resolver necesidades concretas de la interfaz:

- `useState` para formularios, filtros y estados locales.
- `useContext` mediante `useAuth` para compartir la sesión autenticada.
- `useDeferredValue` en búsquedas para evitar actualizar la consulta por cada pulsación inmediata.
- `useQuery` para carga y caché de datos remotos.
- `useMutation` para operaciones de escritura.
- `useQueryClient` para invalidar y refrescar datos relacionados después de una mutación.

Las páginas se cargan mediante `React.lazy` y `Suspense`, reduciendo el bundle inicial mediante code splitting.

## UX, responsive y accesibilidad

- Diseño oscuro orientado a una herramienta corporativa de ciberseguridad.
- Variables CSS reutilizables para colores, espaciados, radios y transiciones.
- CSS Modules para aislar estilos por componente.
- Sidebar responsive.
- Tablas transformadas en tarjetas en móvil para evitar desplazamiento horizontal.
- Estados de carga, error y ausencia de datos.
- Confirmaciones en acciones sensibles.
- Feedback visual tras operaciones administrativas.
- Navegación mediante teclado en filas interactivas.
- Estados `focus-visible`.
- Enlace para saltar directamente al contenido principal.
- Página 404 específica.
- Lazy loading de páginas para mejorar el rendimiento inicial.

## Integración con la API

El frontend consume la API REST de VulnTrack mediante `fetch`.

La URL base se define con:

```dotenv
VITE_API_URL=http://localhost:3000/api/v1
```

Las peticiones privadas envían:

```http
Authorization: Bearer <JWT>
```

El módulo de perfil utiliza los endpoints:

```http
PATCH /users/me
PATCH /users/me/password
```

Tras cambiar la contraseña, el backend invalida el JWT actual y el frontend cierra la sesión para solicitar una nueva autenticación.

`apiClient.js` se encarga de:

- Construir las peticiones HTTP.
- Adjuntar el JWT cuando corresponde.
- Serializar cuerpos JSON.
- Respetar `FormData` en la subida de evidencias.
- Normalizar errores de API.
- Detectar sesiones expiradas o invalidadas.
- Descargar evidencias protegidas como `Blob`.

Repositorio del backend:

```text
https://github.com/Migueks/vulntrack-api
```

## Instalación

### Requisitos

- Node.js 22.
- npm.
- VulnTrack API configurada y en ejecución.

Clonar el repositorio:

```bash
git clone https://github.com/Migueks/vulntrack-web.git
```

Acceder al proyecto:

```bash
cd vulntrack-web
```

Instalar las dependencias:

```bash
npm ci
```

Crear el archivo de entorno a partir de `.env.example`.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Configurar la URL de la API:

```dotenv
VITE_API_URL=http://localhost:3000/api/v1
```

Arrancar el entorno de desarrollo:

```bash
npm run dev
```

Por defecto, Vite estará disponible en:

```text
http://localhost:5173
```

## Variables de entorno

```dotenv
VITE_API_URL=http://localhost:3000/api/v1
```

`VITE_API_URL` debe apuntar al prefijo completo de la API de VulnTrack.

En producción se utiliza:

```dotenv
VITE_API_URL=https://vulntrack-api-5byl.onrender.com/api/v1
```

## Despliegue

El frontend está desplegado en **Netlify**.

### Aplicación

```text
https://vulntrack-web.netlify.app
```

### Backend conectado

```text
https://vulntrack-api-5byl.onrender.com
```

### API REST

```text
https://vulntrack-api-5byl.onrender.com/api/v1
```

La aplicación utiliza una regla de redirección SPA en `public/_redirects` para que React Router gestione correctamente las rutas al acceder directamente o refrescar la página:

```text
/*    /index.html   200
```

Netlify ejecuta `npm run build` y publica el directorio `dist`.

## Comandos disponibles

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

### Desarrollo

```bash
npm run dev
```

### ESLint

```bash
npm run lint
```

### Build de producción

```bash
npm run build
```

### Previsualización del build

```bash
npm run preview
```

## Calidad y rendimiento

Antes del cierre del proyecto se han comprobado:

```bash
npm run lint
npm run build
```

El proyecto utiliza carga diferida de páginas para dividir el bundle de producción en distintos chunks.

Los módulos principales como Dashboard, Assets, Vulnerabilities, Findings y Users se cargan de forma independiente cuando son necesarios.

## Seguridad

El frontend incorpora medidas orientadas a reducir errores de uso y exposición innecesaria:

- JWT almacenado durante la sesión del navegador.
- Eliminación del token cuando la API devuelve una sesión no válida.
- Rutas protegidas.
- Ocultación de funciones administrativas para usuarios sin permisos.
- Restricción del módulo Users a ADMIN.
- Confirmaciones antes de acciones sensibles.
- Validación previa de formato y tamaño de evidencias.
- Mensajes de autenticación que distinguen cuentas desactivadas cuando la API lo autoriza.

Estas medidas **no sustituyen la seguridad del backend**. La API aplica autenticación, autorización, validación y permisos de forma independiente.

## Estado del proyecto

El frontend se encuentra desarrollado, integrado con VulnTrack API y desplegado en producción mediante Netlify.

Se han completado las vistas principales, gestión por roles, internacionalización, diseño responsive, accesibilidad básica, code splitting y comprobaciones de ESLint y build de producción.

La aplicación consume la API desplegada en Render mediante la variable `VITE_API_URL` y utiliza una redirección SPA para mantener el funcionamiento de React Router en producción.

## Autor

Miguel López-Herrero López

Proyecto Final Máster Desarrollo Web FullStack.
