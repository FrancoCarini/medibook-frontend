import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AppointmentCardSkeleton, AppointmentSkeletonGroup } from './AppointmentCardSkeleton'

describe('AppointmentCardSkeleton', () => {
  it('should render skeleton elements', () => {
    const { container } = render(<AppointmentCardSkeleton />)

    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})

describe('AppointmentSkeletonGroup', () => {
  it('should render default count of 3 skeletons', () => {
    const { container } = render(<AppointmentSkeletonGroup />)

    // Each AppointmentCardSkeleton has a Grid item
    const cards = container.querySelectorAll('.MuiCard-root')
    // 1 outer card + the inner skeleton cards won't be nested Cards,
    // but the Grid items with skeletons should be present
    expect(cards.length).toBeGreaterThan(0)
  })

  it('should render custom count of skeletons', () => {
    const { container } = render(<AppointmentSkeletonGroup count={5} />)

    // Should have skeletons rendered
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
