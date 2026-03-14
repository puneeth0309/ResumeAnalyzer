import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToastProvider, useToast } from '../../components/ToastManager'

function TestApp() {
  const { addToast } = useToast()
  return (
    <div>
      <button onClick={() => addToast({ message: 'Hello', type: 'success', duration: 1000 })}>
        Add
      </button>
    </div>
  )
}

test('ToastManager - can add toast via context and it renders', async () => {
  render(
    <ToastProvider>
      <TestApp />
    </ToastProvider>
  )

  fireEvent.click(screen.getByText(/add/i))
  expect(await screen.findByText(/hello/i)).toBeInTheDocument()
})
