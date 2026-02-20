import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AppointmentBookingPage } from './pages/AppointmentBookingPage';
import { MyAppointmentsPage } from './pages/MyAppointmentsPage';
import { DoctorAppointmentsPage } from './pages/DoctorAppointmentsPage';
import { AvailabilityManagementPage } from './pages/AvailabilityManagementPage';
import { ClientLoginPage } from './pages/ClientLoginPage';
import { ClientsIndexPage } from './pages/ClientsIndexPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <UIProvider>
          <Router>
          <Routes>
            {/* Static public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Static protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
                  <ClientsIndexPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-appointment"
              element={
                <ProtectedRoute>
                  <AppointmentBookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-appointments"
              element={
                <ProtectedRoute>
                  <MyAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor-appointments"
              element={
                <ProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
                  <DoctorAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/availability-management"
              element={
                <ProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
                  <AvailabilityManagementPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/unauthorized"
              element={
                <Container>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="100vh"
                  >
                    <Typography variant="h4" gutterBottom>
                      No autorizado
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      No tienes permisos para acceder a esta página
                    </Typography>
                  </Box>
                </Container>
              }
            />

            {/* Client slug routes — must come after all static routes */}
            <Route
              path="/:slug/book-appointment"
              element={
                <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
                  <AppointmentBookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/:slug/my-appointments"
              element={
                <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
                  <MyAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/:slug" element={<ClientLoginPage />} />

            {/* 404 catch-all */}
            <Route
              path="*"
              element={
                <Container>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="100vh"
                  >
                    <Typography variant="h4" gutterBottom>
                      404 - Página no encontrada
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      La página que buscas no existe
                    </Typography>
                  </Box>
                </Container>
              }
            />
          </Routes>
          </Router>
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
