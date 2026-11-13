import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { ClientLoginPage } from './ClientLoginPage'
import { authService } from '../services/auth'
import { clientsService } from '../services/clients'
import { translate } from '../utils/messages'

const login = vi.fn()
const showError = vi.fn()

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login, isAuthenticated: false, user: null }),
}))
vi.mock('../contexts/UIContext', () => ({
  useUI: () => ({ showError, showSuccess: vi.fn() }),
}))
vi.mock('../services/auth', () => ({
  authService: { resendVerification: vi.fn() },
}))
vi.mock('../services/clients', () => ({
  clientsService: { getBySlug: vi.fn() },
}))

const resendVerification = vi.mocked(authService.resendVerification)
const RESEND = { name: 'Reenviar mail de verificación' }

// The api interceptor translates backend messages before they reach the page.
const apiError = (backendMessage: string) => ({
  response: { data: { message: translate(backendMessage) } },
})

const fillAndSubmit = async (email: string) => {
  await userEvent.type(screen.getByLabelText(/Email/), email)
  await userEvent.type(screen.getByLabelText(/Contraseña/), 'secret')
  await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
}

beforeEach(() => {
  login.mockReset()
  showError.mockReset()
  resendVerification.mockReset().mockResolvedValue({ message: 'ok' })
})

describe('LoginPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

  it('offers resending the email when the account is not verified', async () => {
    login.mockRejectedValue(apiError('Email not verified. Please check your inbox.'))
    renderPage()

    await fillAndSubmit('jane@test.com')
    await userEvent.click(await screen.findByRole('button', RESEND))

    expect(resendVerification).toHaveBeenCalledWith('jane@test.com', undefined)
  })

  it('does not offer resending for other login errors', async () => {
    login.mockRejectedValue(apiError('Invalid credentials'))
    renderPage()

    await fillAndSubmit('jane@test.com')

    expect(showError).toHaveBeenCalled()
    expect(screen.queryByRole('button', RESEND)).not.toBeInTheDocument()
  })

  it('hides the resend button when the email is changed', async () => {
    login.mockRejectedValue(apiError('Email not verified. Please check your inbox.'))
    renderPage()

    await fillAndSubmit('jane@test.com')
    await screen.findByRole('button', RESEND)
    await userEvent.type(screen.getByLabelText(/Email/), 'x')

    expect(screen.queryByRole('button', RESEND)).not.toBeInTheDocument()
  })
})

describe('ClientLoginPage', () => {
  it("resends the email with the clinic's slug", async () => {
    vi.mocked(clientsService.getBySlug).mockResolvedValue({ name: 'Clínica Norte' } as any)
    login.mockRejectedValue(apiError('Email not verified. Please check your inbox.'))
    render(
      <MemoryRouter initialEntries={['/clinica-norte']}>
        <Routes>
          <Route path="/:slug" element={<ClientLoginPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await screen.findByText('Clínica Norte')
    await fillAndSubmit('jane@test.com')
    await userEvent.click(await screen.findByRole('button', RESEND))

    expect(resendVerification).toHaveBeenCalledWith('jane@test.com', 'clinica-norte')
  })
})
