import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';

interface SnackbarMessage {
  message: string;
  severity: AlertColor;
  duration?: number;
}

interface UIContextType {
  showSnackbar: (message: string, severity?: AlertColor, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snackbar, setSnackbar] = useState<SnackbarMessage | null>(null);

  const showSnackbar = useCallback((message: string, severity: AlertColor = 'info', duration: number = 4000) => {
    setSnackbar({ message, severity, duration });
  }, []);

  const showSuccess = useCallback((message: string, duration: number = 4000) => {
    showSnackbar(message, 'success', duration);
  }, [showSnackbar]);

  const showError = useCallback((message: string, duration: number = 6000) => {
    showSnackbar(message, 'error', duration);
  }, [showSnackbar]);

  const showWarning = useCallback((message: string, duration: number = 5000) => {
    showSnackbar(message, 'warning', duration);
  }, [showSnackbar]);

  const showInfo = useCallback((message: string, duration: number = 4000) => {
    showSnackbar(message, 'info', duration);
  }, [showSnackbar]);

  const handleClose = useCallback(() => {
    setSnackbar(null);
  }, []);

  const value: UIContextType = {
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={snackbar?.duration || 4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={snackbar?.severity || 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};