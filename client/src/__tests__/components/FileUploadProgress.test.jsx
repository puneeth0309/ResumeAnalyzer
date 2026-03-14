import React from 'react'
import { render, screen } from '@testing-library/react'
import FileUploadProgress from '../../components/FileUploadProgress'

test('FileUploadProgress - shows filename, percent and progress width', () => {
  render(<FileUploadProgress fileName="resume.pdf" progress={50} />)

  expect(screen.getByText(/resume.pdf/i)).toBeInTheDocument()
  expect(screen.getByText(/50%/i)).toBeInTheDocument()

  const inner = document.querySelector('.h-full')
  expect(inner).toBeTruthy()
  expect(inner.style.width).toBe('50%')
})
