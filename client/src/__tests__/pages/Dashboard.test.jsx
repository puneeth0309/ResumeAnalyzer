import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from '../../pages/Dashboard/Dashboard'
import { AuthContext } from '../../context/AuthContext'
import { ResumeContext } from '../../context/ResumeContext'

const navigateMock = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}))

beforeEach(() => {
  navigateMock.mockClear()
})

test('Dashboard - renders welcome with user name and logout button calls logout', async () => {
    const logout = vi.fn()

    render(
      <AuthContext.Provider value={{ user: { name: 'Alice' }, logout }}>
        <ResumeContext.Provider value={{ selectedResume: null, setSelectedResume: vi.fn() }}>
          <Dashboard />
        </ResumeContext.Provider>
      </AuthContext.Provider>
    )

  expect(screen.getByText(/welcome,/i)).toBeInTheDocument()
  expect(screen.getByText(/alice/i)).toBeInTheDocument()

  const userMenuBtn = screen.getByRole('button', { name: /user menu/i })
  fireEvent.click(userMenuBtn)
  const menuLogout = await screen.findByRole('button', { name: /logout/i })
  fireEvent.click(menuLogout)
  const allLogout = await screen.findAllByRole('button', { name: /logout/i })
  const confirmLogout = allLogout[allLogout.length - 1]
  fireEvent.click(confirmLogout)
  expect(logout).toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith('/login')
  })

test('Dashboard - changes tabs when nav buttons clicked', () => {
    render(
      <AuthContext.Provider value={{ user: { name: 'Bob' }, logout: vi.fn() }}>
        <ResumeContext.Provider value={{ selectedResume: null, setSelectedResume: vi.fn() }}>
          <Dashboard />
        </ResumeContext.Provider>
      </AuthContext.Provider>
    )

  const jobsBtns = screen.getAllByRole('button', { name: /job matches/i })
  fireEvent.click(jobsBtns[0])
  expect(screen.getAllByText(/uploaded resumes/i).length).toBeGreaterThan(0)
  })

test('Dashboard - switches to resume upload tab when clicked', () => {
    render(
      <AuthContext.Provider value={{ user: { name: 'Bob' }, logout: vi.fn() }}>
        <ResumeContext.Provider value={{ selectedResume: null, setSelectedResume: vi.fn() }}>
          <Dashboard />
        </ResumeContext.Provider>
      </AuthContext.Provider>
    )

    const uploadBtn = screen.getByRole('button', { name: /resume upload/i })
    fireEvent.click(uploadBtn)
    expect(screen.getByText(/upload your resume/i)).toBeInTheDocument()
  })

test('Dashboard - updates localStorage when tab changes and logout clears stored keys', async () => {
    localStorage.setItem('activeTab', 'jobs')
    localStorage.setItem('selectedResume', JSON.stringify({ id: 123 }))

    const logout = vi.fn()

    render(
      <AuthContext.Provider value={{ user: { name: 'Alice' }, logout }}>
        <ResumeContext.Provider value={{ selectedResume: null, setSelectedResume: vi.fn() }}>
          <Dashboard />
        </ResumeContext.Provider>
      </AuthContext.Provider>
    )

  const jobsBtns = screen.getAllByRole('button', { name: /job matches/i })
  fireEvent.click(jobsBtns[0])
    expect(localStorage.getItem('activeTab')).toBe('jobs')

  const userMenuBtn = screen.getByRole('button', { name: /user menu/i })
  fireEvent.click(userMenuBtn)
  const menuLogout = await screen.findByRole('button', { name: /logout/i })
  fireEvent.click(menuLogout)
  const allLogout = await screen.findAllByRole('button', { name: /logout/i })
  const confirmLogout = allLogout[allLogout.length - 1]
  fireEvent.click(confirmLogout)
  expect(logout).toHaveBeenCalled()
    expect(localStorage.getItem('activeTab')).toBeNull()
    expect(localStorage.getItem('selectedResume')).toBeNull()
  })
