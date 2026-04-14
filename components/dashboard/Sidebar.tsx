'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAlertes } from '@/hooks/useAlertes'
import { useProfile } from '@/hooks/useProfile'
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
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

const BASE_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Biens',      href: '/biens',       icon: Building2 },
  { label: 'Locataires', href: '/locataires',  icon: Users },
  { label: 'Paiements',  href: '/paiements',   icon: Wallet },
  { label: 'Alertes',    href: '/alertes',     icon: Bell },
  { label: 'Quittances', href: '/quittances',  icon: FileText },
  { label: 'Rapports',   href: '/rapports',    icon: BarChart3 },
  { label: 'Paramètres', href: '/parametres',  icon: Settings },
]

interface SidebarProps {
  displayName: string
  email: string
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ displayName, email, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { stats: alerteStats } = useAlertes()
  const { profile } = useProfile()

  // Badge dynamique : alertes non lues sur l'item "Alertes"
  const navItems: NavItem[] = BASE_NAV_ITEMS.map((item) =>
    item.href === '/alertes' && alerteStats.nonLues > 0
      ? { ...item, badge: alerteStats.nonLues }
      : item
  )

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{
        width: '280px',
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo entreprise ou icône par défaut */}
          {profile?.logo_url ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Image
                src={profile.logo_url}
                alt="Logo entreprise"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
          ) : (
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl text-xl flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${profile?.couleur_principale ?? '#0066FF'} 0%, #00D4AA 100%)`,
                boxShadow: `0 4px 12px ${profile?.couleur_principale ?? '#0066FF'}55`,
              }}
            >
              🏠
            </div>
          )}
          {/* Brand text */}
          <div className="min-w-0">
            <div
              className="text-lg font-bold leading-tight truncate"
              style={{
                backgroundImage: `linear-gradient(135deg, ${profile?.couleur_principale ?? '#0066FF'}, #00D4AA)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {profile?.entreprise || 'ImmoGest'}
            </div>
            <div className="text-[10px] font-medium tracking-widest uppercase"
              style={{ color: 'rgba(156,163,175,0.7)' }}>
              Gestion Immobilière
            </div>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-white/10 text-gray-400 flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5 scrollbar-hide">
        {/* Section label */}
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(107,114,128,0.8)' }}>
          Navigation
        </p>

        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative"
              style={{
                background: active
                  ? 'linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(0,212,170,0.08) 100%)'
                  : 'transparent',
                color: active ? '#ffffff' : 'rgba(156,163,175,1)',
                borderLeft: active ? '3px solid #00D4AA' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = '#ffffff'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(156,163,175,1)'
                }
              }}
            >
              <Icon
                size={18}
                className="flex-shrink-0 transition-colors"
                style={{ color: active ? '#00D4AA' : 'inherit' }}
              />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none${alerteStats.urgentes > 0 ? ' animate-pulse' : ''}`}
                  style={{
                    background: alerteStats.urgentes > 0
                      ? 'linear-gradient(135deg, #FF0000, #CC0000)'
                      : 'linear-gradient(135deg, #EF4444, #DC2626)',
                    color: '#fff',
                    boxShadow: alerteStats.urgentes > 0
                      ? '0 2px 10px rgba(255,0,0,0.6)'
                      : '0 2px 6px rgba(239,68,68,0.4)',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── User footer ── */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0066FF 0%, #00D4AA 100%)',
              boxShadow: '0 2px 8px rgba(0,102,255,0.3)',
            }}
          >
            {initials}
          </div>
          {/* Name & email */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {displayName}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'rgba(107,114,128,1)' }}>
              {email}
            </p>
          </div>
          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="p-1.5 rounded-lg transition-all flex-shrink-0"
            style={{ color: 'rgba(107,114,128,1)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
              e.currentTarget.style.color = '#F87171'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(107,114,128,1)'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
