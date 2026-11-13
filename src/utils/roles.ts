import { UserRole } from '../types';

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN: return 'Administrador';
    case UserRole.CLIENT_ADMIN: return 'Admin. de Cliente';
    case UserRole.DOCTOR: return 'Médico';
    case UserRole.PATIENT: return 'Paciente';
    default: return role;
  }
};
