import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Profile from '../../pages/Dashboard/Profile'

vi.mock('../../api', () => ({
  default: { get: vi.fn() },
}))

import API from '../../api'

beforeEach(() => {
  vi.resetAllMocks()
})

test('Profile - shows user info when API returns user', async () => {
    API.get.mockResolvedValue({ data: { user: { name: 'Sam', email: 'sam@example.com', role: 'user' } } })

    render(<Profile />)

    await waitFor(() => expect(API.get).toHaveBeenCalledWith('/protected'))
  expect(screen.getByText(/sam@example.com/i)).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /sam/i })).toBeInTheDocument()
  })

test('Profile - shows loading UI while fetching profile', () => {
    const { container } = render(<Profile />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

test('Profile - handles API error and shows fallback loading UI', async () => {
    API.get.mockRejectedValueOnce(new Error('fail'))
    const { container } = render(<Profile />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

test('Profile - calls API.get exactly once when rendering profile', async () => {
    API.get.mockResolvedValueOnce({ data: { user: { name: 'Sam', email: 'sam@example.com', role: 'user' } } })
    render(<Profile />)
    await waitFor(() => expect(API.get).toHaveBeenCalledTimes(1))
    expect(await screen.findByText(/sam@example.com/i)).toBeInTheDocument()
  })

