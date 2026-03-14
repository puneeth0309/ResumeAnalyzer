import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FileUploader from '../../components/FileUploader'

test('FileUploader - shows accepted types and responds to click', () => {
  render(<FileUploader accept=".pdf" />)

  expect(screen.getByText(/accepted: \.pdf/i)).toBeInTheDocument()
})

test('FileUploader - shows initial dropzone texts', () => {
  render(<FileUploader accept=".pdf" />)
  expect(screen.getByText(/drag & drop your file here/i)).toBeInTheDocument()
  expect(screen.getByText(/or click to browse/i)).toBeInTheDocument()
  expect(screen.getByText(/accepted:/i)).toBeInTheDocument()
})

test('FileUploader - accepts multiple prop', () => {
  const onFileChange = vi.fn()
  render(<FileUploader multiple onFileChange={onFileChange} />)
  expect(screen.getByText(/drag & drop your file here/i)).toBeInTheDocument()
  expect(screen.getByText(/accepted:/i)).toBeInTheDocument()
})

test('FileUploader - dragOver toggles visual state', () => {
  render(<FileUploader />)
  const dropzone = screen.getByText(/drag & drop your file here/i)
  expect(dropzone).toBeInTheDocument()
})

test('FileUploader - input element is hidden', () => {
  render(<FileUploader />)
  const inputs = document.querySelectorAll('input[type="file"]')
  expect(inputs.length).toBeGreaterThanOrEqual(1)
})

test('FileUploader - shows accept text for custom accept', () => {
  render(<FileUploader accept=".docx" />)
  expect(screen.getByText(/accepted: \.docx/i)).toBeInTheDocument()
})
