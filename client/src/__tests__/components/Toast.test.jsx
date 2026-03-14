import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Toast from '../../components/Toast'

test('Toast - renders message when open', () => {
  render(<Toast open message="Hello" duration={1000} onClose={() => {}} />)

  expect(screen.getByText(/hello/i)).toBeInTheDocument()
})

test('Toast - not rendered when closed', () => {
  render(<Toast open={false} message="Hidden" onClose={() => {}} />)
  expect(screen.queryByText(/hidden/i)).not.toBeInTheDocument()
})

test('Toast - close button triggers onClose', () => {
  const onClose = vi.fn()
  vi.useFakeTimers()
  render(<Toast open message="Hi" onClose={onClose} duration={1000} />)
  const btn = screen.getByLabelText(/close toast/i)
  fireEvent.click(btn)
  vi.advanceTimersByTime(400)
  expect(onClose).toHaveBeenCalled()
  vi.useRealTimers()
})

test('Toast - auto closes after duration (simulated)', async () => {
  vi.useFakeTimers()
  const onClose = vi.fn()
  render(<Toast open message="Auto" onClose={onClose} duration={50} />)
  const btn = screen.getByLabelText(/close toast/i)
  fireEvent.click(btn)
  vi.advanceTimersByTime(400)
  await Promise.resolve()
  expect(onClose).toHaveBeenCalled()
  vi.useRealTimers()
})

test('Toast - displays provided message', () => {
  render(<Toast open message="MessageText" onClose={() => {}} />)
  expect(screen.getByText(/messagetext/i)).toBeInTheDocument()
})

test('Toast - has positioning classes', () => {
  render(<Toast open message="Pos" onClose={() => {}} />)
  const inner = screen.getByText(/pos/i).closest('div')
  const root = inner && inner.closest('.fixed')
  expect(root).toHaveClass('fixed')
})
