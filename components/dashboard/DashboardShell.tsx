'use client'

import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAF5F0' }}>
      <div
        className="fixed top-0 left-0 h-full hidden lg:block"
        style={{ width: '256px', backgroundColor: '#FFFFFF', borderRight: '1px solid #E8DDD0' }}
      />
      <div className="flex flex-col flex-1 min-w-0 lg:ml-64">
        <div
          className="h-16"
          style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8DDD0' }}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-32 rounded-2xl" style={{ backgroundColor: '#F0E6D8' }} />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl" style={{ backgroundColor: '#F0E6D8' }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAF5F0' }}>
      {/* Sidebar (gère son propre état mobile en interne) */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-64">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#5D3A1A',
            border: '1px solid #E8DDD0',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 8px 24px rgba(139,69,19,0.12)',
          },
          success: {
            iconTheme: { primary: '#556B2F', secondary: '#fff' },
            style: { borderLeft: '3px solid #556B2F' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
            style: { borderLeft: '3px solid #EF4444' },
          },
        }}
      />
    </div>
  )
}
