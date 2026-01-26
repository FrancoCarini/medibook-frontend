/**
 * Mensajes del frontend (UI)
 */
export const MESSAGES = {
  // Auth
  WELCOME: '¡Bienvenido a Medibook!',
  LOGIN_ERROR: 'Error al iniciar sesión',
  REGISTER_SUCCESS: 'Registro exitoso. Revisa tu email para verificar tu cuenta.',
  REGISTER_ERROR: 'Error al registrarse',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres',

  // Appointments
  APPOINTMENT_BOOKED: '¡Cita reservada exitosamente! Recibirás un correo de confirmación.',
  APPOINTMENT_BOOKING_ERROR: 'Error al reservar la cita. Por favor, intenta nuevamente.',
  APPOINTMENT_CANCELLED: 'Cita cancelada exitosamente',
  APPOINTMENT_CANCEL_ERROR: 'Error al cancelar la cita',
  APPOINTMENT_COMPLETED: 'Cita marcada como completada',
  APPOINTMENT_COMPLETE_ERROR: 'Error al completar la cita',
  APPOINTMENTS_LOAD_ERROR: 'Error al cargar las citas',

  // Availability
  AVAILABILITY_DELETED: 'Disponibilidad eliminada correctamente',
  AVAILABILITIES_LOAD_ERROR: 'Error al cargar las disponibilidades del mes',
  CONFIG_AVAILABILITIES_LOAD_ERROR: 'Error al cargar las configuraciones',
};

/**
 * Mapeo de mensajes del backend (inglés) a español
 */
const backendMessages: Record<string, string> = {
  // Auth
  'Invalid credentials': 'Credenciales inválidas',
  'User not found': 'Usuario no encontrado',
  'User is inactive': 'El usuario está inactivo',
  'Token has expired': 'La sesión ha expirado',
  'Unauthorized access': 'Acceso no autorizado',
  'Forbidden access': 'Acceso prohibido',
  'Email not verified. Please check your inbox.': 'Email no verificado. Por favor revisá tu bandeja de entrada.',
  'Invalid or expired verification token': 'Token de verificación inválido o expirado',
  'Email is already verified': 'El email ya está verificado',
  'Verification email sent successfully': 'Email de verificación enviado exitosamente',

  // User
  'User with this email already exists': 'Ya existe un usuario con este email',
  'User created successfully': 'Usuario creado exitosamente',
  'Email verified': 'Email verificado',

  // Doctor
  'Doctor not found': 'Médico no encontrado',
  'Doctor is not active': 'El médico no está activo',
  'Doctor profile already exists for this user': 'Ya existe un perfil de médico para este usuario',
  'License number already exists': 'El número de matrícula ya existe',
  'Doctor does not have this specialty assigned': 'El médico no tiene esta especialidad asignada',
  'Specialty already assigned to this doctor': 'La especialidad ya está asignada a este médico',

  // Specialty
  'Specialty not found': 'Especialidad no encontrada',
  'Specialty already exists': 'La especialidad ya existe',

  // Availability
  'Availability not found': 'Disponibilidad no encontrada',
  'Availability overlaps with existing one': 'La disponibilidad se superpone con una existente',
  'Availability is already booked': 'La disponibilidad ya está reservada',
  'Availability has been cancelled': 'La disponibilidad ha sido cancelada',

  // Config Availability
  'Config availability not found': 'Configuración de disponibilidad no encontrada',
  'Config availability overlaps with existing one': 'La configuración de disponibilidad se superpone con una existente',

  // Appointment
  'Appointment not found': 'Turno no encontrado',
  'Appointment already exists for this availability': 'Ya existe un turno para esta disponibilidad',
  'Appointment has been cancelled': 'El turno ha sido cancelado',
  'Appointment cannot be cancelled at this time': 'El turno no puede ser cancelado en este momento',
  'Appointment has already been completed': 'El turno ya fue completado',
  'Only the doctor or an admin can complete an appointment': 'Solo el médico o un administrador puede completar un turno',

  // Validation
  'Validation error': 'Error de validación',
  'Invalid date range': 'Rango de fechas inválido',
  'Invalid time range': 'Rango de horarios inválido',
  'Past dates are not allowed': 'No se permiten fechas pasadas',

  // General
  'Internal server error': 'Error interno del servidor',
  'Resource not found': 'Recurso no encontrado',
  'Bad request': 'Solicitud inválida',
};

/**
 * Traduce un mensaje del backend a español
 * Si no encuentra traducción, devuelve el mensaje original
 */
export const translate = (message: string): string => {
  return backendMessages[message] || message;
};

/**
 * Extrae y traduce el mensaje de error de una respuesta de API
 */
export const getErrorMessage = (error: any, fallback = 'Ocurrió un error inesperado'): string => {
  const message = error?.response?.data?.message || error?.message || fallback;
  return translate(message);
};
