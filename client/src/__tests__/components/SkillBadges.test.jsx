import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SkillBadges from '../../components/SkillBadges'

test('SkillBadges - renders skills and handles clicks', () => {
  const onClick = vi.fn()
  const skills = ['js', 'react', 'node']
  render(<SkillBadges skills={skills} onClickSkill={onClick} />)

  skills.forEach(s => expect(screen.getByText(s)).toBeInTheDocument())

  fireEvent.click(screen.getByText('react'))
  expect(onClick).toHaveBeenCalledWith('react')
})
