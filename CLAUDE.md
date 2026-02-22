# Medibook Frontend

Sistema de gestión de turnos médicos multi-tenant desarrollado con React + TypeScript + Vite + MUI.

## Stack Tecnológico

- **React 18** + TypeScript
- **Vite** para el bundling y desarrollo
- **React Router DOM** para navegación
- **MUI (Material UI)** para componentes y estilos
- **Axios** para comunicación con API
- **Context API** para manejo de estado global

## Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── ProtectedRoute.tsx
│   ├── AppointmentCardSkeleton.tsx
│   ├── AppointmentConfirmationModal.tsx
│   └── availability/       # Componentes de disponibilidad (doctor)
│       ├── CalendarView.tsx
│       ├── DayAvailabilitiesModal.tsx
│       ├── IndividualAvailabilityForm.tsx
│       ├── MyConfigurationsPanel.tsx
│       └── RecurringAvailabilityForm.tsx
├── contexts/
│   ├── AuthContext.tsx       # Estado global de autenticación
│   └── UIContext.tsx         # Snackbars, notificaciones UI
├── pages/
│   ├── LoginPage.tsx         # Login genérico (sin slug)
│   ├── RegisterPage.tsx      # Registro de paciente
│   ├── DashboardPage.tsx     # Dashboard por rol (doctor/admin)
│   ├── ClientLoginPage.tsx   # Login con contexto de client (/:slug)
│   ├── ClientsIndexPage.tsx  # Index de clientes (paciente sin slug)
│   ├── AppointmentBookingPage.tsx  # Reserva de turnos
│   ├── MyAppointmentsPage.tsx      # Turnos del paciente
│   ├── DoctorAppointmentsPage.tsx  # Turnos del doctor
│   └── AvailabilityManagementPage.tsx  # Gestión de agenda (doctor)
├── services/
│   ├── api.ts               # Cliente HTTP (Axios) con interceptores
│   ├── auth.ts              # Login, register, refresh, logout
│   ├── clients.ts           # GET /clients, GET /clients/:slug
│   ├── patients.ts          # GET /patients/my-clients
│   ├── users.ts             # Crear usuarios
│   ├── specialties.ts       # CRUD especialidades
│   ├── availabilities.ts    # CRUD disponibilidades
│   ├── configAvailabilities.ts  # CRUD agendas recurrentes
│   ├── appointments.ts      # CRUD turnos
│   └── index.ts             # Re-exports
├── types/
│   └── index.ts             # Interfaces y enums
└── utils/
    └── messages.ts          # Mensajes UI + traducciones backend→español
```

## Configuración

### Variables de Entorno

```bash
VITE_API_URL=http://localhost:3000
```

### Instalación y Ejecución

```bash
npm install
npm run dev       # Desarrollo
npm run build     # Producción
```

## Multi-tenancy (Client)

La plataforma funciona como SaaS multi-tenant. El concepto central es el **Client** (clínica o profesional independiente). Cada client tiene un `slug` único que se usa como URL de acceso.

### Modelo Client

```ts
interface Client {
  id: string;
  name: string;
  slug: string;
}
```

### Dos flujos de entrada para pacientes

#### Flujo A: Con slug (enlace del médico)

El médico le da al paciente una URL tipo `medibook.com/dr-juan-diaz`.

```
1. Paciente navega a /dr-juan-diaz
2. Ve formulario de login con el nombre del client (ej: "Dr. Juan Díaz")
3. Se loguea → va a /dr-juan-diaz/book-appointment
4. Busca turnos (filtrados por ese client) y reserva
```

#### Flujo B: Sin slug (login genérico)

El paciente entra directamente a `medibook.com/login`.

```
1. Paciente navega a /login
2. Ve formulario de login genérico
3. Se loguea → va a /clients (index de clientes)
4. Ve dos secciones:
   a. "Mis clínicas" → clients donde ya se atendió (GET /patients/my-clients)
   b. "Explorar clínicas" → todos los clients activos (GET /clients)
