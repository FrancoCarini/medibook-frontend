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
  CircularProgress,
  TextField,
  Paper
} from '@mui/material';
import {
  LocalHospital,
  ArrowBack,
  CalendarMonth,
  Person,
  AccessTime,
  Cancel,
  Refresh,
  FilterList,
  Clear,
  Search
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointmentId: string | null }>({
    open: false,
    appointmentId: null
  });

  // Pagination state
  const [pagination, setPagination] = useState<{ hasNext: boolean; page: number }>({
    hasNext: false,
    page: 1
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter states
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async (page: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const searchParams: any = {
        limit: 1,
        page
      };

      if (startDate) {
        searchParams.startDate = startDate;
      }
      if (endDate) {
        searchParams.endDate = endDate;
      }

      const response = await appointmentsService.search(searchParams);

      const sortedAppointments = response.data.sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      if (append) {
        setAppointments(prev => [...prev, ...sortedAppointments]);
      } else {
        setAppointments(sortedAppointments);
      }

      setPagination({
        hasNext: response.pagination.hasNext,
        page: response.pagination.page
      });
    } catch (error) {
      console.error('Error al cargar citas:', error);
      showError('Error al cargar las citas');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreAppointments = () => {
    loadAppointments(pagination.page + 1, true);
  };

  const handleClearFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate('');
  };

  const filterAppointments = (statuses: string[] = []) => {
    if (statuses.length === 0) return appointments;
    return appointments.filter(apt => statuses.includes(apt.status));
  };

  const upcomingAppointments = filterAppointments(['BOOKED', 'ONGOING']);
  const pastAppointments = filterAppointments(['COMPLETED', 'CANCELLED']);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.cancel(appointmentId);

      setAppointments(prev =>
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
        {/* Filters Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterList sx={{ mr: 1 }} />
            <Typography variant="h6">Filtros</Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Fecha desde"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Fecha hasta"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={() => loadAppointments()}
                size="small"
                fullWidth
              >
                Buscar
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                size="small"
                fullWidth
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
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
            <>
              <Grid container spacing={2}>
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </Grid>
              {pagination.hasNext && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={loadMoreAppointments}
                    disabled={loadingMore}
                    startIcon={loadingMore ? <CircularProgress size={20} /> : null}
                  >
                    {loadingMore ? 'Cargando...' : 'Ver más'}
                  </Button>
                </Box>
              )}
            </>
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
            <>
              <Grid container spacing={2}>
                {pastAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </Grid>
              {pagination.hasNext && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={loadMoreAppointments}
                    disabled={loadingMore}
                    startIcon={loadingMore ? <CircularProgress size={20} /> : null}
                  >
                    {loadingMore ? 'Cargando...' : 'Ver más'}
                  </Button>
                </Box>
              )}
            </>
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