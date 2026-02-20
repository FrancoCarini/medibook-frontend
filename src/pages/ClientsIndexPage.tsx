import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  CardActionArea,
  Box,
  IconButton,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import {
  LocalHospital,
  ExitToApp,
  Business
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useNavigate } from 'react-router-dom';
import { clientsService } from '../services/clients';
import { patientsService } from '../services/patients';
import type { Client } from '../types';

export const ClientsIndexPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showError } = useUI();
  const navigate = useNavigate();

  const [myClients, setMyClients] = useState<Client[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [my, all] = await Promise.all([
          patientsService.getMyClients(),
          clientsService.getAll(),
        ]);
        setMyClients(my);
        setAllClients(all);
      } catch (error) {
        console.error('Error loading clients:', error);
        showError('Error al cargar las clínicas');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const myClientIds = new Set(myClients.map((c) => c.id));
  const exploreClients = allClients.filter((c) => !myClientIds.has(c.id));

  const ClientCard = ({ client }: { client: Client }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardActionArea onClick={() => navigate(`/${client.slug}/book-appointment`)}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Business sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h6">{client.name}</Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );

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
            Bienvenido, {user?.firstName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Elegí una clínica para reservar tu turno
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {myClients.length > 0 && (
              <Box mb={4}>
                <Typography variant="h5" gutterBottom>
                  Mis clínicas
                </Typography>
                <Grid container spacing={3}>
                  {myClients.map((client) => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </Grid>
              </Box>
            )}

            {exploreClients.length > 0 && (
              <Box mb={4}>
                <Typography variant="h5" gutterBottom>
                  Explorar clínicas
                </Typography>
                <Grid container spacing={3}>
                  {exploreClients.map((client) => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </Grid>
              </Box>
            )}

            {myClients.length === 0 && exploreClients.length === 0 && (
              <Alert severity="info">
                No hay clínicas disponibles en este momento.
              </Alert>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};
