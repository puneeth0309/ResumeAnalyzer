import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import IconButton from '../../components/IconButton'

test('IconButton - renders with aria-label and responds to click', () => {
  const onClick = vi.fn()
  render(<IconButton ariaLabel="test-btn" onClick={onClick}><span>ok</span></IconButton>)

  const btn = screen.getByRole('button', { name: /test-btn/i })
  expect(btn).toBeInTheDocument()
  fireEvent.click(btn)
  expect(onClick).toHaveBeenCalled()
})

test('IconButton - renders children and supports className', () => {
  render(<IconButton ariaLabel="child-btn" className="extra-class">X</IconButton>)
  const btn = screen.getByRole('button', { name: /child-btn/i })
  expect(btn).toHaveClass('extra-class')
  expect(screen.getByText('X')).toBeInTheDocument()
})

test('IconButton - keyboard Enter triggers click handler', () => {
  const onClick = vi.fn()
  render(<IconButton ariaLabel="kbd-btn" onClick={onClick}>K</IconButton>)
  const btn = screen.getByRole('button', { name: /kbd-btn/i })
  btn.focus()
  fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' })
  expect(document.activeElement).toBe(btn)
})

test('IconButton - has default type button', () => {
  render(<IconButton ariaLabel="type-btn">T</IconButton>)
  const btn = screen.getByRole('button', { name: /type-btn/i })
  expect(btn).toHaveAttribute('type', 'button')
})

test('IconButton - accessible via aria-label', () => {
  render(<IconButton ariaLabel="access-btn">A</IconButton>)
  expect(screen.getByRole('button', { name: /access-btn/i })).toBeTruthy()
})
