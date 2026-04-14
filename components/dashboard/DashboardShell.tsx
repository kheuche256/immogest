'use client'

import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Sidebar from './Sidebar'
import Header from './Header'
import { useProfile } from '@/hooks/useProfile'

interface DashboardShellProps {
  children: React.ReactNode
  displayName: string
  email: string
}

export default function DashboardShell({
  children,
  displayName,
  email,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { profile } = useProfile()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Appliquer la couleur principale + variantes comme CSS variables globales
  useEffect(() => {
    const c = profile?.couleur_principale ?? '#0066FF'
    const root = document.documentElement
    root.style.setProperty('--primary',            c)
    root.style.setProperty('--color-primary',      c)
    root.style.setProperty('--color-primary-light', `${c}20`)
    root.style.setProperty('--color-primary-dark',  `${c}dd`)
    root.style.setProperty('--color-primary-mid',   `${c}55`)
  }, [profile?.couleur_principale])

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!mounted) return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0F1C' }}>
      <div
        className="fixed top-0 left-0 h-full hidden lg:block"
        style={{ width: '280px', background: 'rgba(17,24,39,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      />
      <div className="flex flex-col flex-1 min-w-0 lg:ml-[280px]">
        <div className="h-16 px-6" style={{ background: 'rgba(17,24,39,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-32 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="grid grid-cols-4 gap-4">
              {[0,1,2,3].map(i => <div key={i} className="h-28 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
            </div>
          </div>
        </main>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0F1C' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        displayName={displayName}
        email={email}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-[280px]">
        <Header
          displayName={displayName}
          email={email}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Toast global — toutes les pages peuvent utiliser react-hot-toast */}
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(17,24,39,0.97)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
          success: {
            iconTheme: { primary: '#00C48C', secondary: '#fff' },
            style: { borderLeft: '3px solid #00C48C' },
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
