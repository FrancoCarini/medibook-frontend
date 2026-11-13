import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Link,
  Alert,
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { authService } from '../services/auth';
import { MESSAGES, translate } from '../utils/messages';
import { ResendVerification } from '../components/ResendVerification';

type Status = 'loading' | 'success' | 'already' | 'error';

const ALREADY_VERIFIED = translate('Email is already verified');

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const clientSlug = searchParams.get('client');
  const loginPath = clientSlug ? `/${clientSlug}` : '/login';

  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error');
  // StrictMode runs effects twice in dev; the token is single-use, so call once.
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setStatus(err.response?.data?.message === ALREADY_VERIFIED ? 'already' : 'error');
      });
  }, [token]);

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              Medibook
            </Typography>
          </Box>

          {status === 'loading' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {MESSAGES.VERIFY_EMAIL_LOADING}
              </Typography>
            </Box>
          )}

          {(status === 'success' || status === 'already') && (
            <>
              <Alert severity="success" sx={{ mt: 2 }}>
                {status === 'success' ? MESSAGES.VERIFY_EMAIL_SUCCESS : MESSAGES.VERIFY_EMAIL_ALREADY}
              </Alert>
              <Button component={RouterLink} to={loginPath} fullWidth variant="contained" sx={{ mt: 3 }}>
                Iniciar sesión
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert severity="error" sx={{ mt: 2 }}>
                {MESSAGES.VERIFY_EMAIL_INVALID}
              </Alert>
              <ResendVerification clientSlug={clientSlug} />
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link component={RouterLink} to={loginPath} underline="hover">
                  Volver a iniciar sesión
                </Link>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};
