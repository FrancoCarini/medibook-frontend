import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clientsService } from './clients'
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

describe('clientsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should call GET /clients', async () => {
      const mockClients = [
        { id: 'c-1', name: 'Clínica Norte', slug: 'clinica-norte' },
        { id: 'c-2', name: 'Clínica Sur', slug: 'clinica-sur' },
      ]
      mockGet.mockResolvedValue(mockClients)

      const result = await clientsService.getAll()

      expect(mockGet).toHaveBeenCalledWith('/clients')
      expect(result).toHaveLength(2)
    })
  })

  describe('getBySlug', () => {
    it('should call GET /clients/:slug', async () => {
      const mockClient = { id: 'c-1', name: 'Clínica Norte', slug: 'clinica-norte' }
      mockGet.mockResolvedValue(mockClient)

      const result = await clientsService.getBySlug('clinica-norte')

      expect(mockGet).toHaveBeenCalledWith('/clients/clinica-norte')
      expect(result.slug).toBe('clinica-norte')
    })
  })

  describe('create', () => {
    it('should call POST /clients with name and slug', async () => {
      const data = { name: 'Nueva Clínica', slug: 'nueva-clinica' }
      mockPost.mockResolvedValue({ id: 'c-3', ...data })

      const result = await clientsService.create(data)

      expect(mockPost).toHaveBeenCalledWith('/clients', data)
      expect(result.name).toBe('Nueva Clínica')
    })
  })
})
