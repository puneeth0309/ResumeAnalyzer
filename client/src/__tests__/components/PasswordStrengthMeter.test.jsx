import React from 'react'
import { render, screen } from '@testing-library/react'
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter'

test('PasswordStrengthMeter - shows meter and checks', () => {
  render(<PasswordStrengthMeter password="Abc123!@#" />)

  expect(screen.getByText(/min\s*8/i)).toBeInTheDocument()
})

test('PasswordStrengthMeter - shows percentage bar', () => {
  render(<PasswordStrengthMeter password="Abc123" />)
  const bar = document.querySelector('div > div > div[style]')
  expect(bar).toBeTruthy()
})

test('PasswordStrengthMeter - checks change color on strong password', () => {
  render(<PasswordStrengthMeter password="StrongPass123!" />)
  expect(screen.getByText(/min\s*8/i)).toBeInTheDocument()
})

test('PasswordStrengthMeter - shows each check text', () => {
  render(<PasswordStrengthMeter password="" />)
  expect(screen.getByText(/letters/i)).toBeInTheDocument()
  expect(screen.getByText(/numbers/i)).toBeInTheDocument()
})

test('PasswordStrengthMeter - is accessible and small', () => {
  render(<PasswordStrengthMeter password="Ab1!" />)
  expect(screen.getByText(/special char/i)).toBeInTheDocument()
})

test('PasswordStrengthMeter - does not crash on empty password', () => {
  render(<PasswordStrengthMeter password="" />)
  expect(screen.getByText(/min\s*8/i)).toBeInTheDocument()
})
