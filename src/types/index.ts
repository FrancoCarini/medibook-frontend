export enum AppointmentMode {
  IN_PERSON = 'IN_PERSON',
  VIRTUAL = 'VIRTUAL'
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED'
}

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  ONGOING = 'ONGOING'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  doctorId?: string; // Solo presente cuando role === 'DOCTOR'
  specialties?: Specialty[]; // Especialidades del doctor (solo cuando role === 'DOCTOR')
}

export interface Doctor {
  id: string;
  userId: string;
  licenseNumber: string;
  title: string;
  user?: User;
  specialties?: Specialty[];
}

export interface Specialty {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  id: string;
  doctorId: string;
  specialtyId: string;
  configId?: string;
  mode: AppointmentMode;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: AvailabilityStatus;
  createdAt: string;
  updatedAt: string;
  doctor?: Doctor;
  specialty?: Specialty;
  appointment?: Appointment | null;
}

export interface ConfigAvailability {
  id: string;
  doctorId: string;
  specialtyId: string;
  mode: AppointmentMode;
  startDate: string;
  endDate?: string;
  startHour: string;
  endHour: string;
  durationMinutes: number;
  daysOfWeek: number[];
  createdAt: string;
  updatedAt: string;
  doctor?: Doctor;
  specialty?: Specialty;
  availabilities?: Availability[];
}

export interface Appointment {
  id: string;
  availabilityId?: string;
  doctorId: string;
  patientId: string;
  mode: AppointmentMode;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  doctor?: Doctor;
  patient?: User;
  availability?: Availability;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  doctorData?: {
    licenseNumber: string;
    title: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchAvailabilityRequest {
  doctorId?: string;
  specialtyId?: string;
  startDate?: string;
  endDate?: string;
  mode?: AppointmentMode;
  status?: AvailabilityStatus;
  page?: number;
  pageSize?: number;
}