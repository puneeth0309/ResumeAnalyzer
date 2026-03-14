import React, {useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Dashboard from './Dashboard/Dashboard'
import { AuthContext } from '../context/AuthContext'

export default function Protected() {
  const { user, loading } = useContext(AuthContext)
  const navigate = useNavigate()

  if (loading) return <p>Loading...</p>
  if (!user) {
    navigate('/login')
    return null
  }

  return <Dashboard />
}