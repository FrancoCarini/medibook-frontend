import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Link,
  Alert
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { clientsService } from '../services/clients';
import { MESSAGES } from '../utils/messages';
import type { ClientDetail } from '../types';

export const ClientLoginPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [clientError, setClientError] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    const loadClient = async () => {
      if (!slug) return;
      try {
        const data = await clientsService.getBySlug(slug);
        setClient(data);
      } catch {
        setClientError(true);
      } finally {
        setLoadingClient(false);
      }
    };
    loadClient();
  }, [slug]);

  if (isAuthenticated && slug) {
    return <Navigate to={`/${slug}/book-appointment`} replace />;
  }

  if (loadingClient) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (clientError || !client) {
    return (
      <Container component="main" maxWidth="xs">
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            Cliente no encontrado. Verificá la URL e intentá nuevamente.
          </Alert>
          <Button
            component={RouterLink}
            to="/login"
            variant="text"
            sx={{ mt: 2 }}
          >
            Ir al login general
          </Button>
        </Box>
      </Container>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      showSuccess(MESSAGES.WELCOME);
      navigate(`/${slug}/book-appointment`);
    } catch (err: any) {
      showError(err.response?.data?.message || MESSAGES.LOGIN_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              {client.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Iniciá sesión para reservar tu turno
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ¿No tenés cuenta?{' '}
                <Link component={RouterLink} to={`/register?client=${slug}`} underline="hover">
                  Registrate
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
