import { describe, it, expect } from 'vitest'
import { getRoleLabel } from './roles'
import { UserRole } from '../types'

describe('getRoleLabel', () => {
  it.each([
    [UserRole.PATIENT, 'Paciente'],
    [UserRole.DOCTOR, 'Médico'],
    [UserRole.CLIENT_ADMIN, 'Admin. de Cliente'],
    [UserRole.ADMIN, 'Administrador'],
  ])('%s → %s', (role, label) => {
    expect(getRoleLabel(role)).toBe(label)
  })
})
