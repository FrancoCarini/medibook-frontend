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
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import { clientsService } from '../services';
import type { Client } from '../types';
import { getErrorMessage } from '../utils/messages';

export const AdminClientsPage: React.FC = () => {
  const { showSuccess, showError } = useUI();
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Data
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsService.getAll();
      setClients(data);
    } catch {
      showError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await clientsService.create({ name, slug });
      showSuccess('Cliente creado exitosamente');
      setName('');
      setSlug('');
      await loadClients();
    } catch (error) {
      showError(getErrorMessage(error, 'Error al crear cliente'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">Gestión de Clientes</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Create Client Form */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Crear Cliente
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Nombre"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    disabled={isCreating}
                    helperText='Ej: "Dr. Juan Díaz" o "Clínica San Martín"'
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Slug (URL)"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={isCreating}
                    helperText="Se genera automáticamente. Se usa en la URL del cliente."
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={isCreating}
                startIcon={isCreating ? <CircularProgress size={20} /> : null}
              >
                {isCreating ? 'Creando...' : 'Crear Cliente'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Clients List */}
        <Typography variant="h6" gutterBottom>
          Clientes ({clients.length})
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : clients.length === 0 ? (
          <Alert severity="info">No hay clientes registrados</Alert>
        ) : (
          <Grid container spacing={2}>
            {clients.map((c) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {c.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      /{c.slug}
                    </Typography>
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
