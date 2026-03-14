import React, { useRef, useEffect, useState } from 'react'

export default function AnimatedTabs({ tabs = [], activeTab, onTabChange }) {
  const containerRef = useRef(null)
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const activeIndex = tabs.findIndex(tab => tab.key === activeTab)
    const tabElements = containerRef.current.children
    if (!tabElements[activeIndex]) return

    const tabEl = tabElements[activeIndex]
    const container = containerRef.current

    setUnderlineStyle({
      left: tabEl.offsetLeft,
      width: tabEl.offsetWidth
    })

    const containerCenter = container.offsetWidth / 2
    const tabCenter = tabEl.offsetLeft + tabEl.offsetWidth / 2
    const scrollLeft = tabCenter - containerCenter

    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    })
  }, [activeTab, tabs])

  return (
    <div className="relative border-b flex justify-center border-gray-200 dark:border-slate-700">
      <div
        ref={containerRef}
        className="flex space-x-6 overflow-x-auto no-scrollbar px-2"
      >
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`py-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <span
        className="absolute bottom-0 h-1 bg-blue-600 dark:bg-blue-400 transition-all duration-300 rounded-full"
        style={{
          left: underlineStyle.left,
          width: underlineStyle.width
        }}
      />
    </div>
  )
}
