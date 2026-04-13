import { describe, it, expect } from 'vitest'
import { translate, getErrorMessage, MESSAGES } from './messages'

describe('messages', () => {
  describe('MESSAGES', () => {
    it('should have Spanish UI messages defined', () => {
      expect(MESSAGES.WELCOME).toBe('¡Bienvenido a Medibook!')
      expect(MESSAGES.LOGIN_ERROR).toBe('Error al iniciar sesión')
      expect(MESSAGES.APPOINTMENT_BOOKED).toContain('Cita reservada')
    })
  })

  describe('translate', () => {
    it('should translate known backend messages to Spanish', () => {
      expect(translate('Invalid credentials')).toBe('Credenciales inválidas')
      expect(translate('Doctor not found')).toBe('Médico no encontrado')
      expect(translate('Specialty not found')).toBe('Especialidad no encontrada')
    })

    it('should return original message if no translation exists', () => {
      expect(translate('Some unknown message')).toBe('Some unknown message')
    })

    it('should translate auth-related messages', () => {
      expect(translate('User is inactive')).toBe('El usuario está inactivo')
      expect(translate('Token has expired')).toBe('La sesión ha expirado')
      expect(translate('Email not verified. Please check your inbox.')).toBe(
        'Email no verificado. Por favor revisá tu bandeja de entrada.',
      )
    })

    it('should translate appointment-related messages', () => {
      expect(translate('Appointment not found')).toBe('Turno no encontrado')
      expect(translate('Appointment has been cancelled')).toBe('El turno ha sido cancelado')
    })

    it('should translate availability-related messages', () => {
      expect(translate('Availability not found')).toBe('Disponibilidad no encontrada')
      expect(translate('Availability overlaps with existing one')).toBe(
        'La disponibilidad se superpone con una existente',
      )
    })

    it('should translate client-related messages', () => {
      expect(translate('Client not found')).toBe('Cliente no encontrado')
      expect(translate('A client with this slug already exists')).toBe(
        'Ya existe un cliente con este slug',
      )
    })
  })

  describe('getErrorMessage', () => {
    it('should extract and translate message from API error response', () => {
      const error = {
        response: { data: { message: 'Invalid credentials' } },
      }
      expect(getErrorMessage(error)).toBe('Credenciales inválidas')
    })

    it('should fall back to error.message if no response data', () => {
      const error = { message: 'Network Error' }
      expect(getErrorMessage(error)).toBe('Network Error')
    })

    it('should use fallback message when no error info available', () => {
      expect(getErrorMessage({})).toBe('Ocurrió un error inesperado')
      expect(getErrorMessage(null)).toBe('Ocurrió un error inesperado')
    })

    it('should use custom fallback message', () => {
      expect(getErrorMessage({}, 'Error personalizado')).toBe('Error personalizado')
    })
  })
})
