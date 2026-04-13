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
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { usersService, clientsService, specialtiesService } from '../services';
import type { Client, Specialty } from '../types';
import { UserRole } from '../types';
import { getErrorMessage } from '../utils/messages';

export const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useUI();
  const navigate = useNavigate();

  const isClientAdmin = user?.role === UserRole.CLIENT_ADMIN;

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [title, setTitle] = useState('Dr.');
  const [clientId, setClientId] = useState('');
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsData, specialtiesData, doctorsData] = await Promise.all([
        clientsService.getAll(),
        specialtiesService.getSpecialties(),
        usersService.getDoctors(),
      ]);
      setClients(clientsData);
      setSpecialties(specialtiesData);
      setDoctors(doctorsData);

      if (isClientAdmin && user?.clientId) {
        setClientId(user.clientId);
      }
    } catch {
      showError('Error al cargar datos');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await usersService.createUser({
        email,
        password,
        firstName,
        lastName,
        role: 'DOCTOR',
        doctorData: {
          licenseNumber,
          title,
          clientId: isClientAdmin ? user!.clientId! : clientId,
          specialtyIds: selectedSpecialtyIds.length > 0 ? selectedSpecialtyIds : undefined,
        },
      });

      showSuccess('Doctor creado exitosamente');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setLicenseNumber('');
      setTitle('Dr.');
      setSelectedSpecialtyIds([]);
      if (!isClientAdmin) setClientId('');

      // Reload doctors list
      const doctorsData = await usersService.getDoctors();
      setDoctors(doctorsData);
    } catch (error) {
      showError(getErrorMessage(error, 'Error al crear doctor'));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDoctors = isClientAdmin
    ? doctors.filter((d) => d.doctor?.clientId === user?.clientId)
    : doctors;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">Gestión de Usuarios</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Create Doctor Form */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Crear Doctor
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    helperText="Mínimo 6 caracteres"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Matrícula"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                  />
                </Grid>
                {!isClientAdmin && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel>Cliente</InputLabel>
                      <Select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        label="Cliente"
                        disabled={isLoading}
                      >
                        {clients.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: isClientAdmin ? 12 : 6 }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Especialidades</InputLabel>
                    <Select
                      multiple
                      value={selectedSpecialtyIds}
                      onChange={(e) => setSelectedSpecialtyIds(e.target.value as string[])}
                      label="Especialidades"
                      disabled={isLoading}
                      renderValue={(selected) =>
                        selected
                          .map((id) => specialties.find((s) => s.id === id)?.name)
                          .join(', ')
                      }
                    >
                      {specialties.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {isLoading ? 'Creando...' : 'Crear Doctor'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Doctors List */}
        <Typography variant="h6" gutterBottom>
          Doctores ({filteredDoctors.length})
        </Typography>
        {loadingDoctors ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : filteredDoctors.length === 0 ? (
          <Alert severity="info">No hay doctores registrados</Alert>
        ) : (
          <Grid container spacing={2}>
            {filteredDoctors.map((d) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={d.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {d.doctor?.title} {d.firstName} {d.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {d.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Matrícula: {d.doctor?.licenseNumber}
                    </Typography>
                    {d.doctor?.specialties?.length > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {d.doctor.specialties.map((ds: any) => (
                          <Chip
                            key={ds.specialty.id}
                            label={ds.specialty.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};
