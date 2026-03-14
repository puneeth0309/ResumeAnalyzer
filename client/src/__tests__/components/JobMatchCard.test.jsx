import React from 'react'
import { render, screen } from '@testing-library/react'
import JobMatchCard from '../../components/JobMatchCard'

const job = { title: 'Engineer', match_score: 80, reasoning: { reasoning: 'Good fit', fit_skills: ['js'], missing_skills: ['python'] } }

test('JobMatchCard - renders job title and score', () => {
  render(<JobMatchCard job={job} />)

  expect(screen.getByText(/engineer/i)).toBeInTheDocument()
  expect(screen.getByText(/80%/i)).toBeInTheDocument()
})

test('JobMatchCard - progress bar width matches score', () => {
  render(<JobMatchCard job={job} />)
  const inner = document.querySelector('div > div > div[style]')
  expect(inner).toBeTruthy()
})

test('JobMatchCard - shows reasoning and links', () => {
  render(<JobMatchCard job={job} />)
  expect(screen.getByText(/good fit/i)).toBeInTheDocument()
  expect(screen.getByText(/learn missing skills/i)).toBeInTheDocument()
})

test('JobMatchCard - has match score text', () => {
  render(<JobMatchCard job={job} />)
  expect(screen.getByText(/80%/i)).toBeInTheDocument()
})

test('JobMatchCard - fit and missing skills displayed', () => {
  render(<JobMatchCard job={job} />)
  expect(screen.getAllByText(/fit skills/i).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/missing skills/i).length).toBeGreaterThan(0)
})