5. Elige un client → navega a /:slug/book-appointment
```

#### Flujo Doctor/Admin

Sin cambios: `/login` → `/dashboard` (gestión de agenda, citas, etc.)

## Autenticación

JWT con refresh tokens:

- **AuthContext**: Estado global de autenticación (user, login, logout)
- **ProtectedRoute**: Protege rutas. Si no autenticado, redirige a `/login` o a `/:slug` si hay contexto de client
- **Interceptores Axios**: Refresh automático en 401
- **Local Storage**: Persistencia de accessToken y user

### JWT Payload (doctores incluyen clientId)

```
PATIENT → { userId, role }
DOCTOR  → { userId, role, doctorId, clientId }
ADMIN   → { userId, role }
```

## Roles y Permisos

### ADMIN
- Gestión de usuarios (médicos con clientId, admins)
- Configuración de especialidades
- Crear/editar clients

### DOCTOR
- Gestión de citas propias
- Configuración de disponibilidad (agenda)
- Pertenece a un solo Client

### PATIENT
- Entra por slug de client o por login genérico
- Reserva de citas dentro del contexto de un client
- Ve historial de citas
- Se asocia automáticamente a un client al sacar su primer turno (PatientClient)

## Rutas

### Públicas (sin auth)
| Ruta | Página | Descripción |
|------|--------|-------------|
| `/login` | LoginPage | Login genérico. Paciente → `/clients`, Doctor/Admin → `/dashboard` |
| `/register` | RegisterPage | Registro de paciente. Soporta `?client=slug` para volver al client |
| `/:slug` | ClientLoginPage | Login con contexto de client. Muestra nombre del client |

### Protegidas (requieren auth)
| Ruta | Roles | Página | Descripción |
|------|-------|--------|-------------|
| `/clients` | PATIENT | ClientsIndexPage | "Mis clínicas" + "Explorar clínicas" |
| `/:slug/book-appointment` | PATIENT | AppointmentBookingPage | Reservar turno en contexto del client |
| `/:slug/my-appointments` | PATIENT | MyAppointmentsPage | Turnos del paciente con ese client |
| `/dashboard` | DOCTOR, ADMIN | DashboardPage | Panel de control por rol |
| `/doctor-appointments` | DOCTOR | DoctorAppointmentsPage | Citas del doctor |
| `/availability-management` | DOCTOR | AvailabilityManagementPage | Gestión de agenda |

**Nota:** `/:slug` es catch-all, se define al final del router antes del 404.

## Integración con Backend

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro de paciente
- `GET /auth/verify-email` - Verificar email
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Cerrar sesión

### Clients (NUEVO)
- `GET /clients` - Listar clients activos (público)
- `GET /clients/:slug` - Detalle de client con doctores y especialidades (público)

### Patients (NUEVO)
- `GET /patients/my-clients` - Clients donde el paciente se atendió

### Usuarios
- `POST /users` - Crear usuario (doctor requiere `clientId` en `doctorData`)

### Especialidades
- `GET /specialties` - Listar especialidades
- `POST /specialties` - Crear especialidad

### Disponibilidad
- `POST /availabilities` - Crear disponibilidad
- `GET /availabilities/search` - Buscar (soporta filtro `clientId`)
- `PATCH /availabilities/:id` - Actualizar
- `DELETE /availabilities/:id` - Eliminar

### Configuración de Disponibilidad
- `POST /config-availabilities` - Crear agenda recurrente
- `GET /config-availabilities` - Listar agendas
- `PATCH /config-availabilities/:id` - Actualizar
- `DELETE /config-availabilities/:id` - Eliminar

### Citas
- `POST /appointments` - Crear turno (auto-crea PatientClient)
- `GET /appointments` - Listar turnos (filtrado por rol)
- `PATCH /appointments/:id/cancel` - Cancelar
- `PATCH /appointments/:id/complete` - Completar

## Sistema de Traducciones

En `src/utils/messages.ts`:

- `MESSAGES` → mensajes del frontend (UI) en español
- `backendMessages` → mapeo de mensajes del backend (inglés → español)
- `translate(message)` → traduce un mensaje del backend
- `getErrorMessage(error, fallback)` → extrae y traduce error de API
- El interceptor de Axios traduce automáticamente los errores

## Estados del Sistema

### Availability Status
- `AVAILABLE` / `BOOKED` / `CANCELLED`

### Appointment Status
- `BOOKED` / `CANCELLED` / `COMPLETED` / `ONGOING`

### Modalidades
- `IN_PERSON` (Presencial) / `VIRTUAL` (Telemedicina)

## Seguridad

- Tokens JWT con expiración automática
- Refresh tokens para sesiones persistentes
- Validación de roles en rutas protegidas (ProtectedRoute)
- Interceptores para manejo de errores 401/403
- Sanitización de inputs en formularios

---

**Nota**: Este frontend trabaja con el backend de Medibook (NestJS + Prisma + PostgreSQL). Ver `DESIGN.md` en el repo del backend para la spec completa.
