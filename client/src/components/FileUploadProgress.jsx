import React from 'react'

export default function FileUploadProgress({ progress = 0, fileName = '' }) {
  return (
    <div className="mt-3 w-full">
      <p className="text-sm text-gray-700 dark:text-slate-200 mb-1 truncate">{fileName}</p>
      <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          style={{ width: `${progress}%` }}
          className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500 rounded-full"
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-300 mt-1">{progress}%</p>
    </div>
  )
}
