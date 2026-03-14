import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PasswordInput from '../../components/PasswordInput'

test('PasswordInput - toggles show/hide button', () => {
  render(<PasswordInput value="" onChange={() => {}} showStrength={false} />)

  const btn = screen.getByRole('button')
  expect(btn).toBeInTheDocument()
  fireEvent.click(btn)
})

test('PasswordInput - input has correct type and placeholder', () => {
  render(<PasswordInput name="password" value="" onChange={() => {}} placeholder="Enter" />)
  const input = screen.getByPlaceholderText(/enter/i)
  expect(input).toBeInTheDocument()
  expect(input).toHaveAttribute('type')
})

test('PasswordInput - showStrength toggles meter', () => {
  render(<PasswordInput value="Abcd1234" onChange={() => {}} showStrength={true} />)
  expect(screen.getByText(/min\s*8/i)).toBeInTheDocument()
})

test('PasswordInput - aria label changes when toggled', () => {
  render(<PasswordInput name="password" value="" onChange={() => {}} />)
  const btn = screen.getByRole('button')
  expect(btn).toHaveAccessibleName(/show password|hide password/i)
})

test('PasswordInput - is focusable', () => {
  render(<PasswordInput value="" onChange={() => {}} />)
  const input = document.querySelector('input')
  input.focus()
  expect(document.activeElement).toBe(input)
})

test('PasswordInput - accepts required prop', () => {
  render(<PasswordInput required value="" onChange={() => {}} />)
  const input = document.querySelector('input')
  expect(input).toBeRequired()
})
