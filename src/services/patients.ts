import { apiService } from './api';
import type { Client } from '../types';

export const patientsService = {
  async getMyClients(): Promise<Client[]> {
    const response = await apiService.get<Client[]>('/patients/my-clients');
    return response;
  },
};
