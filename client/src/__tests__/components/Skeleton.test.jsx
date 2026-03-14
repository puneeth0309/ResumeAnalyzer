import React from 'react'
import { render } from '@testing-library/react'
import Skeleton from '../../components/Skeleton'

test('Skeleton - renders with default classes and custom sizes', () => {
  const { container } = render(<Skeleton />)
  const el = container.firstChild
  expect(el).toHaveClass('animate-pulse')

  const { container: c2 } = render(<Skeleton width={100} height={20} className="my-class" />)
  const el2 = c2.firstChild
  expect(el2).toHaveClass('my-class')
  expect(el2.style.width).toBe('100px')
})
