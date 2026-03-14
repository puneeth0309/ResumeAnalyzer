import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../../components/LoadingSpinner'

test('LoadingSpinner - renders default message and spinner', () => {
  const { container } = render(<LoadingSpinner />)
  expect(screen.getByText(/loading.../i)).toBeInTheDocument()
  expect(container.querySelector('.animate-spin')).toBeTruthy()
})

test('LoadingSpinner - shows processing paragraph when message is present', () => {
  render(<LoadingSpinner message="Please wait" />)
  const matches = screen.getAllByText(/please wait/i)
  expect(matches.length).toBeGreaterThanOrEqual(2)
  expect(matches.some((n) => n.textContent.trim() === 'Please wait')).toBeTruthy()
  expect(screen.getByText(/processing, please wait/i)).toBeInTheDocument()
})

test('LoadingSpinner - displays custom message prop', () => {
  render(<LoadingSpinner message="Working on it" />)
  expect(screen.getByText(/working on it/i)).toBeInTheDocument()
})

test('LoadingSpinner - empty string message hides processing paragraph', () => {
  const { container } = render(<LoadingSpinner message="" />)
  expect(screen.queryByText(/loading.../i)).toBeNull()
  expect(screen.getByText(/processing, please wait/i)).toBeInTheDocument()
  expect(container.querySelector('.animate-spin')).toBeTruthy()
})

test('LoadingSpinner - spinner has expected tailwind classes', () => {
  const { container } = render(<LoadingSpinner />)
  const spinner = container.querySelector('div.w-12') || container.querySelector('.animate-spin')
  expect(spinner).toBeTruthy()
  expect(container.querySelector('.border-t-blue-500')).toBeTruthy()
})

test('LoadingSpinner - does not render processing when message is null', () => {
  render(<LoadingSpinner message={null} />)
  expect(screen.queryByText(/loading.../i)).toBeNull()
  expect(screen.getByText(/processing, please wait/i)).toBeInTheDocument()
})
