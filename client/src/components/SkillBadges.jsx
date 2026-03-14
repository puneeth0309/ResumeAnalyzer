import React from 'react'

export default function SkillBadges({ skills = [], onClickSkill }) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map(skill => (
        <span
          key={skill}
          onClick={() => onClickSkill?.(skill)}
          className="px-3 py-1 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-full text-sm cursor-pointer hover:scale-105 transform transition"
        >
          {skill}
        </span>
      ))}
    </div>
  )
}
