import { StrictMode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { VerifyEmailPage } from './VerifyEmailPage'
import { authService } from '../services/auth'
import { MESSAGES, translate } from '../utils/messages'

vi.mock('../services/auth', () => ({
  authService: { verifyEmail: vi.fn() },
}))

const verifyEmail = vi.mocked(authService.verifyEmail)

// The api interceptor translates backend messages before they reach the page.
const apiError = (backendMessage: string) => ({
  response: { data: { message: translate(backendMessage) } },
})

const renderAt = (url: string) =>
  render(
    <StrictMode>
      <MemoryRouter initialEntries={[url]}>
        <VerifyEmailPage />
      </MemoryRouter>
    </StrictMode>,
  )

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    verifyEmail.mockReset()
  })

  it('verifies the token once and links to the generic login', async () => {
    verifyEmail.mockResolvedValue({ message: 'Email verified' })

    renderAt('/verify-email?token=tok-1')

    expect(screen.getByText(MESSAGES.VERIFY_EMAIL_LOADING)).toBeInTheDocument()
    expect(await screen.findByText(MESSAGES.VERIFY_EMAIL_SUCCESS)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
    expect(verifyEmail).toHaveBeenCalledTimes(1)
    expect(verifyEmail).toHaveBeenCalledWith('tok-1')
  })

  it("links to the clinic's login when the link carries a slug", async () => {
    verifyEmail.mockResolvedValue({ message: 'Email verified' })

    renderAt('/verify-email?token=tok-1&client=clinica-norte')

    expect(await screen.findByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute(
      'href',
      '/clinica-norte',
    )
  })

  it('treats an already verified account as success', async () => {
    verifyEmail.mockRejectedValue(apiError('Email is already verified'))

    renderAt('/verify-email?token=tok-1')

    expect(await screen.findByText(MESSAGES.VERIFY_EMAIL_ALREADY)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('shows an error for an invalid or expired token', async () => {
    verifyEmail.mockRejectedValue(apiError('Invalid or expired verification token'))

    renderAt('/verify-email?token=bad&client=clinica-norte')

    expect(await screen.findByText(MESSAGES.VERIFY_EMAIL_INVALID)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a iniciar sesión' })).toHaveAttribute(
      'href',
      '/clinica-norte',
    )
  })

  it('shows the error without calling the backend when there is no token', () => {
    renderAt('/verify-email')

    expect(screen.getByText(MESSAGES.VERIFY_EMAIL_INVALID)).toBeInTheDocument()
    expect(verifyEmail).not.toHaveBeenCalled()
  })
})
