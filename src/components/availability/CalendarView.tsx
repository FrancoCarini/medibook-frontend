import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  FiberManualRecord
} from '@mui/icons-material';
import type { Availability, ConfigAvailability } from '../../types';

interface CalendarViewProps {
  availabilities: Availability[];
  configAvailabilities: ConfigAvailability[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (startDate: Date, endDate: Date) => void;
  onDayWithAvailabilityClick?: (date: Date, availabilities: Availability[]) => void;
  selectedDate: Date | null;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  availabilities,
  configAvailabilities: _configAvailabilities,
  onDateSelect,
  onMonthChange,
  onDayWithAvailabilityClick,
  selectedDate
}) => {
  // Note: configAvailabilities is received for potential future use
  void _configAvailabilities;
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Helper to get month date range
  const getMonthDateRange = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const startDate = new Date(y, m, 1, 0, 0, 0);
    const endDate = new Date(y, m + 1, 0, 23, 59, 59);
    return { startDate, endDate };
  };

  // Notify parent when month changes
  useEffect(() => {
    const { startDate, endDate } = getMonthDateRange(currentDate);
    onMonthChange(startDate, endDate);
  }, [currentDate]);

  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to check if availability date matches given date
  const isSameDay = (availDate: Date, date: Date) => {
    return (
      availDate.getDate() === date.getDate() &&
      availDate.getMonth() === date.getMonth() &&
      availDate.getFullYear() === date.getFullYear()
    );
  };

  // Check if date has individual availability (configId is null)
  const hasIndividualAvailability = (date: Date) => {
    return availabilities.some(avail => {
      const availDate = new Date(avail.startTime);
      return !avail.configId && isSameDay(availDate, date);
    });
  };

  // Check if date has config/recurring availability (configId is not null)
  const hasConfigAvailability = (date: Date) => {
    return availabilities.some(avail => {
      const availDate = new Date(avail.startTime);
      return avail.configId && isSameDay(availDate, date);
    });
  };

  const getDateStatus = (date: Date) => {
    const hasIndividual = hasIndividualAvailability(date);
    const hasConfig = hasConfigAvailability(date);

    if (hasIndividual && hasConfig) return 'both';
    if (hasIndividual) return 'individual';
    if (hasConfig) return 'config';
    return 'none';
  };

  // Get availabilities for a specific date
  const getAvailabilitiesForDate = (date: Date): Availability[] => {
    return availabilities.filter(avail => {
      const availDate = new Date(avail.startTime);
      return isSameDay(availDate, date);
    });
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    const dayAvailabilities = getAvailabilitiesForDate(date);
    if (dayAvailabilities.length > 0 && onDayWithAvailabilityClick) {
      onDayWithAvailabilityClick(date, dayAvailabilities);
    } else {
      onDateSelect(date);
    }
  };

  const isSelected = (date: Date) => {
    return selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Calendar Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={goToPreviousMonth} size="small">
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2, minWidth: '150px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </Typography>
          <IconButton onClick={goToNextMonth} size="small">
            <ChevronRight />
          </IconButton>
        </Box>
        <Button size="small" onClick={goToToday} variant="outlined">
          Hoy
        </Button>
      </Box>

      {/* Legend */}
      <Box display="flex" gap={2} mb={2} justifyContent="center">
        <Box display="flex" alignItems="center" gap={0.5}>
          <FiberManualRecord sx={{ fontSize: 12, color: 'success.main' }} />
          <Typography variant="caption">Día específico</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <FiberManualRecord sx={{ fontSize: 12, color: 'primary.main' }} />
          <Typography variant="caption">Plantilla recurrente</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <FiberManualRecord sx={{ fontSize: 12, color: 'warning.main' }} />
          <Typography variant="caption">Ambos</Typography>
        </Box>
      </Box>

      {/* Day headers */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '2px',
        mb: 1 
      }}>
        {dayNames.map((day) => (
          <Box key={day} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)', // 6 filas máximo para un mes
        gap: '2px',
        minHeight: 0 // Permite que flex funcione correctamente
      }}>
        {calendarDays.map((date, index) => (
          <Box key={index} sx={{ 
            position: 'relative',
            width: '100%',
            height: '100%'
          }}>
            {date ? (
              <div
                className={`calendar-day ${isSelected(date) ? 'selected' : ''} ${isToday(date) ? 'today' : ''} ${getDateStatus(date) !== 'none' ? 'has-availability' : ''}`}
                onClick={() => handleDayClick(date)}
              >
                <Typography
                  variant="body2"
                  color={isToday(date) ? 'primary.main' : 'text.primary'}
                  fontWeight={isToday(date) ? 'bold' : 'normal'}
                  sx={{ fontSize: '0.875rem' }}
                >
                  {date.getDate()}
                </Typography>
                
                {/* Status indicator */}
                {getDateStatus(date) !== 'none' && (
                  <div className={`calendar-status-indicator ${getDateStatus(date)}`} />
                )}
              </div>
            ) : (
              <div className="calendar-day" style={{ opacity: 0 }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};