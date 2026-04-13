import { apiService } from './api';
import type { Client, ClientDetail } from '../types';

export const clientsService = {
  async getAll(): Promise<Client[]> {
    const response = await apiService.get<Client[]>('/clients');
    return response;
  },

  async getBySlug(slug: string): Promise<ClientDetail> {
    const response = await apiService.get<ClientDetail>(`/clients/${slug}`);
    return response;
  },

  async create(data: { name: string; slug: string }): Promise<Client> {
    const response = await apiService.post<Client>('/clients', data);
    return response;
  },
};
