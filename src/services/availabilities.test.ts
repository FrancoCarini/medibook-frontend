import { describe, it, expect, vi, beforeEach } from 'vitest'
import { availabilitiesService } from './availabilities'
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

describe('availabilitiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should call POST /availabilities with data', async () => {
      const createData = {
        doctorId: 'doc-1',
        specialtyId: 'spec-1',
        mode: 'IN_PERSON' as any,
        startTime: '2026-04-10T09:00:00Z',
        endTime: '2026-04-10T10:00:00Z',
        durationMinutes: 30,
      }
      mockPost.mockResolvedValue({ id: 'av-1', ...createData })

      const result = await availabilitiesService.create(createData)

      expect(mockPost).toHaveBeenCalledWith('/availabilities', createData)
      expect(result.id).toBe('av-1')
    })
  })

  describe('search', () => {
    it('should call GET /availabilities/search with query params', async () => {
      mockGet.mockResolvedValue({ data: [{ id: 'av-1' }], pagination: {} })

      const result = await availabilitiesService.search({
        doctorId: 'doc-1',
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      })

      const calledUrl = mockGet.mock.calls[0][0]
      expect(calledUrl).toContain('doctorId=doc-1')
      expect(calledUrl).toContain('startDate=2026-04-01')
      expect(calledUrl).toContain('endDate=2026-04-30')
      expect(result).toEqual([{ id: 'av-1' }])
    })

    it('should skip null/undefined params', async () => {
      mockGet.mockResolvedValue({ data: [], pagination: {} })

      await availabilitiesService.search({ doctorId: 'doc-1', specialtyId: undefined })

      const calledUrl = mockGet.mock.calls[0][0]
      expect(calledUrl).toContain('doctorId=doc-1')
      expect(calledUrl).not.toContain('specialtyId')
    })
  })

  describe('getById', () => {
    it('should call GET /availabilities/:id', async () => {
      mockGet.mockResolvedValue({ id: 'av-1' })

      const result = await availabilitiesService.getById('av-1')

      expect(mockGet).toHaveBeenCalledWith('/availabilities/av-1')
      expect(result.id).toBe('av-1')
    })
  })

  describe('update', () => {
    it('should call PATCH /availabilities/:id with data', async () => {
      mockPatch.mockResolvedValue({ id: 'av-1', status: 'CANCELLED' })

      const result = await availabilitiesService.update('av-1', { status: 'CANCELLED' as any })

      expect(mockPatch).toHaveBeenCalledWith('/availabilities/av-1', { status: 'CANCELLED' })
      expect(result.status).toBe('CANCELLED')
    })
  })

  describe('delete', () => {
    it('should call DELETE /availabilities/:id', async () => {
      mockDelete.mockResolvedValue(undefined)

      await availabilitiesService.delete('av-1')

      expect(mockDelete).toHaveBeenCalledWith('/availabilities/av-1')
    })
  })
})
