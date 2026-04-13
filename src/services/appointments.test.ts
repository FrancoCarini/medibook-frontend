import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appointmentsService } from './appointments'
import { apiService } from './api'

vi.mock('./api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockGet = vi.mocked(apiService.get)
const mockPost = vi.mocked(apiService.post)
const mockPatch = vi.mocked(apiService.patch)

describe('appointmentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should call POST /appointments with availability id', async () => {
      const mockAppointment = { id: 'apt-1', availabilityId: 'av-1' }
      mockPost.mockResolvedValue(mockAppointment)

      const result = await appointmentsService.create({ availabilityId: 'av-1' })

      expect(mockPost).toHaveBeenCalledWith('/appointments', { availabilityId: 'av-1' })
      expect(result).toEqual(mockAppointment)
    })

    it('should include patientId when provided', async () => {
      mockPost.mockResolvedValue({ id: 'apt-1' })

      await appointmentsService.create({ availabilityId: 'av-1', patientId: 'patient-1' })

      expect(mockPost).toHaveBeenCalledWith('/appointments', {
        availabilityId: 'av-1',
        patientId: 'patient-1',
      })
    })
  })

  describe('cancel', () => {
    it('should call PATCH /appointments/:id/cancel', async () => {
      mockPatch.mockResolvedValue({ id: 'apt-1', status: 'CANCELLED' })

      const result = await appointmentsService.cancel('apt-1')

      expect(mockPatch).toHaveBeenCalledWith('/appointments/apt-1/cancel')
      expect(result.status).toBe('CANCELLED')
    })
  })

  describe('complete', () => {
    it('should call PATCH /appointments/:id/complete', async () => {
      mockPatch.mockResolvedValue({ id: 'apt-1', status: 'COMPLETED' })

      const result = await appointmentsService.complete('apt-1')

      expect(mockPatch).toHaveBeenCalledWith('/appointments/apt-1/complete')
      expect(result.status).toBe('COMPLETED')
    })
  })

  describe('search', () => {
    it('should call GET /appointments with query params', async () => {
      const mockResponse = {
        data: [{ id: 'apt-1' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await appointmentsService.search({
        clientId: 'client-1',
        status: 'BOOKED' as any,
        page: 1,
        limit: 10,
      })

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('/appointments?'),
      )
      const calledUrl = mockGet.mock.calls[0][0]
      expect(calledUrl).toContain('clientId=client-1')
      expect(calledUrl).toContain('status=BOOKED')
      expect(calledUrl).toContain('page=1')
      expect(calledUrl).toContain('limit=10')
      expect(result.data).toHaveLength(1)
    })

    it('should skip undefined and empty params', async () => {
      mockGet.mockResolvedValue({ data: [], pagination: {} })

      await appointmentsService.search({ clientId: 'c-1', doctorId: undefined, status: '' as any })

      const calledUrl = mockGet.mock.calls[0][0]
      expect(calledUrl).toContain('clientId=c-1')
      expect(calledUrl).not.toContain('doctorId')
      expect(calledUrl).not.toContain('status')
    })
  })
})
