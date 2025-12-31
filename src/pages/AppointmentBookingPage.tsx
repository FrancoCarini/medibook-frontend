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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Stack,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  LocalHospital,
  ArrowBack,
  Search,
  CalendarMonth,
  Person,
  AccessTime,
  MedicalServices
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useNavigate } from 'react-router-dom';
import { specialtiesService, availabilitiesService, appointmentsService } from '../services';
import type { Specialty, Availability } from '../types';
import { AppointmentConfirmationModal } from '../components/AppointmentConfirmationModal';
import { AppointmentSkeletonGroup } from '../components/AppointmentCardSkeleton';

export const AppointmentBookingPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      const data = await specialtiesService.getSpecialties();
      setSpecialties(data);
    } catch (error) {
      console.error('Error loading specialties:', error);
    } finally {
      setLoadingSpecialties(false);
    }
  };
  
  const [specialty, setSpecialty] = useState('');
  const [mode, setMode] = useState('');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [searchResults, setSearchResults] = useState<Availability[]>([]);
  const [groupedResults, setGroupedResults] = useState<{[key: string]: Availability[]}>({});
  const [loading, setLoading] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleSearch = async (loadMore = false) => {
    if (!specialty) {
      return;
    }

    const pageToLoad = loadMore ? currentPage + 1 : 1;
    
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setHasSearched(true);
      setCurrentPage(1);
    }
    
    try {
      const searchParams: any = {
        specialtyId: specialty,
        page: pageToLoad,
        limit: 20
      };
      
      if (mode) searchParams.mode = mode;
      if (startDate) searchParams.startDate = startDate;
      if (endDate) searchParams.endDate = endDate;
      
      const response = await availabilitiesService.search(searchParams);
      const results = response.data || response; // Manejar tanto el formato con data como sin él
      const pagination = response.pagination;
      
      if (loadMore) {
        // Agregar resultados a los existentes
        const combinedResults = [...searchResults, ...results];
        setSearchResults(combinedResults);
        setCurrentPage(pageToLoad);
        
        // Agrupar resultados combinados por día
        const grouped = groupByDate(combinedResults);
        setGroupedResults(grouped);
      } else {
        // Reemplazar resultados existentes
        setSearchResults(results);
        setCurrentPage(1);
        
        // Agrupar resultados por día
        const grouped = groupByDate(results);
        setGroupedResults(grouped);
      }
      
      // Verificar si hay más resultados disponibles usando pagination si está disponible
      if (pagination) {
        setHasMoreResults(pagination.page < pagination.totalPages);
      } else {
        setHasMoreResults(results.length === 20);
      }
      
    } catch (error) {
      console.error('Error al buscar disponibilidades:', error);
      if (!loadMore) {
        setSearchResults([]);
        setGroupedResults({});
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  const groupByDate = (availabilities: Availability[]) => {
    return availabilities.reduce((acc, availability) => {
      const date = new Date(availability.startTime).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(availability);
      return acc;
    }, {} as {[key: string]: Availability[]});
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  const openConfirmationModal = (availability: Availability) => {
    setSelectedAvailability(availability);
    setModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setModalOpen(false);
    setSelectedAvailability(null);
  };

  const handleBookAppointment = async () => {
    if (!selectedAvailability) return;
    
    setBookingLoading(true);
    try {
      await appointmentsService.create({ availabilityId: selectedAvailability.id });
      showSuccess('¡Cita reservada exitosamente! Recibirás un correo de confirmación.', 5000);
      closeConfirmationModal();
      // Actualizar resultados de búsqueda
      handleSearch();
    } catch (error) {
      console.error('Error al reservar cita:', error);
      showError('Error al reservar la cita. Por favor, intenta nuevamente.');
    } finally {
      setBookingLoading(false);
    }
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
            Reservar Cita
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Buscar Turnos Disponibles
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', '@media (max-width: 900px)': { flexDirection: 'column' } }}>
              <FormControl sx={{ flex: '1 1 280px', minWidth: '250px' }}>
                <InputLabel>Especialidad *</InputLabel>
                <Select
                  value={specialty}
                  label="Especialidad *"
                  onChange={(e) => setSpecialty(e.target.value)}
                  disabled={loadingSpecialties}
                  sx={{ height: '56px' }}
                >
                  {specialties.map((spec) => (
                    <MenuItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ flex: '1 1 200px', minWidth: '180px' }}>
                <InputLabel>Modalidad</InputLabel>
                <Select
                  value={mode}
                  label="Modalidad"
                  onChange={(e) => setMode(e.target.value)}
                  sx={{ height: '56px' }}
                >
                  <MenuItem value="">Cualquiera</MenuItem>
                  <MenuItem value="IN_PERSON">Presencial</MenuItem>
                  <MenuItem value="VIRTUAL">Virtual</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Fecha desde"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flex: '1 1 160px', minWidth: '150px' }}
              />
              <TextField
                label="Fecha hasta"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flex: '1 1 160px', minWidth: '150px' }}
              />
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={() => handleSearch()}
                disabled={!specialty || loading}
                sx={{ 
                  height: '56px',
                  flex: '0 1 200px',
                  minWidth: '180px'
                }}
              >
                {loading ? 'Buscando...' : 'Buscar Turnos'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {Object.keys(groupedResults).length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Turnos Disponibles ({searchResults.length} encontrados)
            </Typography>
            
            {Object.entries(groupedResults)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, availabilities]) => (
                <Card key={date} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                      📅 {formatDate(date)}
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {availabilities
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                        .map((availability) => (
                          <Grid item xs={12} sm={6} md={6} key={availability.id}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                              <CardContent sx={{ p: 3 }}>
                                <Stack spacing={1.5}>
                                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ minHeight: '40px' }}>
                                    <Typography variant="h5" sx={{ fontSize: '1.4rem', fontWeight: 700, color: 'primary.main' }}>
                                      {new Date(availability.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </Typography>
                                    <Chip 
                                      label={availability.mode === 'IN_PERSON' ? 'Presencial' : 'Virtual'}
                                      color={availability.mode === 'IN_PERSON' ? 'primary' : 'secondary'}
                                      size="medium"
                                      sx={{ flexShrink: 0, ml: 2 }}
                                    />
                                  </Box>
                                  
                                  <Box display="flex" alignItems="center" sx={{ py: 0.5 }}>
                                    <Person sx={{ mr: 2, fontSize: 20, color: 'text.secondary' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                      {availability.doctor?.user?.firstName || 'Dr.'} {availability.doctor?.user?.lastName || 'Disponible'}
                                    </Typography>
                                  </Box>
                                  
                                  <Box display="flex" alignItems="center" sx={{ py: 0.5 }}>
                                    <MedicalServices sx={{ mr: 2, fontSize: 20, color: 'text.secondary' }} />
                                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                      {availability.specialty?.name}
                                    </Typography>
                                  </Box>
                                  
                                  <Box display="flex" alignItems="center" sx={{ py: 0.5 }}>
                                    <AccessTime sx={{ mr: 2, fontSize: 20, color: 'text.secondary' }} />
                                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                      {availability.durationMinutes} minutos
                                    </Typography>
                                  </Box>
                                  
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    size="medium"
                                    onClick={() => openConfirmationModal(availability)}
                                    disabled={availability.status !== 'AVAILABLE'}
                                    sx={{ mt: 1.5, py: 1 }}
                                  >
                                    {availability.status === 'AVAILABLE' ? 'Reservar' : 'No Disponible'}
                                  </Button>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              
            {/* Loading skeletons for "load more" */}
            {loadingMore && (
              <AppointmentSkeletonGroup count={4} />
            )}
              
            {hasMoreResults && (
              <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleSearch(true)}
                  disabled={loadingMore}
                  startIcon={loadingMore ? <CircularProgress size={20} color="inherit" /> : <Search />}
                >
                  {loadingMore ? 'Cargando...' : 'Cargar más turnos'}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {searchResults.length === 0 && hasSearched && !loading && (
          <Alert severity="info">
            No se encontraron horarios disponibles para los criterios seleccionados.
          </Alert>
        )}

        <AppointmentConfirmationModal
          open={modalOpen}
          onClose={closeConfirmationModal}
          onConfirm={handleBookAppointment}
          availability={selectedAvailability}
          loading={bookingLoading}
        />
      </Container>
    </Box>
  );
};