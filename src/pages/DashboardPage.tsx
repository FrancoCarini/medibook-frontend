import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Box,
  Chip,
  IconButton,
  Stack
} from '@mui/material';
import {
  LocalHospital,
  People,
  Assignment,
  BarChart,
  EventNote,
  Schedule,
  BookOnline,
  History,
  ExitToApp,
  Business,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { UserRole } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user?.role === UserRole.PATIENT) {
    return <Navigate to="/clients" replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getDashboardContent = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => navigate('/admin/users')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <People sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Gestión de Usuarios</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Administrar médicos y pacientes
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => navigate('/admin/specialties')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assignment sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Especialidades</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Configurar especialidades médicas
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => navigate('/admin/clients')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Business sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Clientes</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Gestionar clientes de la plataforma
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BarChart sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Reportes</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Ver estadísticas del sistema (próximamente)
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      case UserRole.CLIENT_ADMIN:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => navigate('/admin/users')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <People sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Gestión de Doctores</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Crear y administrar doctores
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => navigate('/admin/specialties')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assignment sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Especialidades</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Asignar especialidades a doctores
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      
      case UserRole.DOCTOR:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => navigate('/doctor-appointments')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EventNote sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Mis Citas</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Ver y gestionar citas programadas
                </Typography>
              </CardContent>
            </Card>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => navigate('/availability-management')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Schedule sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Disponibilidad</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Configurar horarios de atención
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      
      case UserRole.PATIENT:
        return (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => navigate('/book-appointment')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BookOnline sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Reservar Cita</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Buscar y reservar nuevas citas
                </Typography>
              </CardContent>
            </Card>
            <Card 
              sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
              onClick={() => navigate('/my-appointments')}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <History sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6">Mis Citas</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Ver historial de citas
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      
      default:
        return (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary">
                Rol no reconocido
              </Typography>
            </CardContent>
          </Card>
        );
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Administrador';
      case UserRole.CLIENT_ADMIN: return 'Admin. de Cliente';
      case UserRole.DOCTOR: return 'Médico';
      case UserRole.PATIENT: return 'Paciente';
      default: return role;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <LocalHospital sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Medibook
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Chip 
              label={getRoleLabel(user?.role!)} 
              size="small" 
              color="secondary" 
            />
            <IconButton color="inherit" onClick={handleLogout}>
              <ExitToApp />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Bienvenido, {user?.firstName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Panel de control - {getRoleLabel(user?.role!)}
          </Typography>
        </Box>
        
        {getDashboardContent()}
      </Container>
    </Box>
  );
};