import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { showError } = useUI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      showError(err.response?.data?.message || MESSAGES.FORGOT_PASSWORD_ERROR);
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
              Recuperá tu contraseña
            </Typography>
          </Box>

          {submitted ? (
            <Box sx={{ mt: 3 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                {MESSAGES.FORGOT_PASSWORD_SENT}
              </Alert>
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" underline="hover">
                  Volver a iniciar sesión
                </Link>
              </Box>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
              </Typography>

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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
                startIcon={isLoading && <CircularProgress size={20} />}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  <Link component={RouterLink} to="/login" underline="hover">
                    Volver a iniciar sesión
                  </Link>
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};
