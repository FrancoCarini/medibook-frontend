import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Link,
  Alert,
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { useUI } from '../contexts/UIContext';
import { authService } from '../services/auth';
import { MESSAGES } from '../utils/messages';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useUI();

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      showError(MESSAGES.PASSWORD_MIN_LENGTH);
      return;
    }

    if (password !== confirmPassword) {
      showError(MESSAGES.PASSWORDS_DONT_MATCH);
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token!, password);
      showSuccess(MESSAGES.PASSWORD_RESET_SUCCESS);
      navigate('/login');
    } catch (err: any) {
      showError(err.response?.data?.message || MESSAGES.RESET_PASSWORD_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
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
            </Box>
            <Alert severity="error" sx={{ mt: 2 }}>
              El enlace de restablecimiento es inválido. Solicitá uno nuevo.
            </Alert>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/forgot-password" underline="hover">
                Solicitar nuevo enlace
              </Link>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

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
              Elegí tu nueva contraseña
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Nueva contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar contraseña"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                <Link component={RouterLink} to="/login" underline="hover">
                  Volver a iniciar sesión
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
