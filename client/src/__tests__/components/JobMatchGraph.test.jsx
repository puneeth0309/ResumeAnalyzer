import React from 'react'
import { render, screen } from '@testing-library/react'

vi.mock('@nivo/bar', () => ({
  ResponsiveBar: (props) => {
    return (
      <div data-testid="nivo-bar">
        {JSON.stringify(props.data)}
      </div>
    )
  }
}))

import JobMatchGraph from '../../components/JobMatchGraph'

test('JobMatchGraph - renders with provided jobs data', () => {
  const jobs = [
    { title: 'A', match_score: 10 },
    { title: 'B', match_score: 90 }
  ]
  render(<JobMatchGraph jobs={jobs} />)
  const el = screen.getByTestId('nivo-bar')
  expect(el).toBeInTheDocument()
  expect(el.textContent).toContain('"job":"A"')
  expect(el.textContent).toContain('"score":90')
})
