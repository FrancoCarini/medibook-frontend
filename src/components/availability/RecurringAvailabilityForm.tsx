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
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { configAvailabilitiesService } from '../../services/configAvailabilities';
import type { CreateConfigAvailabilityDto } from '../../services/configAvailabilities';
import { AppointmentMode } from '../../types';
import type { Specialty } from '../../types';

interface RecurringAvailabilityFormProps {
  specialties: Specialty[];
  onConfigAvailabilityCreated: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' }
];

export const RecurringAvailabilityForm: React.FC<RecurringAvailabilityFormProps> = ({
  specialties,
  onConfigAvailabilityCreated
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    specialtyId: '',
    mode: AppointmentMode.IN_PERSON,
    startDate: null as Date | null,
    endDate: null as Date | null,
    startHour: null as Date | null,
    endHour: null as Date | null,
    durationMinutes: 30,
    daysOfWeek: [] as number[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.startDate || !formData.startHour || !formData.endHour || 
        !formData.specialtyId || formData.daysOfWeek.length === 0) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    if (formData.startHour >= formData.endHour) {
      setError('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    if (formData.endDate && formData.startDate >= formData.endDate) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    if (!user?.doctorId) {
      setError('Error: No se encontró el ID del médico');
      return;
    }

    try {
      setLoading(true);

      // Format hours as HH:mm strings
      const startHour = `${formData.startHour.getHours().toString().padStart(2, '0')}:${formData.startHour.getMinutes().toString().padStart(2, '0')}`;
      const endHour = `${formData.endHour.getHours().toString().padStart(2, '0')}:${formData.endHour.getMinutes().toString().padStart(2, '0')}`;

      const createData: CreateConfigAvailabilityDto = {
        doctorId: user.doctorId,
        specialtyId: formData.specialtyId,
        mode: formData.mode,
        startDate: formData.startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        endDate: formData.endDate ? formData.endDate.toISOString().split('T')[0] : undefined,
        startHour,
        endHour,
        durationMinutes: formData.durationMinutes,
        daysOfWeek: formData.daysOfWeek
      };

      await configAvailabilitiesService.create(createData);
      
      setSuccess('Plantilla de disponibilidad creada exitosamente');
      setFormData({
        specialtyId: '',
        mode: AppointmentMode.IN_PERSON,
        startDate: null,
        endDate: null,
        startHour: null,
        endHour: null,
        durationMinutes: 30,
        daysOfWeek: []
      });
      
      onConfigAvailabilityCreated();
    } catch (error: any) {
      setError(error.message || 'Error al crear la plantilla de disponibilidad');
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

  const handleDayToggle = (dayValue: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayValue)
        ? prev.daysOfWeek.filter(day => day !== dayValue)
        : [...prev.daysOfWeek, dayValue].sort()
    }));
    setError(null);
    setSuccess(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6" gutterBottom>
            Crear Plantilla Recurrente
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Configura disponibilidad que se repite automáticamente
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
            <DatePicker
              label="Fecha de inicio *"
              value={formData.startDate}
              onChange={(value) => handleInputChange('startDate', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
              minDate={new Date()}
            />
            <DatePicker
              label="Fecha de fin (opcional)"
              value={formData.endDate}
              onChange={(value) => handleInputChange('endDate', value)}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
              minDate={formData.startDate || new Date()}
            />
          </Box>

          <Box display="flex" gap={2}>
            <TimePicker
              label="Hora de inicio *"
              value={formData.startHour}
              onChange={(value) => handleInputChange('startHour', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
            <TimePicker
              label="Hora de fin *"
              value={formData.endHour}
              onChange={(value) => handleInputChange('endHour', value)}
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

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Días de la semana *
            </Typography>
            <FormGroup row>
              {DAYS_OF_WEEK.map((day) => (
                <FormControlLabel
                  key={day.value}
                  control={
                    <Checkbox
                      checked={formData.daysOfWeek.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                    />
                  }
                  label={day.label}
                />
              ))}
            </FormGroup>
            {formData.daysOfWeek.length === 0 && (
              <Typography variant="caption" color="error">
                Selecciona al menos un día
              </Typography>
            )}
          </Box>

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
                Creando Plantilla...
              </>
            ) : (
              'Crear Plantilla Recurrente'
            )}
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
};