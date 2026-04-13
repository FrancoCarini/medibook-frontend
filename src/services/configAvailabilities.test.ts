import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configAvailabilitiesService } from './configAvailabilities'
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
const mockDelete = vi.mocked(apiService.delete)

describe('configAvailabilitiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should call POST /config-availabilities', async () => {
      const createData = {
        doctorId: 'doc-1',
        specialtyId: 'spec-1',
        mode: 'IN_PERSON' as any,
        startDate: '2026-04-01',
        endDate: '2026-06-30',
        startHour: '09:00',
        endHour: '17:00',
        durationMinutes: 30,
        daysOfWeek: [1, 2, 3, 4, 5],
      }
      mockPost.mockResolvedValue({ id: 'cfg-1', ...createData })

      const result = await configAvailabilitiesService.create(createData)

      expect(mockPost).toHaveBeenCalledWith('/config-availabilities', createData)
      expect(result.id).toBe('cfg-1')
    })
  })

  describe('getAll', () => {
    it('should call GET /config-availabilities', async () => {
      mockGet.mockResolvedValue([{ id: 'cfg-1' }, { id: 'cfg-2' }])

      const result = await configAvailabilitiesService.getAll()

      expect(mockGet).toHaveBeenCalledWith('/config-availabilities')
      expect(result).toHaveLength(2)
    })
  })

  describe('getById', () => {
    it('should call GET /config-availabilities/:id', async () => {
      mockGet.mockResolvedValue({ id: 'cfg-1' })

      const result = await configAvailabilitiesService.getById('cfg-1')

      expect(mockGet).toHaveBeenCalledWith('/config-availabilities/cfg-1')
      expect(result.id).toBe('cfg-1')
    })
  })

  describe('update', () => {
    it('should call PATCH /config-availabilities/:id', async () => {
      mockPatch.mockResolvedValue({ id: 'cfg-1', durationMinutes: 45 })

      const result = await configAvailabilitiesService.update('cfg-1', { durationMinutes: 45 })

      expect(mockPatch).toHaveBeenCalledWith('/config-availabilities/cfg-1', { durationMinutes: 45 })
      expect(result.durationMinutes).toBe(45)
    })
  })

  describe('delete', () => {
    it('should call DELETE /config-availabilities/:id', async () => {
      mockDelete.mockResolvedValue(undefined)

      await configAvailabilitiesService.delete('cfg-1')

      expect(mockDelete).toHaveBeenCalledWith('/config-availabilities/cfg-1')
    })
  })

  describe('getAppointmentsCount', () => {
    it('should call GET /config-availabilities/:id/appointments-count', async () => {
      mockGet.mockResolvedValue({ count: 5 })

      const result = await configAvailabilitiesService.getAppointmentsCount('cfg-1')

      expect(mockGet).toHaveBeenCalledWith('/config-availabilities/cfg-1/appointments-count')
      expect(result.count).toBe(5)
    })
  })
})
