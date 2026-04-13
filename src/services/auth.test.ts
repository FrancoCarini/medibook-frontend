import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './auth'
import { apiService } from './api'

vi.mock('./api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockPost = vi.mocked(apiService.post)

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('login', () => {
    it('should call POST /auth/login with credentials', async () => {
      const mockResponse = { accessToken: 'token', user: { id: '1' } }
      mockPost.mockResolvedValue(mockResponse)

      const result = await authService.login({ email: 'test@test.com', password: '123456' })

      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: '123456',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('refresh', () => {
    it('should call POST /auth/refresh', async () => {
      mockPost.mockResolvedValue({ accessToken: 'new-token' })

      const result = await authService.refresh()

      expect(mockPost).toHaveBeenCalledWith('/auth/refresh')
      expect(result.accessToken).toBe('new-token')
    })
  })

  describe('logout', () => {
    it('should call POST /auth/logout and clear tokens', async () => {
      localStorage.setItem('accessToken', 'token')
      localStorage.setItem('refreshToken', 'refresh')
      mockPost.mockResolvedValue(undefined)

      await authService.logout()

      expect(mockPost).toHaveBeenCalledWith('/auth/logout')
      expect(localStorage.getItem('accessToken')).toBeNull()
      expect(localStorage.getItem('refreshToken')).toBeNull()
    })
  })

  describe('register', () => {
    it('should call POST /auth/register with data', async () => {
      const registerData = {
        email: 'new@test.com',
        password: '123456',
        firstName: 'Juan',
        lastName: 'Pérez',
      }
      const mockResponse = { message: 'Check your email' }
      mockPost.mockResolvedValue(mockResponse)

      const result = await authService.register(registerData)

      expect(mockPost).toHaveBeenCalledWith('/auth/register', registerData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('createUser', () => {
    it('should call POST /users with user data', async () => {
      const userData = {
        email: 'doc@test.com',
        password: 'pw',
        firstName: 'Carlos',
        lastName: 'García',
        role: 'DOCTOR' as const,
      }
      const mockUser = { id: '1', ...userData }
      mockPost.mockResolvedValue(mockUser)

      const result = await authService.createUser(userData)

      expect(mockPost).toHaveBeenCalledWith('/users', userData)
      expect(result).toEqual(mockUser)
    })
  })

  describe('forgotPassword', () => {
    it('should call POST /auth/forgot-password', async () => {
      mockPost.mockResolvedValue({ message: 'Email sent' })

      const result = await authService.forgotPassword('test@test.com')

      expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@test.com' })
      expect(result.message).toBe('Email sent')
    })
  })

  describe('resetPassword', () => {
    it('should call POST /auth/reset-password', async () => {
      mockPost.mockResolvedValue({ message: 'Password reset' })

      const result = await authService.resetPassword('token-123', 'newpass')

      expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'token-123',
        password: 'newpass',
      })
      expect(result.message).toBe('Password reset')
    })
  })

  describe('token management', () => {
    it('should set and get tokens', () => {
      authService.setTokens('access-123', 'refresh-456')

      expect(authService.getAccessToken()).toBe('access-123')
      expect(authService.getRefreshToken()).toBe('refresh-456')
    })

    it('should return null when no tokens', () => {
      expect(authService.getAccessToken()).toBeNull()
      expect(authService.getRefreshToken()).toBeNull()
    })

    it('should check authentication status', () => {
      expect(authService.isAuthenticated()).toBe(false)

      localStorage.setItem('accessToken', 'token')
      expect(authService.isAuthenticated()).toBe(true)
    })
  })
})
