import type { LoginRequest, LoginResponse, User } from '../types';
import { UserRole } from '../types';

// Mock users para testing
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@medibook.com',
    firstName: 'Admin',
    lastName: 'Sistema',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'doctor@medibook.com', 
    firstName: 'Dr. Juan',
    lastName: 'Pérez',
    role: UserRole.DOCTOR,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'patient@medibook.com',
    firstName: 'María',
    lastName: 'García',
    role: UserRole.PATIENT,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockAuthService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user || credentials.password !== '123456') {
      throw new Error('Credenciales inválidas');
    }
    
    return {
      accessToken: 'mock-access-token-' + user.id,
      refreshToken: 'mock-refresh-token-' + user.id,
      user,
    };
  },

  async refresh(): Promise<{ accessToken: string }> {
    return {
      accessToken: 'mock-refreshed-token',
    };
  },

  async logout(): Promise<void> {
    // Mock logout
    await new Promise(resolve => setTimeout(resolve, 200));
  },
};