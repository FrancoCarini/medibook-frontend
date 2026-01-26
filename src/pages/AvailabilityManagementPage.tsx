import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  LocalHospital,
  Add,
  Repeat,
  Settings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { CalendarView } from '../components/availability/CalendarView';
import { IndividualAvailabilityForm } from '../components/availability/IndividualAvailabilityForm';
import { RecurringAvailabilityForm } from '../components/availability/RecurringAvailabilityForm';
import { MyConfigurationsPanel } from '../components/availability/MyConfigurationsPanel';
import { DayAvailabilitiesModal } from '../components/availability/DayAvailabilitiesModal';
import { availabilitiesService } from '../services/availabilities';
import { configAvailabilitiesService } from '../services/configAvailabilities';
import type { Availability, ConfigAvailability, Specialty } from '../types';
import { MESSAGES } from '../utils/messages';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`availability-tabpanel-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const AvailabilityManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useUI();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [configAvailabilities, setConfigAvailabilities] = useState<ConfigAvailability[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonthRange, setCurrentMonthRange] = useState<{ startDate: Date; endDate: Date } | null>(null);

  // Modal state for day availabilities
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [dayModalDate, setDayModalDate] = useState<Date | null>(null);
  const [dayModalAvailabilities, setDayModalAvailabilities] = useState<Availability[]>([]);

  // Helper to format date for API
  const formatDateForApi = (date: Date): string => {
    return date.toISOString();
  };

  // Fetch availabilities for a specific month range
  const fetchAvailabilitiesForMonth = useCallback(async (startDate: Date, endDate: Date) => {
    if (!user?.doctorId) return;

    try {
      const availData = await availabilitiesService.search({
        doctorId: user.doctorId,
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
        all: true
      });
      setAvailabilities(availData);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      showError(MESSAGES.AVAILABILITIES_LOAD_ERROR);
    }
  }, [user?.doctorId, showError]);

  // Fetch config availabilities on mount
  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        setLoading(true);
        const configData = await configAvailabilitiesService.getAll();
        setConfigAvailabilities(configData);
        setSpecialties(user?.specialties || []);
      } catch (error) {
        console.error('Error fetching config data:', error);
        showError(MESSAGES.CONFIG_AVAILABILITIES_LOAD_ERROR);
      } finally {
        setLoading(false);
      }
    };

    if (user?.doctorId) {
      fetchConfigData();
    }
  }, [user?.doctorId, user?.specialties]);

  // Handle month change from calendar
  const handleMonthChange = useCallback((startDate: Date, endDate: Date) => {
    setCurrentMonthRange({ startDate, endDate });
    fetchAvailabilitiesForMonth(startDate, endDate);
  }, [fetchAvailabilitiesForMonth]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setTabValue(0); // Switch to individual availability tab
  };

  const handleDayWithAvailabilityClick = (date: Date, dayAvailabilities: Availability[]) => {
    setDayModalDate(date);
    setDayModalAvailabilities(dayAvailabilities);
    setDayModalOpen(true);
  };

  const handleDayModalClose = () => {
    setDayModalOpen(false);
    setDayModalDate(null);
    setDayModalAvailabilities([]);
  };

  const handleAvailabilityCreated = async () => {
    // Refresh availabilities for current month after creation
    if (currentMonthRange) {
      await fetchAvailabilitiesForMonth(currentMonthRange.startDate, currentMonthRange.endDate);
    }
  };

  const handleConfigAvailabilityCreated = async () => {
    // Refresh config availabilities after creation
    try {
      const updatedConfigs = await configAvailabilitiesService.getAll();
      setConfigAvailabilities(updatedConfigs);
      // Also refresh availabilities in case the config generated new ones
      if (currentMonthRange) {
        await fetchAvailabilitiesForMonth(currentMonthRange.startDate, currentMonthRange.endDate);
      }
    } catch (error) {
      console.error('Error refreshing config availabilities:', error);
    }
  };

  const handleAvailabilityDeleted = async (deletedId: string) => {
    // Update modal availabilities immediately (remove the deleted one)
    const updatedModalAvailabilities = dayModalAvailabilities.filter(a => a.id !== deletedId);

    if (updatedModalAvailabilities.length === 0) {
      handleDayModalClose();
    } else {
      setDayModalAvailabilities(updatedModalAvailabilities);
    }

    // Refresh availabilities for current month after deletion
    if (currentMonthRange) {
      await fetchAvailabilitiesForMonth(currentMonthRange.startDate, currentMonthRange.endDate);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Cargando disponibilidades...</Typography>
      </Box>
    );
  }

  if (!user?.doctorId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Error: No se encontró el ID del médico en la sesión</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <LocalHospital sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestión de Disponibilidad
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Calendar Section */}
          <Box sx={{ flex: '1 1 60%', minWidth: '300px' }}>
            <Paper elevation={2} sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Calendario de Disponibilidad
              </Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <CalendarView
                  availabilities={availabilities}
                  configAvailabilities={configAvailabilities}
                  onDateSelect={handleDateSelect}
                  onMonthChange={handleMonthChange}
                  onDayWithAvailabilityClick={handleDayWithAvailabilityClick}
                  selectedDate={selectedDate}
                />
              </Box>
            </Paper>
          </Box>

          {/* Side Panel */}
          <Box sx={{ flex: '1 1 35%', minWidth: '300px' }}>
            <Paper elevation={2} sx={{ height: '70vh', overflow: 'auto' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  textColor="primary"
                  indicatorColor="primary"
                >
                  <Tab
                    icon={<Add />}
                    label="Día específico"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<Repeat />}
                    label="Recurrente"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<Settings />}
                    label="Configuraciones"
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                {selectedDate && (
                  <Box mb={2}>
                    <Chip
                      label={selectedDate.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                  </Box>
                )}
                {specialties.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No tienes especialidades asignadas. Contacta al administrador para asignar especialidades a tu perfil.
                    </Typography>
                  </Box>
                ) : (
                  <IndividualAvailabilityForm
                    selectedDate={selectedDate}
                    specialties={specialties}
                    onAvailabilityCreated={handleAvailabilityCreated}
                  />
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {specialties.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No tienes especialidades asignadas. Contacta al administrador para asignar especialidades a tu perfil.
                    </Typography>
                  </Box>
                ) : (
                  <RecurringAvailabilityForm
                    specialties={specialties}
                    onConfigAvailabilityCreated={handleConfigAvailabilityCreated}
                  />
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <MyConfigurationsPanel
                  configAvailabilities={configAvailabilities}
                  onUpdate={handleConfigAvailabilityCreated}
                />
              </TabPanel>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Day Availabilities Modal */}
      <DayAvailabilitiesModal
        open={dayModalOpen}
        date={dayModalDate}
        availabilities={dayModalAvailabilities}
        onClose={handleDayModalClose}
        onAvailabilityDeleted={handleAvailabilityDeleted}
        onAddAvailability={(date) => {
          handleDayModalClose();
          setSelectedDate(date);
          setTabValue(0);
        }}
      />
    </Box>
  );
};