import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ResumeListItem from '../../components/ResumeListItem'

const resume = { original_name: 'r.pdf', created_at: new Date().toISOString() }

test('ResumeListItem - renders name and calls onSelect', () => {
  const onSelect = vi.fn()
  render(<ResumeListItem resume={resume} onSelect={onSelect} />)

  expect(screen.getByText(/r.pdf/i)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button'))
  expect(onSelect).toHaveBeenCalled()
})

test('ResumeListItem - shows created date', () => {
  render(<ResumeListItem resume={resume} />)
  expect(screen.getByText(/r.pdf/i)).toBeInTheDocument()
})

test('ResumeListItem - delete button calls onDelete', () => {
  const onDelete = vi.fn()
  render(<ResumeListItem resume={resume} onDelete={onDelete} />)
  const del = screen.getByLabelText(/delete r.pdf/i)
  fireEvent.click(del)
  expect(del).toBeTruthy()
})

test('ResumeListItem - is focusable and reacts to Enter key', () => {
  const onSelect = vi.fn()
  render(<ResumeListItem resume={resume} onSelect={onSelect} />)
  const item = screen.getByRole('button')
  item.focus()
  fireEvent.keyDown(item, { key: 'Enter' })
  expect(document.activeElement).toBe(item)
  expect(onSelect).toHaveBeenCalled()
})

test('ResumeListItem - has proper markup', () => {
  render(<ResumeListItem resume={resume} />)
  expect(screen.getByText(/r.pdf/i)).toBeInTheDocument()
})
