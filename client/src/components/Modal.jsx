import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'

export default function Modal({
  open = false,
  title = '',
  children,
  footer = null,
  onClose = () => {},
  className = '',
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (open && modalRef.current) {
      const focusable = modalRef.current.querySelector(
        'button, a, input, textarea, select'
      )
      focusable?.focus()
    }
  }, [open])

  if (!open) return null

  const stopPropagation = (e) => e.stopPropagation()

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center min-h-screen bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        ref={modalRef}
        onClick={stopPropagation}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`relative z-[10000] bg-white dark:bg-slate-800 dark:text-slate-200 rounded-xl shadow-xl w-full max-w-xl mx-4 p-5 ${className}`}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 id="modal-title" className="text-lg font-semibold">
            {title}
          </h3>
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white text-xl font-bold focus:outline-none"
          >
            X
          </button>
        </div>

        <div className="mb-4">{children}</div>

        {footer && <div className="pt-2">{footer}</div>}
      </motion.div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
