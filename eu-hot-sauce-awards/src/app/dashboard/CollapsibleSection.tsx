'use client'

import { useState } from 'react'

interface CollapsibleSectionProps {
  title: string
  count: number
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-3 flex w-full items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:text-gray-900"
      >
        <span className="text-gray-400">
          {isOpen ? '▼' : '▶'}
        </span>
        {title} ({count})
      </button>
      {isOpen && children}
    </div>
  )
}
