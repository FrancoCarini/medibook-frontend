# Medibook Frontend

Sistema de gestión de turnos médicos desarrollado con React + TypeScript + Vite + Tailwind CSS.

## 🚀 Stack Tecnológico

- **React 18** + TypeScript
- **Vite** para el bundling y desarrollo
- **React Router DOM** para navegación
- **Tailwind CSS** para estilos
- **Axios** para comunicación con API
- **Context API** para manejo de estado global

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── ProtectedRoute.tsx
├── contexts/           # Context providers (AuthContext)
├── hooks/             # Custom hooks
├── pages/             # Páginas principales
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
├── services/          # Servicios para API
│   ├── api.ts         # Cliente HTTP configurado
│   └── auth.ts        # Servicio de autenticación
├── types/             # Definiciones de tipos TypeScript
│   └── index.ts       # Interfaces y enums
└── utils/             # Utilidades y helpers
```

## 🔧 Configuración

### Variables de Entorno
Crear archivo `.env` basado en `.env.example`:

```bash
VITE_API_URL=http://localhost:3000
```

### Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview
```

## 🔐 Autenticación

El sistema implementa autenticación JWT con refresh tokens:

- **AuthContext**: Maneja estado global de autenticación
- **ProtectedRoute**: Protege rutas que requieren autenticación
- **Interceptores Axios**: Manejo automático de refresh tokens
- **Local Storage**: Persistencia de tokens

## 👥 Roles y Permisos

### ADMIN
- Gestión de usuarios (médicos y pacientes)
- Configuración de especialidades
- Reportes del sistema

### DOCTOR
- Gestión de citas propias
- Configuración de disponibilidad
- Agenda personal

### PATIENT
- Reserva de citas
- Historial de citas
- Perfil personal

## 🏥 Funcionalidades Principales

### Sistema de Turnos
- **ConfigAvailability**: Plantillas de disponibilidad recurrente
- **Availability**: Slots de tiempo específicos
- **Appointment**: Citas médicas confirmadas

### Tipos de Atención
- **GUARD**: Guardia médica
- **SCHEDULED**: Cita programada

### Modalidades
- **IN_PERSON**: Presencial
- **VIRTUAL**: Telemedicina

## 📋 Estados del Sistema

### Availability Status
- `AVAILABLE`: Disponible para reserva
- `BOOKED`: Reservado
- `CANCELLED`: Cancelado

### Appointment Status
- `BOOKED`: Confirmada
- `CANCELLED`: Cancelada
- `COMPLETED`: Completada
- `ONGOING`: En curso

## 🔄 Integración con Backend

El frontend se conecta con la API de NestJS siguiendo estos endpoints:

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Cerrar sesión

### Usuarios
- `POST /users` - Crear usuario
- `GET /users/doctors` - Listar médicos

### Especialidades
- `GET /specialties` - Listar especialidades
- `POST /specialties` - Crear especialidad

### Citas
- `POST /appointments` - Crear cita
- `PATCH /appointments/:id/cancel` - Cancelar cita

### Disponibilidad
- `POST /availabilities` - Crear disponibilidad
- `GET /availabilities/search` - Buscar disponibilidades
- `PATCH /availabilities/:id` - Actualizar disponibilidad
- `DELETE /availabilities/:id` - Eliminar disponibilidad

### Configuración de Disponibilidad
- `POST /config-availabilities` - Crear plantilla
- `GET /config-availabilities` - Listar plantillas
- `PATCH /config-availabilities/:id` - Actualizar plantilla
- `DELETE /config-availabilities/:id` - Eliminar plantilla

## 🎨 Diseño y UX

- **Tailwind CSS** para estilos consistentes
- **Responsive Design** para móviles y desktop
- **Loading States** para mejor UX
- **Error Handling** con mensajes claros
- **Navegación intuitiva** basada en roles

## 📝 Próximas Funcionalidades

- [ ] Calendario de citas
- [ ] Notificaciones en tiempo real
- [ ] Filtros avanzados de búsqueda
- [ ] Historial médico
- [ ] Reportes y estadísticas
- [ ] Configuración de perfil de usuario
- [ ] Gestión de especialidades por médico
- [ ] Sistema de notificaciones por email/SMS

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Coverage
npm run test:coverage
```

## 📦 Build y Deployment

```bash
# Build para producción
npm run build

# Los archivos se generan en /dist
```

## 🔒 Seguridad

- Tokens JWT con expiración automática
- Refresh tokens para sesiones persistentes
- Validación de roles en rutas protegidas
- Interceptores para manejo de errores 401/403
- Sanitización de inputs en formularios

---

**Nota**: Este frontend está diseñado para trabajar con el backend de Medibook desarrollado en NestJS + Prisma + PostgreSQL.