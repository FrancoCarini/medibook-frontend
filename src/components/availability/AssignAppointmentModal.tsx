import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Paper
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usersService } from '../../services/users';
import { appointmentsService } from '../../services/appointments';
import { useUI } from '../../contexts/UIContext';
import { MESSAGES, getErrorMessage } from '../../utils/messages';
import type { Availability, User } from '../../types';

interface AssignAppointmentModalProps {
  open: boolean;
  availability: Availability | null;
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignAppointmentModal: React.FC<AssignAppointmentModalProps> = ({
  open,
  availability,
  onClose,
  onAssigned
}) => {
  const { showSuccess, showError } = useUI();
  const [step, setStep] = useState<'search' | 'confirm'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [searched, setSearched] = useState(false);

  const resetState = () => {
    setStep('search');
    setSearchTerm('');
    setPatients([]);
    setSelectedPatient(null);
    setLoading(false);
    setConfirming(false);
    setSearched(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSearch = async () => {
    if (searchTerm.trim().length < 3) {
      showError(MESSAGES.PATIENT_SEARCH_MIN_LENGTH);
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const results = await usersService.searchPatients(searchTerm.trim());
      setPatients(results);
    } catch (err: any) {
      showError(getErrorMessage(err, MESSAGES.PATIENT_SEARCH_ERROR));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient: User) => {
    setSelectedPatient(patient);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!availability || !selectedPatient) return;

    try {
      setConfirming(true);
      await appointmentsService.create({
        availabilityId: availability.id,
        patientId: selectedPatient.id
      });
      showSuccess(MESSAGES.APPOINTMENT_ASSIGNED);
      resetState();
      onAssigned();
    } catch (err: any) {
      showError(getErrorMessage(err, MESSAGES.APPOINTMENT_BOOKING_ERROR));
    } finally {
      setConfirming(false);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: es });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const getModeLabel = (mode: string) => {
    return mode === 'VIRTUAL' ? 'Virtual' : 'Presencial';
  };

  if (!availability) return null;

  const slotSummary = (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
      <Typography variant="body2">
        <strong>Fecha:</strong> {formatDate(availability.startTime)}
      </Typography>
      <Typography variant="body2">
        <strong>Horario:</strong> {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
      </Typography>
      <Typography variant="body2">
        <strong>Especialidad:</strong> {availability.specialty?.name}
      </Typography>
      <Typography variant="body2">
        <strong>Modalidad:</strong> {getModeLabel(availability.mode)}
      </Typography>
    </Paper>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Asignar turno</DialogTitle>
      <DialogContent dividers>
        {slotSummary}

        {step === 'search' && (
          <>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                label="Buscar paciente por nombre o email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                size="small"
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Buscar
              </Button>
            </Box>

            {loading && (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
              </Box>
            )}

            {!loading && searched && patients.length === 0 && (
              <Alert severity="info">{MESSAGES.NO_PATIENTS_FOUND}</Alert>
            )}

            {!loading && patients.length > 0 && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleSelectPatient(patient)}
                        >
                          Seleccionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}

        {step === 'confirm' && selectedPatient && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Paciente seleccionado
            </Typography>
            <Typography variant="body2">
              <strong>Nombre:</strong> {selectedPatient.firstName} {selectedPatient.lastName}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {selectedPatient.email}
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        {step === 'search' && (
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
        )}
        {step === 'confirm' && (
          <>
            <Button onClick={() => setStep('search')} color="inherit" disabled={confirming}>
              Volver
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              disabled={confirming}
            >
              {confirming ? 'Asignando...' : 'Confirmar'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
