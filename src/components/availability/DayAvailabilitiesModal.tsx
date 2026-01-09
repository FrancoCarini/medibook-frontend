import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Delete,
  Add,
  LocationOn,
  VideoCall,
  AccessTime,
  Warning
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { availabilitiesService } from '../../services/availabilities';
import { useUI } from '../../contexts/UIContext';
import type { Availability, AppointmentMode, AvailabilityStatus } from '../../types';

interface DayAvailabilitiesModalProps {
  open: boolean;
  date: Date | null;
  availabilities: Availability[];
  onClose: () => void;
  onAvailabilityDeleted: (deletedId: string) => void;
  onAddAvailability: (date: Date) => void;
}

export const DayAvailabilitiesModal: React.FC<DayAvailabilitiesModalProps> = ({
  open,
  date,
  availabilities,
  onClose,
  onAvailabilityDeleted,
  onAddAvailability
}) => {
  const { showSuccess } = useUI();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (availabilityId: string) => {
    setConfirmDeleteId(availabilityId);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;

    try {
      setLoading(confirmDeleteId);
      setError(null);
      setConfirmDeleteId(null);
      await availabilitiesService.delete(confirmDeleteId);
      showSuccess('Disponibilidad eliminada correctamente');
      onAvailabilityDeleted(confirmDeleteId);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la disponibilidad');
    } finally {
      setLoading(null);
    }
  };

  const availabilityToDelete = confirmDeleteId
    ? availabilities.find(a => a.id === confirmDeleteId)
    : null;

  const getModeIcon = (mode: AppointmentMode) => {
    return mode === 'VIRTUAL' ? <VideoCall fontSize="small" /> : <LocationOn fontSize="small" />;
  };

  const getModeLabel = (mode: AppointmentMode) => {
    return mode === 'VIRTUAL' ? 'Virtual' : 'Presencial';
  };

  const getStatusColor = (status: AvailabilityStatus): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'BOOKED': return 'primary';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: AvailabilityStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible';
      case 'BOOKED': return 'Reservado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: es });
  };

  const sortedAvailabilities = [...availabilities].sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Disponibilidades del {date && format(date, "EEEE d 'de' MMMM", { locale: es })}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {sortedAvailabilities.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>
            No hay disponibilidades para este día
          </Typography>
        ) : (
          <List disablePadding>
            {sortedAvailabilities.map((availability) => (
              <ListItem
                key={availability.id}
                divider
                sx={{
                  px: 1,
                  bgcolor: availability.configId ? 'primary.50' : 'success.50',
                  borderLeft: 4,
                  borderLeftColor: availability.configId ? 'primary.main' : 'success.main',
                  mb: 1,
                  borderRadius: 1
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                      </Typography>
                      <Chip
                        size="small"
                        label={getStatusLabel(availability.status)}
                        color={getStatusColor(availability.status)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box mt={0.5}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        {getModeIcon(availability.mode)}
                        <Typography variant="body2" color="text.secondary">
                          {availability.specialty?.name} - {getModeLabel(availability.mode)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Duración: {availability.durationMinutes} min
                        {availability.configId && (
                          <Chip
                            size="small"
                            label="Agenda recurrente"
                            variant="outlined"
                            color="primary"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {loading === availability.id ? (
                    <CircularProgress size={24} />
                  ) : (
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteClick(availability.id)}
                      color="error"
                      disabled={loading !== null}
                      title="Eliminar disponibilidad"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
        <Button
          startIcon={<Add />}
          onClick={() => date && onAddAvailability(date)}
          color="primary"
        >
          Agregar disponibilidad
        </Button>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDeleteId !== null}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar esta disponibilidad?
          </DialogContentText>
          {availabilityToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Horario:</strong> {formatTime(availabilityToDelete.startTime)} - {formatTime(availabilityToDelete.endTime)}
              </Typography>
              <Typography variant="body2">
                <strong>Especialidad:</strong> {availabilityToDelete.specialty?.name}
              </Typography>
              <Typography variant="body2">
                <strong>Modalidad:</strong> {getModeLabel(availabilityToDelete.mode)}
              </Typography>
            </Box>
          )}
          {availabilityToDelete?.appointment && (
            <Alert
              severity="warning"
              icon={<Warning />}
              sx={{ mt: 2 }}
            >
              <Typography variant="body2" fontWeight="bold">
                Esta disponibilidad tiene un turno reservado
              </Typography>
              <Typography variant="body2">
                Al eliminarla, el turno también será cancelado.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};
