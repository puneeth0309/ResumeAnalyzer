import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import JobMatches from '../../pages/Dashboard/JobMatches'
import { ResumeContext } from '../../context/ResumeContext'

vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import API from '../../api'

beforeEach(() => {
  vi.resetAllMocks()
})

test('JobMatches - shows no resumes message when none returned', async () => {
    API.get.mockResolvedValue({ data: [] })

    render(
      <ResumeContext.Provider value={{ selectedResume: null, setSelectedResume: vi.fn() }}>
        <JobMatches />
      </ResumeContext.Provider>
    )

    await waitFor(() => expect(API.get).toHaveBeenCalledWith('/resume/history'))
    expect(screen.getByText(/no resumes uploaded yet/i)).toBeInTheDocument()
  })

test('JobMatches - renders matches when selectedResume present and API returns matches', async () => {
    const resume = { id: 1, original_name: 'test.pdf', created_at: new Date().toISOString() }
    API.get.mockResolvedValue({ data: [resume] })
    API.post.mockResolvedValue({ data: { data: [{ title: 'Dev', match_score: 88, reasoning: { reasoning: 'ok', fit_skills: ['js'], missing_skills: ['py'] } }] } })

    const setSelectedResume = vi.fn()

    render(
      <ResumeContext.Provider value={{ selectedResume: resume, setSelectedResume }}>
        <JobMatches />
      </ResumeContext.Provider>
    )

  await waitFor(() => expect(API.post).toHaveBeenCalled())
  await waitFor(() => expect(screen.getByText(/dev/i)).toBeInTheDocument())
  expect(screen.getByText(/88%/i)).toBeInTheDocument()
  })

test('JobMatches - clicking a resume calls setSelectedResume', async () => {
    const resume = { id: 2, original_name: 'file.pdf', created_at: new Date().toISOString() }
    API.get.mockResolvedValue({ data: [resume] })
    const setSelectedResume = vi.fn()

    render(
      <ResumeContext.Provider value={{ selectedResume: null, setSelectedResume }}>
        <JobMatches />
      </ResumeContext.Provider>
    )

  await waitFor(() => expect(API.get).toHaveBeenCalled())
  await waitFor(() => expect(screen.getByText(/file.pdf/i)).toBeInTheDocument())
  const item = screen.getByText(/file.pdf/i)
  fireEvent.click(item)
  expect(setSelectedResume).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }))
  })

test('JobMatches - renders static UI parts', async () => {
    API.get.mockResolvedValue({ data: [] })
    render(
      <ResumeContext.Provider value={{ selectedResume: null, setSelectedResume: vi.fn() }}>
        <JobMatches />
      </ResumeContext.Provider>
    )

    await waitFor(() => expect(API.get).toHaveBeenCalled())
      expect(screen.getAllByText(/uploaded resumes/i).length).toBeGreaterThan(0)
    await waitFor(() => expect(screen.getByText(/no resumes uploaded yet/i)).toBeInTheDocument())
    expect(screen.getByText(/no resume selected/i)).toBeInTheDocument()
  })

test('JobMatches - handles invalid AI JSON gracefully', async () => {
    const resume = { id: 7, original_name: 'ai-invalid.pdf', created_at: new Date().toISOString() }
    API.get.mockResolvedValue({ data: [resume] })
    API.post.mockResolvedValue({ data: 'this-is-not-the-expected-structure' })

    const setSelectedResume = vi.fn()

    render(
      <ResumeContext.Provider value={{ selectedResume: resume, setSelectedResume }}>
        <JobMatches />
      </ResumeContext.Provider>
    )

    await waitFor(() => expect(screen.getByText(/No matches found for this resume/i)).toBeInTheDocument())
  })

test('JobMatches - shows message when match API fails', async () => {
    const resume = { id: 8, original_name: 'err.pdf', created_at: new Date().toISOString() }
    API.get.mockResolvedValue({ data: [resume] })
    API.post.mockRejectedValueOnce(new Error('Server error'))

    const setSelectedResume = vi.fn()

    render(
      <ResumeContext.Provider value={{ selectedResume: resume, setSelectedResume }}>
        <JobMatches />
      </ResumeContext.Provider>
    )

    await waitFor(() => expect(screen.getByText(/No matches found for this resume/i)).toBeInTheDocument())
  })

test('JobMatches - shows loading indicator while matches are being retrieved', async () => {
    const resume = { id: 9, original_name: 'loading.pdf', created_at: new Date().toISOString() }
    API.get.mockResolvedValue({ data: [resume] })
    let resolvePost
    API.post.mockImplementation(() => new Promise((res) => { resolvePost = res }))

    const setSelectedResume = vi.fn()

    render(
      <ResumeContext.Provider value={{ selectedResume: resume, setSelectedResume }}>
        <JobMatches />
      </ResumeContext.Provider>
    )

  expect(screen.queryByText(/Matching jobs.../i)).toBeTruthy()

    resolvePost({ data: { data: [] } })
    await waitFor(() => expect(screen.getByText(/No matches found for this resume/i)).toBeInTheDocument())
  })

test('JobMatches - handles AI returning null data gracefully', async () => {
    const resume = { id: 10, original_name: 'null-data.pdf', created_at: new Date().toISOString() }
    API.get.mockResolvedValue({ data: [resume] })
    API.post.mockResolvedValue({ data: { data: null } })

    const setSelectedResume = vi.fn()

    render(
      <ResumeContext.Provider value={{ selectedResume: resume, setSelectedResume }}>
        <JobMatches />
      </ResumeContext.Provider>
    )

    await waitFor(() => expect(screen.getByText(/No matches found for this resume/i)).toBeInTheDocument())
  })

test('JobMatches - renders job title when AI returns match without reasoning and hides reasoning block', async () => {
    const resume = { id: 11, original_name: 'no-reasoning.pdf', created_at: new Date().toISOString() }
    API.get.mockResolvedValue({ data: [resume] })
    API.post.mockResolvedValue({ data: { data: [{ title: 'EdgeCase', match_score: 50 }] } })

    const setSelectedResume = vi.fn()

    render(
      <ResumeContext.Provider value={{ selectedResume: resume, setSelectedResume }}>
        <JobMatches />
      </ResumeContext.Provider>
    )

    await waitFor(() => expect(screen.getByText(/edgecase/i)).toBeInTheDocument())
    expect(screen.queryByText(/Reasoning:/i)).not.toBeInTheDocument()
  })
