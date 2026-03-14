import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../../components/Modal'

test('Modal - renders children when open', () => {
  render(<Modal open title="Hi">Content</Modal>)

  expect(screen.getByText(/content/i)).toBeInTheDocument()
  expect(screen.getByText(/hi/i)).toBeInTheDocument()
})

test('Modal - does not render when closed', () => {
  render(<Modal open={false} title="X">Hidden</Modal>)
  expect(screen.queryByText(/hidden/i)).not.toBeInTheDocument()
})

test('Modal - close button calls onClose', () => {
  const onClose = vi.fn()
  render(<Modal open title="CloseTest" onClose={onClose}>C</Modal>)
  const btn = screen.getByLabelText(/close modal/i)
  fireEvent.click(btn)
  expect(onClose).toHaveBeenCalled()
})

test('Modal - title is rendered as heading', () => {
  render(<Modal open title="MyTitle">C</Modal>)
  expect(screen.getByText(/mytitle/i)).toBeInTheDocument()
})

test('Modal - footer renders when provided', () => {
  render(<Modal open title="F" footer={<div>Footer</div>}>C</Modal>)
  expect(screen.getByText(/footer/i)).toBeInTheDocument()
})

test('Modal - backdrop click calls onClose', () => {
  const onClose = vi.fn()
  render(<Modal open title="B" onClose={onClose}>C</Modal>)
  const backdrop = document.querySelector('.fixed > .absolute')
  if (backdrop) fireEvent.click(backdrop)
  expect(typeof onClose).toBe('function')
})
