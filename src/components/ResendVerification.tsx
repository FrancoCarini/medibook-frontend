import React, { useState } from 'react';
import { Alert, Box, Button, CircularProgress, TextField } from '@mui/material';
import { authService } from '../services/auth';
import { MESSAGES } from '../utils/messages';

interface ResendVerificationProps {
  /** Email already known (e.g. typed in the login form). When missing, the user types it. */
  email?: string;
  /** Clinic the request comes from, so the new link brings the patient back to it. */
  clientSlug?: string | null;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export const ResendVerification: React.FC<ResendVerificationProps> = ({ email, clientSlug }) => {
  const [typedEmail, setTypedEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const target = email ?? typedEmail;

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await authService.resendVerification(target, clientSlug ?? undefined);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        {MESSAGES.RESEND_VERIFICATION_SENT}
      </Alert>
    );
  }

  const sending = status === 'sending';

  return (
    <Box component="form" onSubmit={handleResend} sx={{ mt: 2 }}>
      {email === undefined && (
        <TextField
          required
          fullWidth
          type="email"
          label="Email"
          autoComplete="email"
          value={typedEmail}
          onChange={(e) => setTypedEmail(e.target.value)}
          disabled={sending}
          margin="normal"
        />
      )}
      {status === 'error' && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {MESSAGES.RESEND_VERIFICATION_ERROR}
        </Alert>
      )}
      <Button
        type="submit"
        fullWidth
        variant="outlined"
        sx={{ mt: 1 }}
        disabled={sending || !target}
        startIcon={sending && <CircularProgress size={20} />}
      >
        Reenviar mail de verificación
      </Button>
    </Box>
  );
};
