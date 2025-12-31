export { apiService } from './api';
export { authService } from './auth';
export { usersService } from './users';
export { specialtiesService } from './specialties';
export { availabilitiesService } from './availabilities';
export { configAvailabilitiesService } from './configAvailabilities';
export { appointmentsService } from './appointments';

export type { CreateAvailabilityDto, UpdateAvailabilityDto, SearchAvailabilitiesParams } from './availabilities';
export type { CreateConfigAvailabilityDto, UpdateConfigAvailabilityDto } from './configAvailabilities';
export type { CreateAppointmentDto } from './appointments';