import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'
import { authService } from '../services/auth'
import type { UserRole } from '../types'

vi.mock('../services/auth', () => ({
  authService: {
    getAccessToken: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    setTokens: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}))

const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  firstName: 'Juan',
  lastName: 'Pérez',
  role: 'PATIENT' as UserRole,
}

// Helper component to access context values
function TestConsumer({ onRender }: { onRender: (ctx: ReturnType<typeof useAuth>) => void }) {
  const ctx = useAuth()
  onRender(ctx)
  return (
    <div>
      <span data-testid="loading">{String(ctx.isLoading)}</span>
      <span data-testid="authenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="user">{ctx.user ? ctx.user.email : 'null'}</span>
      <button onClick={() => ctx.login('test@test.com', 'pw')}>Login</button>
      <button onClick={() => ctx.logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('useAuth outside provider', () => {
    it('should throw when used outside AuthProvider', () => {
      // Suppress console.error for expected error
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestConsumer onRender={() => {}} />)
      }).toThrow('useAuth must be used within an AuthProvider')

      spy.mockRestore()
    })
  })

  describe('initialization', () => {
    it('should start with isLoading true then resolve to false', async () => {
      vi.mocked(authService.getAccessToken).mockReturnValue(null)

      const states: boolean[] = []

      render(
        <AuthProvider>
          <TestConsumer onRender={(ctx) => states.push(ctx.isLoading)} />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })
    })

    it('should restore user from localStorage when token exists', async () => {
      vi.mocked(authService.getAccessToken).mockReturnValue('valid-token')
      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
      localStorage.setItem('user', JSON.stringify(mockUser))

      render(
        <AuthProvider>
          <TestConsumer onRender={() => {}} />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@test.com')
        expect(screen.getByTestId('authenticated').textContent).toBe('true')
      })
    })

    it('should not restore user when no token', async () => {
      vi.mocked(authService.getAccessToken).mockReturnValue(null)
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)
      localStorage.setItem('user', JSON.stringify(mockUser))

      render(
        <AuthProvider>
          <TestConsumer onRender={() => {}} />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('null')
        expect(screen.getByTestId('authenticated').textContent).toBe('false')
      })
    })

    it('should handle invalid JSON in localStorage gracefully', async () => {
      vi.mocked(authService.getAccessToken).mockReturnValue('valid-token')
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)
      localStorage.setItem('user', 'invalid-json{{{')

      render(
        <AuthProvider>
          <TestConsumer onRender={() => {}} />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('null')
      })
      expect(authService.logout).toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('should call authService.login and store user on success', async () => {
      vi.mocked(authService.getAccessToken).mockReturnValue(null)
      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
      vi.mocked(authService.login).mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        user: mockUser,
      })

      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestConsumer onRender={() => {}} />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })

      await user.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@test.com')
        expect(screen.getByTestId('authenticated').textContent).toBe('true')
      })

      expect(authService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pw' })
      expect(authService.setTokens).toHaveBeenCalledWith('new-token', 'new-refresh')
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
    })

    it('should throw error on login failure', async () => {
      vi.mocked(authService.getAccessToken).mockReturnValue(null)
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))

      let loginError: Error | null = null

      function ErrorTestConsumer() {
        const { login, isLoading } = useAuth()
        return (
          <div>
            <span data-testid="loading">{String(isLoading)}</span>
            <button
              onClick={async () => {
                try {
                  await login('bad@test.com', 'wrong')
                } catch (e) {
                  loginError = e as Error
                }
              }}
            >
              Login
            </button>
          </div>
        )
      }

      const user = userEvent.setup()

      render(
        <AuthProvider>
          <ErrorTestConsumer />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      })

      await user.click(screen.getByText('Login'))

      await waitFor(() => {
        expect(loginError).not.toBeNull()
        expect(loginError!.message).toBe('Invalid credentials')
      })
    })
  })

  describe('logout', () => {
    it('should clear user state and localStorage', async () => {
      vi.mocked(authService.getAccessToken).mockReturnValue('token')
      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
      vi.mocked(authService.logout).mockResolvedValue(undefined)
      localStorage.setItem('user', JSON.stringify(mockUser))

      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestConsumer onRender={() => {}} />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@test.com')
      })

      await user.click(screen.getByText('Logout'))

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('null')
      })
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('should clear local state even if server logout fails', async () => {
      vi.mocked(authService.getAccessToken).mockReturnValue('token')
      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
      vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'))
      localStorage.setItem('user', JSON.stringify(mockUser))

      const user = userEvent.setup()

      render(
        <AuthProvider>
          <TestConsumer onRender={() => {}} />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@test.com')
      })

      await user.click(screen.getByText('Logout'))

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('null')
      })
      expect(localStorage.getItem('user')).toBeNull()
    })
  })
})
