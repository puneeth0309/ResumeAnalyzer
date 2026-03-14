import React from 'react'

export default function Skeleton({ width = 'full', height = '4', className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-slate-700 rounded ${className}`}
      style={{ width: width === 'full' ? '100%' : width, height }}
    />
  )
}
