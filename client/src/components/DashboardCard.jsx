import React from 'react'

export default function DashboardCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
      {icon && <div className="text-2xl">{icon}</div>}
      <div className="flex flex-col">
        <span className="text-sm text-gray-500 dark:text-slate-400">{title}</span>
        <span className="text-xl font-semibold text-gray-800 dark:text-slate-100">{value}</span>
      </div>
    </div>
  )
}
