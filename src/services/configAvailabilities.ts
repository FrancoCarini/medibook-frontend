import { apiService } from './api';
import type { ConfigAvailability, AppointmentMode } from '../types';

export interface CreateConfigAvailabilityDto {
  doctorId: string;
  specialtyId: string;
  mode: AppointmentMode;
  startDate: string;
  endDate?: string;
  startHour: string;
  endHour: string;
  durationMinutes: number;
  daysOfWeek: number[];
}

export interface UpdateConfigAvailabilityDto {
  doctorId?: string;
  specialtyId?: string;
  mode?: AppointmentMode;
  startDate?: string;
  endDate?: string;
  startHour?: string;
  endHour?: string;
  durationMinutes?: number;
  daysOfWeek?: number[];
}

export const configAvailabilitiesService = {
  async create(data: CreateConfigAvailabilityDto): Promise<ConfigAvailability> {
    const response = await apiService.post<ConfigAvailability>('/config-availabilities', data);
    return response;
  },

  async getAll(): Promise<ConfigAvailability[]> {
    const response = await apiService.get<ConfigAvailability[]>('/config-availabilities');
    return response;
  },

  async getById(id: string): Promise<ConfigAvailability> {
    const response = await apiService.get<ConfigAvailability>(`/config-availabilities/${id}`);
    return response;
  },

  async update(id: string, data: UpdateConfigAvailabilityDto): Promise<ConfigAvailability> {
    const response = await apiService.patch<ConfigAvailability>(`/config-availabilities/${id}`, data);
    return response;
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/config-availabilities/${id}`);
  },

  async getAppointmentsCount(id: string): Promise<{ count: number }> {
    const response = await apiService.get<{ count: number }>(`/config-availabilities/${id}/appointments-count`);
    return response;
  },
};