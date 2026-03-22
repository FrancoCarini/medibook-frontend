import React, { useState } from 'react';
import { Navigate, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Link
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { UserRole } from '../types';
import { MESSAGES } from '../utils/messages';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const { showError, showSuccess } = useUI();
  const navigate = useNavigate();

  if (isAuthenticated) {
    if (user?.role === UserRole.PATIENT) {
      return <Navigate to="/clients" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      showSuccess(MESSAGES.WELCOME);
      // login updates user in context; read from localStorage for immediate redirect
      const savedUser = localStorage.getItem('user');
      const loggedUser = savedUser ? JSON.parse(savedUser) : null;
      if (loggedUser?.role === UserRole.PATIENT) {
        navigate('/clients');
      } else {
        navigate('/dashboard');
      }
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
              Medibook
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Inicia sesión en tu cuenta
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/forgot-password" underline="hover">
                  ¿Olvidaste tu contraseña?
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ¿No tenés cuenta?{' '}
                <Link component={RouterLink} to="/register" underline="hover">
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