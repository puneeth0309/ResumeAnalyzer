import React, { createContext, useState, useEffect } from 'react'
import API from '../api'

export const AuthContext = createContext()

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    async function fetchUser() {
      try {
        const res = await API.get('/protected')
        setUser(res.data.user)
      } catch (err) {
        console.error('Auth check failed:', err)
        const status = err?.response?.status
        if (status === 401) {
          try {
            const refreshRes = await API.post('/refresh')
            const newToken = refreshRes?.data?.token
            if (newToken) {
              localStorage.setItem('token', newToken)
              const retry = await API.get('/protected')
              setUser(retry.data.user)
            } else {
              localStorage.removeItem('token')
            }
          } catch (refreshErr) {
            console.error('Token refresh failed:', refreshErr)
            localStorage.removeItem('token')
          }
        } else {
          localStorage.removeItem('token')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
