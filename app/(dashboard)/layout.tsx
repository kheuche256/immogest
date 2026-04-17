'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { Toaster } from 'react-hot-toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setAuthenticated(true)
      }
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#FAF5F0' }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#8B4513', borderTopColor: 'transparent' }}
          />
          <p className="text-lg font-medium" style={{ color: '#5D3A1A' }}>
            Chargement...
          </p>
          <p className="text-sm" style={{ color: '#8B7355' }}>KeurGest</p>
        </div>
      </div>
    )
  }

  if (!authenticated) return null

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAF5F0' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>

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
