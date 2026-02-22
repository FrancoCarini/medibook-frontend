import React, { useState, useEffect } from 'react';
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
  Stack,
  CircularProgress
} from '@mui/material';
import {
  LocalHospital,
  ArrowBack,
  BookOnline,
  History,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsService } from '../services/clients';
import type { ClientDetail } from '../types';

export const ClientHomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    clientsService.getBySlug(slug)
      .then(setClient)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => navigate('/clients')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <LocalHospital sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {client?.name || 'Cargando...'}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Chip label="Paciente" size="small" color="secondary" />
            <IconButton color="inherit" onClick={handleLogout}>
              <ExitToApp />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            {client?.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Elegí una opción para continuar
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
          <Card
            sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
            onClick={() => navigate(`/${slug}/book-appointment`)}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BookOnline sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Reservar Turno</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Buscar y reservar nuevos turnos
              </Typography>
            </CardContent>
          </Card>
          <Card
            sx={{ cursor: 'pointer', '&:hover': { elevation: 4 } }}
            onClick={() => navigate(`/${slug}/my-appointments`)}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <History sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Mis Turnos</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Ver turnos reservados y historial
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};
