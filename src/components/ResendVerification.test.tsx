import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResendVerification } from './ResendVerification'
import { authService } from '../services/auth'
import { MESSAGES } from '../utils/messages'

vi.mock('../services/auth', () => ({
  authService: { resendVerification: vi.fn() },
}))

const resendVerification = vi.mocked(authService.resendVerification)
const BUTTON = { name: 'Reenviar mail de verificación' }

describe('ResendVerification', () => {
  beforeEach(() => {
    resendVerification.mockReset()
  })

  it('asks for the email when none is given and sends it with the clinic slug', async () => {
    resendVerification.mockResolvedValue({ message: 'ok' })
    render(<ResendVerification clientSlug="clinica-norte" />)

    expect(screen.getByRole('button', BUTTON)).toBeDisabled()
    await userEvent.type(screen.getByLabelText(/Email/), 'jane@test.com')
    await userEvent.click(screen.getByRole('button', BUTTON))

    expect(resendVerification).toHaveBeenCalledWith('jane@test.com', 'clinica-norte')
    expect(await screen.findByText(MESSAGES.RESEND_VERIFICATION_SENT)).toBeInTheDocument()
    expect(screen.queryByRole('button', BUTTON)).not.toBeInTheDocument()
  })

  it('uses the given email without showing the field', async () => {
    resendVerification.mockResolvedValue({ message: 'ok' })
    render(<ResendVerification email="jane@test.com" />)

    expect(screen.queryByLabelText(/Email/)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', BUTTON))

    expect(resendVerification).toHaveBeenCalledWith('jane@test.com', undefined)
  })

  it('shows an error and keeps the button when the request fails', async () => {
    resendVerification.mockRejectedValue(new Error('network'))
    render(<ResendVerification email="jane@test.com" />)

    await userEvent.click(screen.getByRole('button', BUTTON))

    expect(await screen.findByText(MESSAGES.RESEND_VERIFICATION_ERROR)).toBeInTheDocument()
    expect(screen.getByRole('button', BUTTON)).toBeEnabled()
  })
})
