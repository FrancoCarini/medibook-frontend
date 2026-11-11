import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { appointmentsService } from '../services/appointments';
import { availabilitiesService } from '../services/availabilities';
import type { Appointment, Availability } from '../types';
import { AvailabilityStatus } from '../types';
import { MESSAGES, getErrorMessage } from '../utils/messages';

interface RescheduleAppointmentModalProps {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  /** Recibe el turno con el horario nuevo */
  onRescheduled: (appointment: Appointment) => void;
}

const formatDay = (date: string) =>
  new Date(date).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

const formatShort = (date: string) => {
  const d = new Date(date);
  const day = d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${day} ${time}`;
};

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

const modeLabel = (mode: string) => (mode === 'IN_PERSON' ? 'Presencial' : 'Virtual');

/**
 * Elige otro horario libre del mismo profesional y especialidad (MB-24).
 */
export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  open,
  appointment,
  onClose,
  onRescheduled,
}) => {
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Availability | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    if (!appointment) return;
    setLoading(true);
    setSelected(null);
    try {
      const now = new Date();
      const results = await availabilitiesService.search({
        doctorId: appointment.doctorId,
        specialtyId: appointment.availability?.specialtyId,
        status: AvailabilityStatus.AVAILABLE,
        startDate: now.toISOString(),
        limit: 100,
      });
      // El search puede devolver horarios ya pasados del día: se descartan acá
      setSlots(
        results.filter(
          (slot) => new Date(slot.startTime) > now && slot.id !== appointment.availabilityId,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err, MESSAGES.RESCHEDULE_SLOTS_LOAD_ERROR));
    } finally {
      setLoading(false);
    }
  }, [appointment]);

  useEffect(() => {
    if (open) {
      setError(null);
      loadSlots();
    }
  }, [open, loadSlots]);

  const slotsByDay = useMemo(() => {
    const groups = new Map<string, Availability[]>();
    [...slots]
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .forEach((slot) => {
        const day = formatDay(slot.startTime);
        groups.set(day, [...(groups.get(day) ?? []), slot]);
      });
    return Array.from(groups.entries());
  }, [slots]);

  const handleConfirm = async () => {
    if (!appointment || !selected) return;
    setSaving(true);
    setError(null);
    try {
      await appointmentsService.reschedule(appointment.id, selected.id);
      onRescheduled({
        ...appointment,
        availabilityId: selected.id,
        startTime: selected.startTime,
        endTime: selected.endTime,
        mode: selected.mode,
      });
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError(MESSAGES.RESCHEDULE_SLOT_TAKEN);
        loadSlots();
      } else {
        setError(getErrorMessage(err, MESSAGES.APPOINTMENT_RESCHEDULE_ERROR));
      }
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Reprogramar turno</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Turno actual: {formatShort(appointment.startTime)} · {modeLabel(appointment.mode)}
            {appointment.availability?.specialty?.name
              ? ` · ${appointment.availability.specialty.name}`
              : ''}
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress aria-label="Cargando horarios" />
            </Box>
          ) : slotsByDay.length === 0 ? (
            <Alert severity="info">
              No hay otros horarios disponibles con este profesional por ahora.
            </Alert>
          ) : (
            slotsByDay.map(([day, daySlots]) => (
              <Box key={day}>
                <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', mb: 1 }}>
                  {day}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {daySlots.map((slot) => (
                    <Chip
                      key={slot.id}
                      label={`${formatTime(slot.startTime)} · ${modeLabel(slot.mode)}`}
                      color={selected?.id === slot.id ? 'primary' : 'default'}
                      variant={selected?.id === slot.id ? 'filled' : 'outlined'}
                      onClick={() => setSelected(slot)}
                    />
                  ))}
                </Box>
              </Box>
            ))
          )}

          {selected && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <Typography sx={{ textDecoration: 'line-through' }} color="text.secondary">
                  {formatShort(appointment.startTime)}
                </Typography>
                <ArrowForward fontSize="small" />
                <Typography fontWeight="bold">
                  {formatShort(selected.startTime)} · {modeLabel(selected.mode)}
                </Typography>
              </Box>
            </Paper>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Volver
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!selected || saving}>
          {saving ? 'Reprogramando…' : 'Confirmar nuevo horario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
