import { apiService } from './api';
import type { Specialty } from '../types';

export const doctorsService = {
  async getSpecialties(doctorId: string): Promise<Specialty[]> {
    const response = await apiService.get<Specialty[]>(`/doctors/${doctorId}/specialties`);
    return response;
  },

  async assignSpecialty(doctorId: string, specialtyId: string): Promise<void> {
    await apiService.post(`/doctors/${doctorId}/specialties`, { specialtyId });
  },

  async removeSpecialty(doctorId: string, specialtyId: string): Promise<void> {
    await apiService.delete(`/doctors/${doctorId}/specialties/${specialtyId}`);
  },
};
