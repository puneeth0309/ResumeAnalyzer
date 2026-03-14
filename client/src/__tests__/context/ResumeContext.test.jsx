import React, { useContext } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResumeProvider, ResumeContext } from '../../context/ResumeContext'

function Consumer() {
  const { selectedResume, setSelectedResume } = useContext(ResumeContext)
  return (
    <div>
      <div>sel:{selectedResume ? selectedResume.id : 'null'}</div>
      <button onClick={() => setSelectedResume({ id: 42 })}>set42</button>
      <button onClick={() => setSelectedResume({ id: 99 })}>set99</button>
      <button onClick={() => setSelectedResume(null)}>clear</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
})

test('ResumeContext - reads initial value from localStorage', () => {
  localStorage.setItem('selectedResume', JSON.stringify({ id: 99 }))
  render(
    <ResumeProvider>
      <Consumer />
    </ResumeProvider>
  )
  expect(screen.getByText(/sel:99/i)).toBeInTheDocument()
})

test('ResumeContext - setSelectedResume updates localStorage and value (multiple updates)', () => {
  render(
    <ResumeProvider>
      <Consumer />
    </ResumeProvider>
  )
  fireEvent.click(screen.getByText('set42'))
  expect(localStorage.getItem('selectedResume')).toBe(JSON.stringify({ id: 42 }))
  expect(screen.getByText(/sel:42/i)).toBeInTheDocument()

  fireEvent.click(screen.getByText('set99'))
  expect(localStorage.getItem('selectedResume')).toBe(JSON.stringify({ id: 99 }))
  expect(screen.getByText(/sel:99/i)).toBeInTheDocument()

  fireEvent.click(screen.getByText('clear'))
  expect(screen.getByText(/sel:null/i)).toBeInTheDocument()
  // after clear the storage should be removed
  expect(localStorage.getItem('selectedResume')).toBeNull()
})

test('ResumeContext - invalid JSON in storage yields null selectedResume', () => {
  localStorage.setItem('selectedResume', 'not-json')
  render(
    <ResumeProvider>
      <Consumer />
    </ResumeProvider>
  )
  expect(screen.getByText(/sel:null/i)).toBeInTheDocument()
})
