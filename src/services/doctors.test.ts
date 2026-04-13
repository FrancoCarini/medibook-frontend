import { describe, it, expect, vi, beforeEach } from 'vitest'
import { doctorsService } from './doctors'
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
const mockDelete = vi.mocked(apiService.delete)

describe('doctorsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSpecialties', () => {
    it('should call GET /doctors/:id/specialties', async () => {
      const mockSpecialties = [{ id: 'spec-1', name: 'Cardiología' }]
      mockGet.mockResolvedValue(mockSpecialties)

      const result = await doctorsService.getSpecialties('doc-1')

      expect(mockGet).toHaveBeenCalledWith('/doctors/doc-1/specialties')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Cardiología')
    })
  })

  describe('assignSpecialty', () => {
    it('should call POST /doctors/:id/specialties', async () => {
      mockPost.mockResolvedValue(undefined)

      await doctorsService.assignSpecialty('doc-1', 'spec-2')

      expect(mockPost).toHaveBeenCalledWith('/doctors/doc-1/specialties', {
        specialtyId: 'spec-2',
      })
    })
  })

  describe('removeSpecialty', () => {
    it('should call DELETE /doctors/:id/specialties/:specId', async () => {
      mockDelete.mockResolvedValue(undefined)

      await doctorsService.removeSpecialty('doc-1', 'spec-1')

      expect(mockDelete).toHaveBeenCalledWith('/doctors/doc-1/specialties/spec-1')
    })
  })
})
