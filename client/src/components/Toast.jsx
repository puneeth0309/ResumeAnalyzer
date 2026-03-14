import React, { useEffect, useState } from 'react'
import { FiInfo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

export default function Toast({
  message = '',
  open = false,
  duration = 4000,
  onClose = () => {},
  type = 'info',
}) {
  const [visible, setVisible] = useState(open)

  useEffect(() => {
    setVisible(open)
    if (!open) return
    const timer = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(timer)
  }, [open, duration])

  useEffect(() => {
    if (!visible && open) {
      const t = setTimeout(onClose, 300)
      return () => clearTimeout(t)
    }
  }, [visible, open, onClose])

  if (!visible && !open) return null

  const typeIcon = {
    info: <FiInfo className="text-blue-400" />,
    success: <FiCheckCircle className="text-green-400" />,
    error: <FiAlertCircle className="text-red-400" />,
  }

  const typeBg = {
    info: 'bg-gray-900 dark:bg-slate-800',
    success: 'bg-green-600 dark:bg-green-700',
    error: 'bg-red-600 dark:bg-red-700',
  }

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 max-w-xs w-full
        rounded-lg shadow-lg px-4 py-3 flex items-center gap-3
        text-white ${typeBg[type]}
        transform transition-all duration-300
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      `}
    >
      <div className="text-lg flex-shrink-0">{typeIcon[type]}</div>

      <div className="flex-1 text-sm">{message}</div>

      <button
        onClick={() => setVisible(false)}
        aria-label="Close toast"
        className="ml-2 text-white/80 hover:text-white transition"
      >
        X
      </button>

      <div
        className="absolute bottom-0 left-0 h-[2px] bg-white/60 rounded-b transition-all"
        style={{
          width: `${visible ? 100 : 0}%`,
          transitionDuration: `${duration}ms`,
        }}
      />
    </div>
  )
}
