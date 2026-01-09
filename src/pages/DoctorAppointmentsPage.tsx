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
  Paper,
  Divider
} from '@mui/material';
import {
  LocalHospital,
  ArrowBack,
  CalendarMonth,
  Person,
  AccessTime,
  Cancel,
  Refresh,
  CheckCircle,
  FilterList,
  Clear,
  Search
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useNavigate } from 'react-router-dom';
import { appointmentsService } from '../services/appointments';
import { AppointmentStatus } from '../types';
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
      id={`doctor-appointments-tabpanel-${index}`}
      aria-labelledby={`doctor-appointments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

export const DoctorAppointmentsPage: React.FC = () => {
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
  const [completeDialog, setCompleteDialog] = useState<{ open: boolean; appointmentId: string | null }>({
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
    return today.toISOString().split('T')[0]; // Default to today
  });
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []); // Load initial appointments only

  const loadAppointments = async (page: number = 1, append: boolean = false) => {
    if (!user?.doctorId) {
      console.error('No doctor ID found for user');
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const searchParams: any = {
        doctorId: user.doctorId,
        limit: 20,
        page
      };

      // Add date filters
      if (startDate) {
        searchParams.startDate = startDate;
      }
      if (endDate) {
        searchParams.endDate = endDate;
      }

      const response = await appointmentsService.search(searchParams);

      // Sort by start time descending (most recent first)
      const sortedAppointments = response.data.sort((a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
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

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.cancel(appointmentId);

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: AppointmentStatus.CANCELLED }
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

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.complete(appointmentId);

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: AppointmentStatus.COMPLETED }
            : apt
        )
      );

      setCompleteDialog({ open: false, appointmentId: null });
      showSuccess('Cita marcada como completada');
    } catch (error) {
      console.error('Error al completar cita:', error);
      showError('Error al completar la cita');
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

  const filterAppointments = (statuses: string[] = []) => {
    if (statuses.length === 0) return appointments;
    return appointments.filter(apt => statuses.includes(apt.status));
  };

  const upcomingAppointments = filterAppointments(['BOOKED', 'ONGOING']);
  const pastAppointments = filterAppointments(['COMPLETED', 'CANCELLED']);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const timeStr = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { date: dateStr, time: timeStr };
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const startDateTime = formatDateTime(appointment.startTime);
    const endTime = new Date(appointment.endTime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ 
          minHeight: 200, 
          width: '100%',
          minWidth: { xs: '100%', sm: 300, md: 350 }
        }}>
          <CardContent>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" minHeight={48}>
                <Box display="flex" alignItems="center">
                  <Person sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {appointment.patient?.firstName} {appointment.patient?.lastName}
                  </Typography>
                </Box>
                <Chip 
                  label={getStatusLabel(appointment.status)}
                  color={getStatusColor(appointment.status)}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {appointment.patient?.email}
              </Typography>
              
              <Box display="flex" alignItems="center">
                <CalendarMonth sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {startDateTime.date}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <AccessTime sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {startDateTime.time} - {endTime}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" minHeight={40}>
                <Chip 
                  label={appointment.mode === 'IN_PERSON' ? 'Presencial' : 'Virtual'}
                  color={appointment.mode === 'IN_PERSON' ? 'primary' : 'secondary'}
                  size="small"
                  variant="outlined"
                />
                
                <Stack direction="row" spacing={1}>
                  {appointment.status === 'BOOKED' && (
                    <>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => setCompleteDialog({ open: true, appointmentId: appointment.id })}
                      >
                        Completar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => setCancelDialog({ open: true, appointmentId: appointment.id })}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    );
  };

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
            Mis Citas - Dr. {user?.firstName} {user?.lastName}
          </Typography>
          <IconButton color="inherit" onClick={loadAppointments} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : <Refresh />}
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
                onClick={loadAppointments}
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
            <Grid item xs={12} sm={12} md={2}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {appointments.length} citas encontradas
              </Typography>
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
              No tienes citas próximas programadas.
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

      <Dialog
        open={completeDialog.open}
        onClose={() => setCompleteDialog({ open: false, appointmentId: null })}
      >
        <DialogTitle>Completar Cita</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas marcar esta cita como completada?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialog({ open: false, appointmentId: null })}>
            Cancelar
          </Button>
          <Button
            onClick={() => handleCompleteAppointment(completeDialog.appointmentId!)}
            color="success"
            autoFocus
          >
            Sí, completar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};