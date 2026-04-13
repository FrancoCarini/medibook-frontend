import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usersService } from './users'
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

describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDoctors', () => {
    it('should call GET /users/doctors', async () => {
      const mockDoctors = [{ id: 'doc-1' }]
      mockGet.mockResolvedValue(mockDoctors)

      const result = await usersService.getDoctors()

      expect(mockGet).toHaveBeenCalledWith('/users/doctors')
      expect(result).toHaveLength(1)
    })
  })

  describe('createUser', () => {
    it('should call POST /users for admin', async () => {
      const userData = {
        email: 'admin@test.com',
        password: 'pw',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN' as const,
      }
      mockPost.mockResolvedValue({ id: 'u-1', ...userData })

      const result = await usersService.createUser(userData)

      expect(mockPost).toHaveBeenCalledWith('/users', userData)
      expect(result.email).toBe('admin@test.com')
    })

    it('should include doctorData when role is DOCTOR', async () => {
      const userData = {
        email: 'doc@test.com',
        password: 'pw',
        firstName: 'Carlos',
        lastName: 'García',
        role: 'DOCTOR' as const,
        doctorData: {
          licenseNumber: 'LIC-001',
          title: 'Dr.',
          clientId: 'client-1',
          specialtyIds: ['spec-1'],
        },
      }
      mockPost.mockResolvedValue({ id: 'u-1' })

      await usersService.createUser(userData)

      expect(mockPost).toHaveBeenCalledWith('/users', userData)
    })

    it('should include clientAdminData when role is CLIENT_ADMIN', async () => {
      const userData = {
        email: 'ca@test.com',
        password: 'pw',
        firstName: 'Admin',
        lastName: 'Client',
        role: 'CLIENT_ADMIN' as const,
        clientAdminData: { clientId: 'client-1' },
      }
      mockPost.mockResolvedValue({ id: 'u-1' })

      await usersService.createUser(userData)

      expect(mockPost).toHaveBeenCalledWith('/users', userData)
    })
  })

  describe('searchPatients', () => {
    it('should call GET /users/patients with encoded search param', async () => {
      mockGet.mockResolvedValue([{ id: 'p-1', firstName: 'María' }])

      const result = await usersService.searchPatients('María')

      expect(mockGet).toHaveBeenCalledWith('/users/patients?search=Mar%C3%ADa')
      expect(result).toHaveLength(1)
    })
  })
})
