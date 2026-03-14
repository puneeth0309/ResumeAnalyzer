import React from 'react'

export default function LoadingSpinner({ 
  message = 'Loading...', 
  subText = 'Processing, please wait...' 
}) {
  return (
    <div 
      className="flex flex-col items-center justify-center mt-16 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {message && (
        <p className="text-gray-700 dark:text-gray-200 font-semibold text-lg mb-3">
          {message}
        </p>
      )}

      <div className="w-12 h-12 border-4 border-gray-300 
        dark:border-gray-600 border-t-blue-500 
        dark:border-t-blue-400 rounded-full animate-spin"
      />

      {subText && (
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm animate-pulse">
          {subText}
        </p>
      )}
    </div>
  )
}
