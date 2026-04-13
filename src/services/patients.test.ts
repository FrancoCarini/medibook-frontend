import { describe, it, expect, vi, beforeEach } from 'vitest'
import { patientsService } from './patients'
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

describe('patientsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMyClients', () => {
    it('should call GET /patients/my-clients', async () => {
      const mockClients = [
        { id: 'c-1', name: 'Clínica Norte', slug: 'clinica-norte' },
      ]
      mockGet.mockResolvedValue(mockClients)

      const result = await patientsService.getMyClients()

      expect(mockGet).toHaveBeenCalledWith('/patients/my-clients')
      expect(result).toHaveLength(1)
      expect(result[0].slug).toBe('clinica-norte')
    })
  })
})
