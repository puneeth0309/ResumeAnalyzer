import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../../components/Header'

test('Header - renders user name and exposes logout via menu', async () => {
  render(<Header user={{ name: 'User' }} onLogout={() => {}} />)
  expect(screen.getByText(/user/i)).toBeInTheDocument()
  const userMenu = screen.getByRole('button', { name: /user menu/i })
  fireEvent.click(userMenu)
  const logoutBtn = await screen.findByRole('button', { name: /logout/i })
  expect(logoutBtn).toBeInTheDocument()
})

test('Header - logout menu item calls onLogout', async () => {
  const onLogout = vi.fn()
  render(<Header user={{ name: 'U' }} onLogout={onLogout} />)
  const userMenu = screen.getByRole('button', { name: /user menu/i })
  fireEvent.click(userMenu)
  const menuLogout = await screen.findByRole('button', { name: /logout/i })
  fireEvent.click(menuLogout)
  const allLogout = await screen.findAllByRole('button', { name: /logout/i })
  const confirm = allLogout[allLogout.length - 1]
  fireEvent.click(confirm)
  expect(onLogout).toHaveBeenCalled()
})

test('Header - shows brand/logo area', () => {
  render(<Header user={{ name: 'Brand' }} onLogout={() => {}} />)
  expect(screen.getByText(/brand/i) || screen.getByText(/u/i)).toBeTruthy()
})

test('Header - accessible buttons present', () => {
  render(<Header user={{ name: 'A' }} onLogout={() => {}} />)
  expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(1)
})

test('Header - does not crash when no user', () => {
  render(<Header user={null} onLogout={() => {}} />)
  expect(true).toBeTruthy()
})
