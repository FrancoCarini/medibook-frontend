import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ClientLoginPage } from './ClientLoginPage'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types'

vi.mock('../contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../contexts/UIContext', () => ({
  useUI: () => ({ showError: vi.fn(), showSuccess: vi.fn() }),
}))
vi.mock('../services/clients', () => ({
  clientsService: {
    getBySlug: vi.fn().mockResolvedValue({ id: 'c1', name: 'Clínica Smith', slug: 'dr-john-smith' }),
  },
}))

const mockUseAuth = vi.mocked(useAuth)

const user = (role: UserRole) => ({
  id: 'u1',
  email: 'u@test.com',
  firstName: 'Ana',
  lastName: 'López',
  role,
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dashboard" element={<div>Panel</div>} />
        <Route path="/:slug" element={<ClientLoginPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ClientLoginPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the clinic home with the patient label to a logged-in patient', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: user(UserRole.PATIENT) } as any)
    renderAt('/dr-john-smith')

    expect(await screen.findByText('Paciente')).toBeInTheDocument()
    expect(screen.queryByText('Panel')).not.toBeInTheDocument()
  })

  it.each([UserRole.DOCTOR, UserRole.CLIENT_ADMIN, UserRole.ADMIN])(
    'sends a logged-in %s to the dashboard',
    async (role) => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true, user: user(role) } as any)
      renderAt('/dr-john-smith')

      expect(await screen.findByText('Panel')).toBeInTheDocument()
    },
  )

  it('shows the login form when nobody is logged in', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, user: null, login: vi.fn() } as any)
    renderAt('/dr-john-smith')

    expect(await screen.findByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.queryByText('Panel')).not.toBeInTheDocument()
  })
})
