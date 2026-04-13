import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UIProvider, useUI } from './UIContext'

function TestConsumer() {
  const { showSuccess, showError, showWarning, showInfo, showSnackbar } = useUI()
  return (
    <div>
      <button onClick={() => showSuccess('Operación exitosa')}>Success</button>
      <button onClick={() => showError('Algo salió mal')}>Error</button>
      <button onClick={() => showWarning('Cuidado')}>Warning</button>
      <button onClick={() => showInfo('Información')}>Info</button>
      <button onClick={() => showSnackbar('Mensaje personalizado', 'success', 2000)}>Custom</button>
    </div>
  )
}

describe('UIContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useUI outside provider', () => {
    it('should throw when used outside UIProvider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestConsumer />)
      }).toThrow('useUI must be used within a UIProvider')

      spy.mockRestore()
    })
  })

  describe('showSuccess', () => {
    it('should display success snackbar', async () => {
      const user = userEvent.setup()

      render(
        <UIProvider>
          <TestConsumer />
        </UIProvider>,
      )

      await user.click(screen.getByText('Success'))

      await waitFor(() => {
        expect(screen.getByText('Operación exitosa')).toBeInTheDocument()
      })
    })
  })

  describe('showError', () => {
    it('should display error snackbar', async () => {
      const user = userEvent.setup()

      render(
        <UIProvider>
          <TestConsumer />
        </UIProvider>,
      )

      await user.click(screen.getByText('Error'))

      await waitFor(() => {
        expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
      })
    })
  })

  describe('showWarning', () => {
    it('should display warning snackbar', async () => {
      const user = userEvent.setup()

      render(
        <UIProvider>
          <TestConsumer />
        </UIProvider>,
      )

      await user.click(screen.getByText('Warning'))

      await waitFor(() => {
        expect(screen.getByText('Cuidado')).toBeInTheDocument()
      })
    })
  })

  describe('showInfo', () => {
    it('should display info snackbar', async () => {
      const user = userEvent.setup()

      render(
        <UIProvider>
          <TestConsumer />
        </UIProvider>,
      )

      await user.click(screen.getByText('Info'))

      await waitFor(() => {
        expect(screen.getByText('Información')).toBeInTheDocument()
      })
    })
  })

  describe('showSnackbar', () => {
    it('should display snackbar with custom params', async () => {
      const user = userEvent.setup()

      render(
        <UIProvider>
          <TestConsumer />
        </UIProvider>,
      )

      await user.click(screen.getByText('Custom'))

      await waitFor(() => {
        expect(screen.getByText('Mensaje personalizado')).toBeInTheDocument()
      })
    })
  })
})
