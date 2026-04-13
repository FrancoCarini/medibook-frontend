import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentConfirmationModal } from './AppointmentConfirmationModal'
import type { Availability } from '../types'
import { AppointmentMode, AvailabilityStatus } from '../types'

const mockAvailability: Availability = {
  id: 'av-1',
  doctorId: 'doc-1',
  specialtyId: 'spec-1',
  mode: AppointmentMode.IN_PERSON,
  startTime: '2026-04-10T14:00:00Z',
  endTime: '2026-04-10T14:30:00Z',
  durationMinutes: 30,
  status: AvailabilityStatus.AVAILABLE,
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-01T00:00:00Z',
  doctor: {
    id: 'doc-1',
    userId: 'user-1',
    licenseNumber: 'LIC-001',
    title: 'Dr.',
    user: {
      id: 'user-1',
      email: 'doc@test.com',
      firstName: 'Carlos',
      lastName: 'García',
      role: 'DOCTOR' as any,
    },
  },
  specialty: {
    id: 'spec-1',
    name: 'Cardiología',
    createdAt: '',
    updatedAt: '',
  },
}

describe('AppointmentConfirmationModal', () => {
  const onClose = vi.fn()
  const onConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when availability is null', () => {
    const { container } = render(
      <AppointmentConfirmationModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        availability={null}
      />,
    )

    expect(container.innerHTML).toBe('')
  })

  it('should display doctor info', () => {
    render(
      <AppointmentConfirmationModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        availability={mockAvailability}
      />,
    )

    expect(screen.getByText('Carlos García')).toBeInTheDocument()
    expect(screen.getByText('Dr. - Lic. LIC-001')).toBeInTheDocument()
  })

  it('should display specialty', () => {
    render(
      <AppointmentConfirmationModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        availability={mockAvailability}
      />,
    )

    expect(screen.getByText('Cardiología')).toBeInTheDocument()
  })

  it('should display duration', () => {
    render(
      <AppointmentConfirmationModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        availability={mockAvailability}
      />,
    )

    expect(screen.getByText('Duración: 30 minutos')).toBeInTheDocument()
  })

  it('should display IN_PERSON mode as Consulta Presencial', () => {
    render(
      <AppointmentConfirmationModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        availability={mockAvailability}
      />,
    )

    expect(screen.getByText('Consulta Presencial')).toBeInTheDocument()
  })

  it('should display VIRTUAL mode as Consulta Virtual', () => {
    const virtualAvailability = {
      ...mockAvailability,
      mode: AppointmentMode.VIRTUAL,
    }

    render(
      <AppointmentConfirmationModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        availability={virtualAvailability}
      />,
    )

    expect(screen.getByText('Consulta Virtual')).toBeInTheDocument()
  })

  it('should call onClose when Cancelar is clicked', async () => {
    const user = userEvent.setup()

    render(
      <AppointmentConfirmationModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        availability={mockAvailability}
      />,
    )

    await user.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should call onConfirm when Confirmar Reserva is clicked', async () => {
    const user = userEvent.setup()

    render(
      <AppointmentConfirmationModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        availability={mockAvailability}
      />,
    )

    await user.click(screen.getByText('Confirmar Reserva'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('should show loading state and disable buttons', () => {
    render(
      <AppointmentConfirmationModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        availability={mockAvailability}
        loading={true}
      />,
    )

    expect(screen.getByText('Reservando...')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeDisabled()
    expect(screen.getByText('Reservando...').closest('button')).toBeDisabled()
  })

  it('should display confirmation title and subtitle', () => {
    render(
      <AppointmentConfirmationModal
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        availability={mockAvailability}
      />,
    )

    expect(screen.getByText('Confirmar Reserva de Cita')).toBeInTheDocument()
    expect(screen.getByText(/revise los detalles/)).toBeInTheDocument()
  })
})
