'use client'

import { useState, type ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  icon?: string
  content: ReactNode
}

interface AdminTabsProps {
  tabs: Tab[]
}

export default function AdminTabs({ tabs }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">{activeTabContent}</div>
    </div>
  )
}
