import React, { useState } from 'react'
import PasswordStrengthMeter from './PasswordStrengthMeter'

export default function PasswordInput({
  name = 'password',
  value,
  onChange,
  placeholder = '',
  required = false,
  showStrength = false
}) {
  const [show, setShow] = useState(false)
  const isConfirm = /confirm/i.test(name)
  const ariaLabel = show
    ? `Hide ${isConfirm ? 'confirm password' : 'password'}`
    : `Show ${isConfirm ? 'confirm password' : 'password'}`

  return (
    <div className="w-full space-y-2">
      <div className="relative group">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-2 border rounded-lg transition-all bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200
            focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:ring-blue-400
            ${value ? 'pt-4' : 'pt-2'}
          `}
        />

        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={ariaLabel}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white transition-transform active:scale-95"
        >
          {show ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 0 1 1.175-4.625M6.1 6.1A9.961 9.961 0 0 1 12 5c5.523 0 10 4.477 10 10 0 1.25-.238 2.45-.675 3.56M3 3l18 18"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            </svg>
          )}
        </button>
      </div>

      {showStrength && <PasswordStrengthMeter password={value} />}
    </div>
  )
}
