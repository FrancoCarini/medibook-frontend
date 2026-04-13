import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { specialtiesService, usersService, doctorsService } from '../services';
import type { Specialty } from '../types';
import { UserRole } from '../types';
import { getErrorMessage } from '../utils/messages';

export const AdminSpecialtiesPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useUI();
  const navigate = useNavigate();

  const isAdmin = user?.role === UserRole.ADMIN;

  // Create specialty form
  const [specialtyName, setSpecialtyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Assign specialty form
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Data
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorSpecialties, setDoctorSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      loadDoctorSpecialties(selectedDoctorId);
    } else {
      setDoctorSpecialties([]);
    }
  }, [selectedDoctorId]);

  const loadData = async () => {
    try {
      const [specialtiesData, doctorsData] = await Promise.all([
        specialtiesService.getSpecialties(),
        usersService.getDoctors(),
      ]);
      setSpecialties(specialtiesData);
      setDoctors(doctorsData);
    } catch {
      showError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorSpecialties = async (doctorId: string) => {
    try {
      const data = await doctorsService.getSpecialties(doctorId);
      setDoctorSpecialties(data);
    } catch {
      setDoctorSpecialties([]);
    }
  };

  const handleCreateSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await specialtiesService.createSpecialty({ name: specialtyName });
      showSuccess('Especialidad creada exitosamente');
      setSpecialtyName('');
      const data = await specialtiesService.getSpecialties();
      setSpecialties(data);
    } catch (error) {
      showError(getErrorMessage(error, 'Error al crear especialidad'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleAssignSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigning(true);

    try {
      await doctorsService.assignSpecialty(selectedDoctorId, selectedSpecialtyId);
      showSuccess('Especialidad asignada exitosamente');
      setSelectedSpecialtyId('');
      await loadDoctorSpecialties(selectedDoctorId);
    } catch (error) {
      showError(getErrorMessage(error, 'Error al asignar especialidad'));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveSpecialty = async (specialtyId: string) => {
    try {
      await doctorsService.removeSpecialty(selectedDoctorId, specialtyId);
      showSuccess('Especialidad removida');
      await loadDoctorSpecialties(selectedDoctorId);
    } catch (error) {
      showError(getErrorMessage(error, 'Error al remover especialidad'));
    }
  };

  const isClientAdmin = user?.role === UserRole.CLIENT_ADMIN;
  const filteredDoctors = isClientAdmin
    ? doctors.filter((d) => d.doctor?.clientId === user?.clientId)
    : doctors;

  // Specialties not yet assigned to the selected doctor
  const availableSpecialties = specialties.filter(
    (s) => !doctorSpecialties.some((ds) => ds.id === s.id),
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">Especialidades</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Create Specialty — only ADMIN */}
        {isAdmin && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Crear Especialidad
              </Typography>
              <Box component="form" onSubmit={handleCreateSpecialty} display="flex" gap={2} alignItems="center">
                <TextField
                  required
                  label="Nombre de la especialidad"
                  value={specialtyName}
                  onChange={(e) => setSpecialtyName(e.target.value)}
                  disabled={isCreating}
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isCreating}
                  startIcon={isCreating ? <CircularProgress size={20} /> : null}
                >
                  {isCreating ? 'Creando...' : 'Crear'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Specialties List */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Especialidades ({specialties.length})
            </Typography>
            {specialties.length === 0 ? (
              <Alert severity="info">No hay especialidades registradas</Alert>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {specialties.map((s) => (
                  <Chip key={s.id} label={s.name} />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Assign Specialty to Doctor */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Asignar Especialidad a Doctor
            </Typography>
            <Box component="form" onSubmit={handleAssignSpecialty}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 5 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Doctor</InputLabel>
                    <Select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      label="Doctor"
                    >
                      {filteredDoctors.map((d) => (
                        <MenuItem key={d.doctor?.id} value={d.doctor?.id}>
                          {d.doctor?.title} {d.firstName} {d.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <FormControl fullWidth required disabled={!selectedDoctorId}>
                    <InputLabel>Especialidad</InputLabel>
                    <Select
                      value={selectedSpecialtyId}
                      onChange={(e) => setSelectedSpecialtyId(e.target.value)}
                      label="Especialidad"
                    >
                      {availableSpecialties.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isAssigning || !selectedDoctorId || !selectedSpecialtyId}
                    startIcon={isAssigning ? <CircularProgress size={20} /> : null}
                  >
                    {isAssigning ? 'Asignando...' : 'Asignar'}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Current specialties of selected doctor */}
            {selectedDoctorId && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Especialidades actuales del doctor:
                </Typography>
                {doctorSpecialties.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Sin especialidades asignadas
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {doctorSpecialties.map((s) => (
                      <Chip
                        key={s.id}
                        label={s.name}
                        onDelete={() => handleRemoveSpecialty(s.id)}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
