import { apiService } from './api';
import type { Availability, AppointmentMode, AvailabilityStatus } from '../types';

export interface CreateAvailabilityDto {
  doctorId: string;
  specialtyId: string;
  mode: AppointmentMode;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface UpdateAvailabilityDto {
  doctorId?: string;
  specialtyId?: string;
  mode?: AppointmentMode;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  status?: AvailabilityStatus;
}

export interface SearchAvailabilitiesParams {
  doctorId?: string;
  specialtyId?: string;
  mode?: AppointmentMode;
  startDate?: string;
  endDate?: string;
  all?: boolean;
}

export const availabilitiesService = {
  async create(data: CreateAvailabilityDto): Promise<Availability> {
    const response = await apiService.post<Availability>('/availabilities', data);
    return response;
  },

  async search(params: SearchAvailabilitiesParams): Promise<Availability[]> {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString());
      }
    });

    const response = await apiService.get<{ data: Availability[], pagination: any }>(`/availabilities/search?${queryString}`);
    return response.data;
  },

  async getById(id: string): Promise<Availability> {
    const response = await apiService.get<Availability>(`/availabilities/${id}`);
    return response;
  },

  async update(id: string, data: UpdateAvailabilityDto): Promise<Availability> {
    const response = await apiService.patch<Availability>(`/availabilities/${id}`, data);
    return response;
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/availabilities/${id}`);
  },
};