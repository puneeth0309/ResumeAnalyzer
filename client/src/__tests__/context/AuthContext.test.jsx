import React, { useContext } from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import AuthProvider, { AuthContext } from '../../context/AuthContext'

vi.mock('../../api', () => ({
  default: { get: vi.fn() },
}))

import API from '../../api'

function Consumer() {
  const { user, loading, logout } = useContext(AuthContext)
  return (
    <div>
      <div>loading:{loading ? 'true' : 'false'}</div>
      <div>user:{user ? user.name : 'null'}</div>
      <button onClick={logout}>out</button>
    </div>
  )
}

function ConsumerWithSetter() {
  const { user, setUser } = useContext(AuthContext)
  return (
    <div>
      <div>user:{user ? user.name : 'null'}</div>
      <button onClick={() => setUser({ name: 'Zed' })}>set</button>
    </div>
  )
}

beforeEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

test('AuthContext - no token yields loading false and user null', async () => {
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )

  expect(screen.getByText(/loading:false/i)).toBeInTheDocument()
  expect(screen.getByText(/user:null/i)).toBeInTheDocument()
})

test('AuthContext - with token fetches user and exposes it', async () => {
  localStorage.setItem('token', 'x')
  API.get.mockResolvedValueOnce({ data: { user: { name: 'Sam' } } })

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )

  await waitFor(() => expect(API.get).toHaveBeenCalledWith('/protected'))
  expect(await screen.findByText(/user:sam/i)).toBeInTheDocument()
})

test('AuthContext - logout clears token and user', async () => {
  localStorage.setItem('token', 'x')
  API.get.mockResolvedValueOnce({ data: { user: { name: 'Sam' } } })

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )

  await waitFor(() => expect(API.get).toHaveBeenCalled())
  fireEvent.click(screen.getByText('out'))
  await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
  await waitFor(() => expect(screen.getByText(/user:null/i)).toBeInTheDocument())
})

test('AuthContext - token present but API.get fails removes token and keeps user null', async () => {
  localStorage.setItem('token', 'x')
  API.get.mockRejectedValueOnce(new Error('fail'))

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )

  await waitFor(() => expect(API.get).toHaveBeenCalled())
  await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
  expect(screen.getByText(/user:null/i)).toBeInTheDocument()
})

test('AuthContext - setUser works when used directly', async () => {
  render(
    <AuthProvider>
      <ConsumerWithSetter />
    </AuthProvider>
  )

  expect(screen.getByText(/user:null/i)).toBeInTheDocument()
  fireEvent.click(screen.getByText('set'))
  expect(screen.getByText(/user:zed/i)).toBeInTheDocument()
})

test('AuthContext - delayed API response keeps loading true until resolved', async () => {
  localStorage.setItem('token', 'x')
  let resolve
  const p = new Promise((res) => {
    resolve = res
  })
  API.get.mockReturnValueOnce(p)

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )

  // while promise unresolved loading should remain true
  expect(screen.getByText(/loading:true/i)).toBeInTheDocument()

  // now resolve the API call
  resolve({ data: { user: { name: 'Slow' } } })

  // wait for resolved user
  expect(await screen.findByText(/user:slow/i)).toBeInTheDocument()
  expect(screen.getByText(/loading:false/i)).toBeInTheDocument()
})

test('AuthContext - on 401 attempts token refresh then retries protected endpoint', async () => {
  localStorage.setItem('token', 'old')

  const unauthorized = new Error('unauth')
  unauthorized.response = { status: 401 }

  // first protected call fails with 401
  API.get.mockRejectedValueOnce(unauthorized)
  // refresh endpoint returns new token
  API.post = vi.fn().mockResolvedValueOnce({ data: { token: 'newtoken' } })
  // retry protected returns user
  API.get.mockResolvedValueOnce({ data: { user: { name: 'Refreshed' } } })

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )

  // wait for the flow to finish and the user to be set
  await waitFor(() => expect(API.post).toHaveBeenCalledWith('/refresh'))
  expect(localStorage.getItem('token')).toBe('newtoken')
  expect(await screen.findByText(/user:refreshed/i)).toBeInTheDocument()
})

test('AuthContext - failed refresh removes token and keeps user null', async () => {
  localStorage.setItem('token', 'old')

  const unauthorized = new Error('unauth')
  unauthorized.response = { status: 401 }

  API.get.mockRejectedValueOnce(unauthorized)
  API.post = vi.fn().mockRejectedValueOnce(new Error('nope'))

  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )

  await waitFor(() => expect(API.post).toHaveBeenCalledWith('/refresh'))
  await waitFor(() => expect(localStorage.getItem('token')).toBeNull())
  expect(screen.getByText(/user:null/i)).toBeInTheDocument()
})
