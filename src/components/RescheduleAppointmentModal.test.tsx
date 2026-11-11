import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal'
import { availabilitiesService } from '../services/availabilities'
import { appointmentsService } from '../services/appointments'
import type { Appointment, Availability } from '../types'
import { AppointmentMode, AppointmentStatus, AvailabilityStatus } from '../types'
import { MESSAGES } from '../utils/messages'

vi.mock('../services/availabilities', () => ({
  availabilitiesService: { search: vi.fn() },
}))
vi.mock('../services/appointments', () => ({
  appointmentsService: { reschedule: vi.fn() },
}))

const HOUR = 60 * 60 * 1000
const inHours = (h: number) => new Date(Date.now() + h * HOUR).toISOString()

const appointment: Appointment = {
  id: 'appt-1',
  availabilityId: 'av-old',
  doctorId: 'doc-1',
  patientId: 'pat-1',
  mode: AppointmentMode.IN_PERSON,
  startTime: inHours(48),
  endTime: inHours(48.5),
  status: AppointmentStatus.BOOKED,
  createdAt: '',
  updatedAt: '',
  availability: {
    specialtyId: 'spec-1',
    specialty: { id: 'spec-1', name: 'Cardiología', createdAt: '', updatedAt: '' },
  } as Availability,
}

const slot = (id: string, startTime: string, mode = AppointmentMode.IN_PERSON): Availability => ({
  id,
  doctorId: 'doc-1',
  specialtyId: 'spec-1',
  mode,
  startTime,
  endTime: startTime,
  durationMinutes: 30,
  status: AvailabilityStatus.AVAILABLE,
  createdAt: '',
  updatedAt: '',
})

const search = vi.mocked(availabilitiesService.search)
const reschedule = vi.mocked(appointmentsService.reschedule)

describe('RescheduleAppointmentModal', () => {
  const onClose = vi.fn()
  const onRescheduled = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderModal = () =>
    render(
      <RescheduleAppointmentModal
        open={true}
        appointment={appointment}
        onClose={onClose}
        onRescheduled={onRescheduled}
      />,
    )

  it('searches available slots of the same doctor and specialty', async () => {
    search.mockResolvedValue([])
    renderModal()

    await waitFor(() => expect(search).toHaveBeenCalled())
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({
        doctorId: 'doc-1',
        specialtyId: 'spec-1',
        status: AvailabilityStatus.AVAILABLE,
      }),
    )
    expect(await screen.findByText(/No hay otros horarios disponibles/)).toBeInTheDocument()
  })

  it('hides past slots and the current one', async () => {
    search.mockResolvedValue([
      slot('av-past', inHours(-1)),
      slot('av-old', appointment.startTime),
      slot('av-new', inHours(72), AppointmentMode.VIRTUAL),
    ])
    renderModal()

    const chips = await screen.findAllByRole('button', { name: /·/ })
    expect(chips).toHaveLength(1)
    expect(chips[0]).toHaveTextContent('Virtual')
  })

  it('shows before and after, confirms and returns the moved appointment', async () => {
    const newSlot = slot('av-new', inHours(72), AppointmentMode.VIRTUAL)
    search.mockResolvedValue([newSlot])
    reschedule.mockResolvedValue({} as Appointment)
    renderModal()

    const confirm = screen.getByRole('button', { name: 'Confirmar nuevo horario' })
    expect(confirm).toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: /Virtual/ }))
    expect(confirm).toBeEnabled()
    await userEvent.click(confirm)

    expect(reschedule).toHaveBeenCalledWith('appt-1', 'av-new')
    expect(onRescheduled).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'appt-1',
        availabilityId: 'av-new',
        startTime: newSlot.startTime,
        mode: AppointmentMode.VIRTUAL,
      }),
    )
  })

  it('shows a clear message and reloads slots when the slot was just taken', async () => {
    search.mockResolvedValue([slot('av-new', inHours(72))])
    reschedule.mockRejectedValue({ response: { status: 409, data: { message: 'x' } } })
    renderModal()

    await userEvent.click(await screen.findByRole('button', { name: /Presencial/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar nuevo horario' }))

    expect(await screen.findByText(MESSAGES.RESCHEDULE_SLOT_TAKEN)).toBeInTheDocument()
    expect(search).toHaveBeenCalledTimes(2)
    expect(onRescheduled).not.toHaveBeenCalled()
  })
})
