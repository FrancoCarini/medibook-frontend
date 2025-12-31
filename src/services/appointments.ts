import { apiService } from './api';
import type { Appointment, AppointmentStatus, AppointmentMode } from '../types';

export interface CreateAppointmentDto {
  availabilityId: string;
  patientId?: string; // Optional for PATIENT role (uses token), required for ADMIN/DOCTOR
}

export interface SearchAppointmentsDto {
  doctorId?: string;
  patientId?: string;
  mode?: AppointmentMode;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentsResponse {
  data: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const appointmentsService = {
  async create(data: CreateAppointmentDto): Promise<Appointment> {
    const response = await apiService.post<Appointment>('/appointments', data);
    return response;
  },

  async cancel(id: string): Promise<Appointment> {
    const response = await apiService.patch<Appointment>(`/appointments/${id}/cancel`);
    return response;
  },

  async search(params: SearchAppointmentsDto): Promise<AppointmentsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiService.get<AppointmentsResponse>(`/appointments?${queryParams.toString()}`);
    return response;
  },
};