import { describe, it, expect, vi, beforeEach } from 'vitest'
import { specialtiesService } from './specialties'
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

describe('specialtiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSpecialties', () => {
    it('should call GET /specialties', async () => {
      const mockSpecs = [
        { id: 'spec-1', name: 'Cardiología' },
        { id: 'spec-2', name: 'Dermatología' },
      ]
      mockGet.mockResolvedValue(mockSpecs)

      const result = await specialtiesService.getSpecialties()

      expect(mockGet).toHaveBeenCalledWith('/specialties')
      expect(result).toHaveLength(2)
    })
  })

  describe('createSpecialty', () => {
    it('should call POST /specialties with name', async () => {
      mockPost.mockResolvedValue({ id: 'spec-3', name: 'Pediatría' })

      const result = await specialtiesService.createSpecialty({ name: 'Pediatría' })

      expect(mockPost).toHaveBeenCalledWith('/specialties', { name: 'Pediatría' })
      expect(result.name).toBe('Pediatría')
    })
  })

  describe('getDoctorsBySpecialty', () => {
    it('should call GET /specialties/:id/doctors', async () => {
      const mockDoctors = [{ id: 'doc-1', user: { firstName: 'Carlos' } }]
      mockGet.mockResolvedValue(mockDoctors)

      const result = await specialtiesService.getDoctorsBySpecialty('spec-1')

      expect(mockGet).toHaveBeenCalledWith('/specialties/spec-1/doctors')
      expect(result).toHaveLength(1)
    })
  })
})
