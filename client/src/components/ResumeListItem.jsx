import React from 'react'
import IconButton from './IconButton'

export default function ResumeListItem({ resume, selected, onSelect, onDelete }) {
  const formattedDate = new Date(resume.created_at).toLocaleString()

  return (
    <li
      className={`group py-3 px-4 rounded-lg flex justify-between items-center cursor-pointer transition-all
        ${selected ? 'bg-blue-100 dark:bg-slate-700 shadow-sm' : 'hover:bg-blue-50 dark:hover:bg-slate-700'}
      `}
      onClick={() => onSelect(resume)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && onSelect(resume)}
    >

      <div className="flex flex-col w-full max-w-[75%]">
        <span className={`truncate text-sm font-semibold
          ${selected ? 'text-blue-700 dark:text-white' : 'text-gray-800 dark:text-slate-200'}
        `}>
          {resume.original_name}
        </span>

        <span className="text-[11px] mt-1 inline-block text-gray-500 dark:text-slate-400 bg-gray-100/70 dark:bg-slate-800/60 px-2 py-[2px] rounded-md backdrop-blur-sm">
          {formattedDate}
        </span>
      </div>

      {onDelete && (
        <IconButton
          ariaLabel={`Delete ${resume.original_name}`}
          title={`Delete ${resume.original_name}`}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(resume)
          }}
          className="ml-auto text-red-500 dark:text-red-400 hover:scale-110 transition-transform opacity-80 group-hover:opacity-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H3.5a.5.5 0 000 1H4v10a2 2 0 002 2h8a2 2 0 002-2V5h.5a.5.5 0 000-1H15V3a1 1 0 00-1-1H6zm2 4a.5.5 0 01.5.5V15a.5.5 0 01-1 0V6.5A.5.5 0 018 6zm4 .5a.5.5 0 00-1 0V15a.5.5 0 001 0V6.5z"
              clipRule="evenodd"
            />
          </svg>
        </IconButton>
      )}
    </li>
  )
}
