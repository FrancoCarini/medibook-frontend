import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  Person,
  AccessTime,
  MedicalServices,
  CalendarMonth,
  LocationOn,
  VideoCameraFront
} from '@mui/icons-material';
import type { Availability } from '../types';

interface AppointmentConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  availability: Availability | null;
  loading?: boolean;
}

export const AppointmentConfirmationModal: React.FC<AppointmentConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  availability,
  loading = false
}) => {
  if (!availability) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    let dayName = '';
    if (date.toDateString() === today.toDateString()) {
      dayName = 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dayName = 'Mañana';
    } else {
      dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
    }
    
    const dateStr = date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
    
    return `${dayName}, ${dateStr}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Confirmar Reserva de Cita
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Por favor revise los detalles de su cita antes de confirmar
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ py: 2 }}>
        <Paper 
          variant="outlined" 
          sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}
        >
          <Stack spacing={2.5}>
            {/* Doctor */}
            <Box display="flex" alignItems="center">
              <Person sx={{ mr: 2, fontSize: 24, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {availability.doctor?.user?.firstName} {availability.doctor?.user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {availability.doctor?.title} - Lic. {availability.doctor?.licenseNumber}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Specialty */}
            <Box display="flex" alignItems="center">
              <MedicalServices sx={{ mr: 2, fontSize: 24, color: 'primary.main' }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {availability.specialty?.name}
              </Typography>
            </Box>

            {/* Date */}
            <Box display="flex" alignItems="center">
              <CalendarMonth sx={{ mr: 2, fontSize: 24, color: 'primary.main' }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formatDate(availability.startTime)}
              </Typography>
            </Box>

            {/* Time */}
            <Box display="flex" alignItems="center">
              <AccessTime sx={{ mr: 2, fontSize: 24, color: 'primary.main' }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duración: {availability.durationMinutes} minutos
                </Typography>
              </Box>
            </Box>

            {/* Mode */}
            <Box display="flex" alignItems="center">
              {availability.mode === 'IN_PERSON' ? (
                <LocationOn sx={{ mr: 2, fontSize: 24, color: 'primary.main' }} />
              ) : (
                <VideoCameraFront sx={{ mr: 2, fontSize: 24, color: 'secondary.main' }} />
              )}
              <Chip 
                label={availability.mode === 'IN_PERSON' ? 'Consulta Presencial' : 'Consulta Virtual'}
                color={availability.mode === 'IN_PERSON' ? 'primary' : 'secondary'}
                variant="filled"
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Stack>
        </Paper>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            * Al confirmar, se reservará automáticamente su cita. Recibirá un correo de confirmación con los detalles.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ minWidth: 120 }}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          size="large"
          sx={{ minWidth: 120 }}
          disabled={loading}
        >
          {loading ? 'Reservando...' : 'Confirmar Reserva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};