import { apiService } from './api';
import type { Doctor, User } from '../types';

export const usersService = {
  async getDoctors(): Promise<Doctor[]> {
    const response = await apiService.get<Doctor[]>('/users/doctors');
    return response;
  },

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
    doctorData?: {
      licenseNumber: string;
      title: string;
    };
  }): Promise<User> {
    const response = await apiService.post<User>('/users', userData);
    return response;
  },
};