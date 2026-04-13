import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { UserRole } from '../types'

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderWithRouter(ui: React.ReactElement, { initialEntries = ['/'] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        <Route path="/clinica-norte" element={<div>Client Login Page</div>} />
        <Route path="/*" element={ui} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading spinner when isLoading is true', () => {
    mockUseAuth.mockReturnValue({ isLoading: true, isAuthenticated: false, user: null })

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should redirect to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false, user: null })

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should redirect to /:slug when not authenticated on slug route', () => {
    mockUseAuth.mockReturnValue({ isLoading: false, isAuthenticated: false, user: null })

    render(
      <MemoryRouter initialEntries={['/clinica-norte/book-appointment']}>
        <Routes>
          <Route path="/clinica-norte" element={<div>Client Login Page</div>} />
          <Route
            path="/clinica-norte/book-appointment"
            element={
              <ProtectedRoute>
                <div>Book Appointment</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Client Login Page')).toBeInTheDocument()
  })

  it('should render children when authenticated with no role requirement', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '1', role: UserRole.PATIENT },
    })

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should render children when user has requiredRole', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '1', role: UserRole.ADMIN },
    })

    renderWithRouter(
      <ProtectedRoute requiredRole={UserRole.ADMIN}>
        <div>Admin Content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('should redirect to /unauthorized when user lacks requiredRole', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '1', role: UserRole.PATIENT },
    })

    renderWithRouter(
      <ProtectedRoute requiredRole={UserRole.ADMIN}>
        <div>Admin Content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('should render children when user role is in allowedRoles', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '1', role: UserRole.DOCTOR },
    })

    renderWithRouter(
      <ProtectedRoute allowedRoles={[UserRole.DOCTOR, UserRole.ADMIN]}>
        <div>Doctor Content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Doctor Content')).toBeInTheDocument()
  })

  it('should redirect to /unauthorized when user role not in allowedRoles', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '1', role: UserRole.PATIENT },
    })

    renderWithRouter(
      <ProtectedRoute allowedRoles={[UserRole.DOCTOR, UserRole.ADMIN]}>
        <div>Doctor Content</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument()
  })
})
