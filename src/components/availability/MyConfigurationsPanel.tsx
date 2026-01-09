import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import {
  Delete,
  LocationOn,
  VideoCall
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { configAvailabilitiesService } from '../../services/configAvailabilities';
import type { ConfigAvailability, AppointmentMode } from '../../types';

interface MyConfigurationsPanelProps {
  configAvailabilities: ConfigAvailability[];
  onUpdate: () => void;
}

export const MyConfigurationsPanel: React.FC<MyConfigurationsPanelProps> = ({
  configAvailabilities,
  onUpdate
}) => {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    title: string;
    appointmentsCount: number;
  }>({
    open: false,
    id: '',
    title: '',
    appointmentsCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await configAvailabilitiesService.delete(deleteDialog.id);
      onUpdate();
      setDeleteDialog({ open: false, id: '', title: '', appointmentsCount: 0 });
    } catch (error: any) {
      setError(error.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getModeIcon = (mode: AppointmentMode) => {
    return mode === 'VIRTUAL' ? <VideoCall fontSize="small" /> : <LocationOn fontSize="small" />;
  };

  const getModeLabel = (mode: AppointmentMode) => {
    return mode === 'VIRTUAL' ? 'Virtual' : 'Presencial';
  };

  const getDayNames = (daysOfWeek: number[]) => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return daysOfWeek.map(day => dayNames[day === 7 ? 0 : day]).join(', ');
  };

  const openDeleteDialog = async (id: string, title: string) => {
    setDeleteDialog({ open: true, id, title, appointmentsCount: 0 });
    setError(null);
    setLoadingCount(true);
    try {
      const { count } = await configAvailabilitiesService.getAppointmentsCount(id);
      setDeleteDialog(prev => ({ ...prev, appointmentsCount: count }));
    } catch {
      // Si falla, continuamos sin el count
    } finally {
      setLoadingCount(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Agendas Recurrentes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {configAvailabilities.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={3}>
          No tienes agendas recurrentes configuradas
        </Typography>
      ) : (
        <List disablePadding>
          {configAvailabilities.map((config) => (
            <ListItem
              key={config.id}
              divider
              sx={{ px: 0 }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    {getModeIcon(config.mode)}
                    <Typography variant="subtitle2">
                      {config.specialty?.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={getModeLabel(config.mode)}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Días: {getDayNames(config.daysOfWeek)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Horario: {formatTime(config.startHour)} - {formatTime(config.endHour)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Desde: {formatDate(config.startDate)}
                      {config.endDate && ` hasta ${formatDate(config.endDate)}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duración: {config.durationMinutes} min por turno
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => openDeleteDialog(
                    config.id,
                    `${config.specialty?.name}`
                  )}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: '', title: '', appointmentsCount: 0 })}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que deseas eliminar esta agenda recurrente?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {deleteDialog.title}
          </Typography>
          {loadingCount ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Verificando turnos...
            </Typography>
          ) : deleteDialog.appointmentsCount > 0 ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              Esta agenda tiene {deleteDialog.appointmentsCount} turno{deleteDialog.appointmentsCount > 1 ? 's' : ''} reservado{deleteDialog.appointmentsCount > 1 ? 's' : ''}.
              Al eliminarla, se cancelarán todos los turnos y se eliminarán las disponibilidades asociadas.
            </Alert>
          ) : (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Esta acción eliminará todas las disponibilidades asociadas a esta agenda.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: '', title: '', appointmentsCount: 0 })}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};