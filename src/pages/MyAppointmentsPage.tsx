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
  DialogActions
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
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointmentId: string | null }>({
    open: false,
    appointmentId: null
  });

  // Mock data - reemplazar con llamada real a la API
  const mockAppointments = [
    {
      id: '1',
      doctor: { firstName: 'Dr. Juan', lastName: 'Pérez' },
      specialty: { name: 'Cardiología' },
      date: '2024-01-20',
      startTime: '09:00',
      endTime: '09:30',
      status: 'BOOKED',
      modality: 'IN_PERSON',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      doctor: { firstName: 'Dr. María', lastName: 'González' },
      specialty: { name: 'Dermatología' },
      date: '2024-01-18',
      startTime: '10:00',
      endTime: '10:30',
      status: 'COMPLETED',
      modality: 'VIRTUAL',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      doctor: { firstName: 'Dr. Carlos', lastName: 'Martínez' },
      specialty: { name: 'Neurología' },
      date: '2024-01-10',
      startTime: '15:00',
      endTime: '15:30',
      status: 'CANCELLED',
      modality: 'IN_PERSON',
      createdAt: '2024-01-05'
    }
  ];

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // TODO: Implementar carga real de citas desde API
      // const data = await getMyAppointments();
      // setAppointments(data);
      
      // Mock data por ahora
      setTimeout(() => {
        setAppointments(mockAppointments);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      // TODO: Implementar cancelación de cita
      // await cancelAppointment(appointmentId);
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'CANCELLED' }
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

  const filterAppointments = (status: string[] = []) => {
    if (status.length === 0) return appointments;
    return appointments.filter(apt => status.includes(apt.status));
  };

  const upcomingAppointments = filterAppointments(['BOOKED', 'ONGOING']);
  const pastAppointments = filterAppointments(['COMPLETED', 'CANCELLED']);

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <Grid item xs={12} md={6} key={appointment.id}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {appointment.doctor.firstName} {appointment.doctor.lastName}
                </Typography>
              </Box>
              <Chip 
                label={getStatusLabel(appointment.status)}
                color={getStatusColor(appointment.status)}
                size="small"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {appointment.specialty.name}
            </Typography>
            
            <Box display="flex" alignItems="center">
              <CalendarMonth sx={{ mr: 1 }} />
              <Typography variant="body2">
                {appointment.date}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <AccessTime sx={{ mr: 1 }} />
              <Typography variant="body2">
                {appointment.startTime} - {appointment.endTime}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Chip 
                label={appointment.modality === 'IN_PERSON' ? 'Presencial' : 'Virtual'}
                color={appointment.modality === 'IN_PERSON' ? 'primary' : 'secondary'}
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
            <Alert severity="info">Cargando citas...</Alert>
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
            <Alert severity="info">Cargando historial...</Alert>
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