import React from 'react'
import { render, screen } from '@testing-library/react'
import Protected from '../../pages/Protected'
import { AuthContext } from '../../context/AuthContext'
import { ResumeContext } from '../../context/ResumeContext'

const navigateMock = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}))

beforeEach(() => {
  navigateMock.mockClear()
})

test('Protected page - shows loading when auth is loading', () => {
    render(
      <AuthContext.Provider value={{ user: null, loading: true }}>
        <Protected />
      </AuthContext.Provider>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

test('Protected page - navigates to login when user is null and not loading', () => {
    render(
      <AuthContext.Provider value={{ user: null, loading: false }}>
        <Protected />
      </AuthContext.Provider>
    )

    expect(navigateMock).toHaveBeenCalledWith('/login')
  })

test('Protected page - protected renders dashboard when user exists', () => {
    render(
      <AuthContext.Provider value={{ user: { name: 'Test' }, loading: false }}>
        <ResumeContext.Provider value={{ selectedResume: null, setSelectedResume: vi.fn() }}>
          <Protected />
        </ResumeContext.Provider>
      </AuthContext.Provider>
    )

    expect(screen.getByText(/welcome,/i)).toBeInTheDocument()
    expect(screen.getByText(/test/i)).toBeInTheDocument()
  })

test('Protected page - does not navigate when user exists', () => {
    navigateMock.mockClear()
    render(
      <AuthContext.Provider value={{ user: { name: 'Stay' }, loading: false }}>
        <ResumeContext.Provider value={{ selectedResume: null, setSelectedResume: vi.fn() }}>
          <Protected />
        </ResumeContext.Provider>
      </AuthContext.Provider>
    )
    expect(navigateMock).not.toHaveBeenCalled()
  })
