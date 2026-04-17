'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/useProfile'
import { useAlertes } from '@/hooks/useAlertes'
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  Bell,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Calendar,
  Receipt,
  Package,
  ClipboardList,
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/biens',        icon: Building2,        label: 'Biens' },
  { href: '/locataires',   icon: Users,            label: 'Locataires' },
  { href: '/paiements',    icon: Wallet,           label: 'Paiements' },
  { href: '/reservations', icon: Calendar,         label: 'Réservations', isNew: true },
  { href: '/charges',      icon: Receipt,          label: 'Charges' },
  { href: '/inventaire',   icon: Package,          label: 'Inventaire' },
  { href: '/etats-lieux',  icon: ClipboardList,    label: 'États des lieux' },
  { href: '/alertes',      icon: Bell,             label: 'Alertes', badge: true },
  { href: '/quittances',   icon: FileText,         label: 'Quittances' },
  { href: '/rapports',     icon: BarChart3,        label: 'Rapports' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useProfile()
  const { stats } = useAlertes()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const nomEntreprise = profile?.entreprise || 'KeurGest'
  const alertesNonLues = stats?.nonLues || 0

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  const SidebarContent = () => (
    <>
      {/* ── Logo ── */}
      <div className="p-5 border-b" style={{ borderColor: '#F0E6D8' }}>
        <Link href="/dashboard" className="flex items-center gap-3">
          {profile?.logo_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.logo_url}
                alt={nomEntreprise}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="font-bold block truncate" style={{ color: '#5D3A1A' }}>
                  {nomEntreprise}
                </span>
                <span className="text-xs" style={{ color: '#8B7355' }}>
                  Powered by KeurGest
                </span>
              </div>
            </>
          ) : (
            <Image
              src="/logo.png"
              alt="KeurGest"
              width={140}
              height={40}
              className="h-10 w-auto"
            />
          )}
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group"
              style={{
                backgroundColor: active ? '#FFF5EB' : 'transparent',
                color: active ? '#8B4513' : '#6B5B4F',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = '#FAF5F0'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {/* Barre active */}
              {active && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                  style={{ backgroundColor: '#8B4513' }}
                />
              )}

              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium flex-1 text-sm">{item.label}</span>

              {/* Badge NEW */}
              {item.isNew && (
                <span
                  className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  NEW
                </span>
              )}

              {/* Badge alertes */}
              {item.badge && alertesNonLues > 0 && (
                <span
                  className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#DC2626' }}
                >
                  {alertesNonLues}
                </span>
              )}

              {/* Hover arrow */}
              {!active && !item.badge && !item.isNew && (
                <ChevronRight
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  style={{ color: '#8B7355' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="p-4 border-t" style={{ borderColor: '#F0E6D8' }}>
        {/* Paramètres */}
        <Link
          href="/parametres"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2"
          style={{
            backgroundColor: isActive('/parametres') ? '#FFF5EB' : 'transparent',
            color: isActive('/parametres') ? '#8B4513' : '#6B5B4F',
          }}
          onMouseEnter={(e) => {
            if (!isActive('/parametres')) e.currentTarget.style.backgroundColor = '#FAF5F0'
          }}
          onMouseLeave={(e) => {
            if (!isActive('/parametres')) e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Paramètres</span>
        </Link>

        {/* Profil */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2"
          style={{ backgroundColor: '#FAF5F0' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
            style={{ backgroundColor: '#8B4513' }}
          >
            {profile?.nom?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" style={{ color: '#5D3A1A' }}>
              {profile?.nom || 'Utilisateur'}
            </p>
            <p className="text-xs truncate" style={{ color: '#8B7355' }}>
              {profile?.email}
            </p>
          </div>
        </div>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-50 disabled:opacity-50"
          style={{ color: '#DC2626' }}
        >
          {loggingOut ? (
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-lg border"
        style={{ borderColor: '#F0E6D8' }}
      >
        <Menu className="w-5 h-5" style={{ color: '#5D3A1A' }} />
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-72 flex flex-col border-r z-50 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#FFFFFF', borderColor: '#F0E6D8' }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-gray-100"
        >
          <X className="w-5 h-5" style={{ color: '#5D3A1A' }} />
        </button>
        <SidebarContent />
      </aside>

      {/* Sidebar desktop */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#F0E6D8' }}
      >
        <SidebarContent />
      </aside>
    </>
  )
}

export default Sidebar
