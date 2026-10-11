'use client'

import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AISidebar } from './AISidebar'

export function AIAssistantShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="ai-assistant-shell flex h-screen overflow-hidden">
      
      {sidebarOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setSidebarOpen(false) }}
        />
      )}

      
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:relative md:translate-x-0 md:z-auto md:flex md:shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <AISidebar onClose={() => setSidebarOpen(false)} />
      </div>

      
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        
        <div className="ai-assistant-mobile-bar flex items-center gap-3 px-4 h-12 shrink-0 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="ai-assistant-menu-btn transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold">AI Assistant</span>
        </div>

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
