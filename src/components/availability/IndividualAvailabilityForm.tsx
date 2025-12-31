import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { availabilitiesService } from '../../services/availabilities';
import type { CreateAvailabilityDto } from '../../services/availabilities';
import { AppointmentMode } from '../../types';
import type { Specialty } from '../../types';

interface IndividualAvailabilityFormProps {
  selectedDate: Date | null;
  specialties: Specialty[];
  onAvailabilityCreated: () => void;
}

export const IndividualAvailabilityForm: React.FC<IndividualAvailabilityFormProps> = ({
  selectedDate,
  specialties,
  onAvailabilityCreated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    specialtyId: '',
    mode: AppointmentMode.IN_PERSON,
    startTime: null as Date | null,
    endTime: null as Date | null,
    durationMinutes: 30
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedDate || !formData.startTime || !formData.endTime || !formData.specialtyId) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    if (!user?.doctorId) {
      setError('Error: No se encontró el ID del médico');
      return;
    }

    try {
      setLoading(true);

      // Create start and end datetime
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(formData.startTime.getHours(), formData.startTime.getMinutes(), 0, 0);

      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(formData.endTime.getHours(), formData.endTime.getMinutes(), 0, 0);

      const createData: CreateAvailabilityDto = {
        doctorId: user.doctorId,
        specialtyId: formData.specialtyId,
        mode: formData.mode,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        durationMinutes: formData.durationMinutes
      };

      await availabilitiesService.create(createData);
      
      setSuccess('Disponibilidad creada exitosamente');
      setFormData({
        specialtyId: '',
        mode: AppointmentMode.IN_PERSON,
        startTime: null,
        endTime: null,
        durationMinutes: 30
      });
      
      onAvailabilityCreated();
    } catch (error: any) {
      setError(error.message || 'Error al crear la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  if (!selectedDate) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary" textAlign="center">
            Selecciona un día en el calendario para agregar disponibilidad
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6" gutterBottom>
            Agregar Disponibilidad
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {selectedDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>

          <Divider />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <FormControl fullWidth required>
            <InputLabel>Especialidad</InputLabel>
            <Select
              value={formData.specialtyId}
              onChange={(e) => handleInputChange('specialtyId', e.target.value)}
              label="Especialidad"
            >
              {specialties.map((specialty) => (
                <MenuItem key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Modalidad</InputLabel>
            <Select
              value={formData.mode}
              onChange={(e) => handleInputChange('mode', e.target.value)}
              label="Modalidad"
            >
              <MenuItem value={AppointmentMode.IN_PERSON}>Presencial</MenuItem>
              <MenuItem value={AppointmentMode.VIRTUAL}>Virtual</MenuItem>
            </Select>
          </FormControl>

          <Box display="flex" gap={2}>
            <TimePicker
              label="Hora de inicio"
              value={formData.startTime}
              onChange={(value) => handleInputChange('startTime', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
            <TimePicker
              label="Hora de fin"
              value={formData.endTime}
              onChange={(value) => handleInputChange('endTime', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
          </Box>

          <TextField
            fullWidth
            type="number"
            label="Duración por cita (minutos)"
            value={formData.durationMinutes}
            onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value))}
            inputProps={{ min: 15, max: 120, step: 15 }}
            helperText="Duración de cada slot de cita"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Creando...
              </>
            ) : (
              'Crear Disponibilidad'
            )}
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
};