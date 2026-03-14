import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AnimatedTabs from '../../components/AnimatedTabs'

test('AnimatedTabs - renders tabs and calls onTabChange', () => {
  const tabs = [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' }
  ]
  const onTabChange = vi.fn()
  render(<AnimatedTabs tabs={tabs} activeTab={'a'} onTabChange={onTabChange} />)

  expect(screen.getByText('A')).toBeInTheDocument()
  expect(screen.getByText('B')).toBeInTheDocument()

  fireEvent.click(screen.getByText('B'))
  expect(onTabChange).toHaveBeenCalledWith('b')
})
