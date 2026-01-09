import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Box,
  Button,
  IconButton,
  Stack,
  Chip,
  Alert,
  Grid,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  LocalHospital,
  ArrowBack,
  CalendarMonth,
  Person,
  AccessTime,
  Cancel,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useNavigate } from 'react-router-dom';
import { appointmentsService } from '../services/appointments';
import type { Appointment } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointments-tabpanel-${index}`}
      aria-labelledby={`appointments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

export const MyAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useUI();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointmentId: string | null }>({
    open: false,
    appointmentId: null
  });

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getYesterdayDateString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      // Cargar próximas citas (de hoy en adelante)
      const upcomingResponse = await appointmentsService.search({
        startDate: today,
        limit: 100
      });
      setUpcomingAppointments(upcomingResponse.data);

      // Cargar historial (antes de hoy)
      const pastResponse = await appointmentsService.search({
        endDate: yesterday,
        limit: 100
      });
      setPastAppointments(pastResponse.data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      showError('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.cancel(appointmentId);

      // Actualizar la lista de próximas citas
      setUpcomingAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: 'CANCELLED' as const }
            : apt
        )
      );

      setCancelDialog({ open: false, appointmentId: null });
      showSuccess('Cita cancelada exitosamente');
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      showError('Error al cancelar la cita');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BOOKED': return 'success';
      case 'COMPLETED': return 'primary';
      case 'CANCELLED': return 'error';
      case 'ONGOING': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'BOOKED': return 'Confirmada';
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      case 'ONGOING': return 'En curso';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDoctorName = (appointment: Appointment) => {
    if (appointment.doctor?.user) {
      const { title } = appointment.doctor;
      const { firstName, lastName } = appointment.doctor.user;
      return `${title || ''} ${firstName} ${lastName}`.trim();
    }
    return 'Doctor no disponible';
  };

  const getSpecialtyName = (appointment: Appointment) => {
    return appointment.availability?.specialty?.name || 'Especialidad no disponible';
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Grid item xs={12} md={6} key={appointment.id}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {getDoctorName(appointment)}
                </Typography>
              </Box>
              <Chip
                label={getStatusLabel(appointment.status)}
                color={getStatusColor(appointment.status)}
                size="small"
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              {getSpecialtyName(appointment)}
            </Typography>

            <Box display="flex" alignItems="center">
              <CalendarMonth sx={{ mr: 1 }} />
              <Typography variant="body2">
                {formatDate(appointment.startTime)}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center">
              <AccessTime sx={{ mr: 1 }} />
              <Typography variant="body2">
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Chip
                label={appointment.mode === 'IN_PERSON' ? 'Presencial' : 'Virtual'}
                color={appointment.mode === 'IN_PERSON' ? 'primary' : 'secondary'}
                size="small"
                variant="outlined"
              />

              {appointment.status === 'BOOKED' && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Cancel />}
                  onClick={() => setCancelDialog({ open: true, appointmentId: appointment.id })}
                >
                  Cancelar
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <LocalHospital sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mis Citas
          </Typography>
          <IconButton color="inherit" onClick={loadAppointments}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label={`Próximas (${upcomingAppointments.length})`} />
            <Tab label={`Historial (${pastAppointments.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : upcomingAppointments.length > 0 ? (
            <Grid container spacing={2}>
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No tienes citas próximas.
              <Button
                variant="text"
                onClick={() => navigate('/book-appointment')}
                sx={{ ml: 1 }}
              >
                Reservar una cita
              </Button>
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : pastAppointments.length > 0 ? (
            <Grid container spacing={2}>
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No tienes citas en el historial.
            </Alert>
          )}
        </TabPanel>
      </Container>

      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, appointmentId: null })}
      >
        <DialogTitle>Cancelar Cita</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, appointmentId: null })}>
            No, mantener cita
          </Button>
          <Button 
            onClick={() => handleCancelAppointment(cancelDialog.appointmentId!)}
            color="error"
            autoFocus
          >
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};