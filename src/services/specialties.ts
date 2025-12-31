import { apiService } from './api';
import type { Specialty, Doctor } from '../types';

export const specialtiesService = {
  async getSpecialties(): Promise<Specialty[]> {
    const response = await apiService.get<Specialty[]>('/specialties');
    return response;
  },

  async createSpecialty(data: { name: string }): Promise<Specialty> {
    const response = await apiService.post<Specialty>('/specialties', data);
    return response;
  },

  async getDoctorsBySpecialty(specialtyId: string): Promise<Doctor[]> {
    const response = await apiService.get<Doctor[]>(`/specialties/${specialtyId}/doctors`);
    return response;
  },
};