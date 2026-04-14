'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, User, LogOut, ChevronDown, Bell, Settings } from 'lucide-react'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { useAlertes } from '@/hooks/useAlertes'
import { useProfile } from '@/hooks/useProfile'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':  { title: 'Tableau de bord',  subtitle: 'Vue d\'ensemble de vos biens' },
  '/biens':      { title: 'Mes Biens',         subtitle: 'Gérez votre portefeuille immobilier' },
  '/locataires': { title: 'Locataires',        subtitle: 'Gestion de vos locataires' },
  '/paiements':  { title: 'Paiements',         subtitle: 'Suivi des loyers et encaissements' },
  '/alertes':    { title: 'Alertes',           subtitle: 'Notifications et rappels importants' },
  '/quittances': { title: 'Quittances',        subtitle: 'Génération des quittances de loyer' },
  '/rapports':   { title: 'Rapports',          subtitle: 'Analyses et statistiques' },
  '/parametres': { title: 'Paramètres',        subtitle: 'Configuration de votre compte' },
}

interface HeaderProps {
  displayName: string
  email: string
  onMenuClick: () => void
}

export default function Header({ displayName, email, onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { profile } = useProfile()

  const nomEntreprise = profile?.entreprise || 'ImmoGest'
  const couleur = profile?.couleur_principale ?? '#0066FF'

  // Find the matching page info
  const matchedKey = Object.keys(pageTitles).find((key) =>
    key === '/dashboard' ? pathname === key : pathname.startsWith(key)
  )
  const pageInfo = matchedKey
    ? pageTitles[matchedKey]
    : { title: nomEntreprise, subtitle: '' }

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const today = formatDate(new Date().toISOString())
  const { stats: alerteStats } = useAlertes()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    setDropdownOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleProfile() {
    setDropdownOpen(false)
    router.push('/parametres')
  }

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16"
      style={{
        background: 'rgba(10, 15, 28, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'rgba(156,163,175,1)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(156,163,175,1)'
          }}
        >
          <Menu size={20} />
        </button>

        {/* Logo mobile (visible uniquement sur petit écran, remplace la sidebar) */}
        <div className="lg:hidden flex-shrink-0">
          {profile?.logo_url ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <Image
                src={profile.logo_url}
                alt={nomEntreprise}
                width={32}
                height={32}
                className="object-contain w-full h-full"
              />
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${couleur} 0%, #00D4AA 100%)`,
                boxShadow: `0 2px 8px ${couleur}55`,
              }}
            >
              🏠
            </div>
          )}
        </div>

        {/* Page title */}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
            {pageInfo.title}
          </h1>
          {pageInfo.subtitle && (
            <p className="text-xs hidden sm:block" style={{ color: 'rgba(107,114,128,1)' }}>
              {pageInfo.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(156,163,175,1)',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: '#00D4AA' }}
          />
          {today}
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-xl transition-all"
          style={{ color: 'rgba(156,163,175,1)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(156,163,175,1)'
          }}
          onClick={() => router.push('/alertes')}
          title={alerteStats.nonLues > 0 ? `${alerteStats.nonLues} alertes non lues` : 'Alertes'}
        >
          <Bell size={18} />
          {alerteStats.nonLues > 0 && (
            <span
              className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white${alerteStats.urgentes > 0 ? ' animate-pulse' : ''}`}
              style={{
                background: alerteStats.urgentes > 0 ? '#FF0000' : '#EF4444',
                borderColor: '#0A0F1C',
              }}
            >
              {alerteStats.nonLues > 9 ? '9+' : alerteStats.nonLues}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-all"
            style={{
              background: dropdownOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={(e) => {
              if (!dropdownOpen)
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            }}
            onMouseLeave={(e) => {
              if (!dropdownOpen)
                e.currentTarget.style.background = 'transparent'
            }}
          >
            {/* Avatar */}
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold text-white flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${couleur} 0%, #00D4AA 100%)`,
                boxShadow: `0 2px 8px ${couleur}50`,
              }}
            >
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium text-white max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown
              size={14}
              className="hidden sm:block transition-transform duration-200"
              style={{
                color: 'rgba(107,114,128,1)',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden"
              style={{
                background: 'rgba(17,24,39,0.97)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* User info header */}
              <div
                className="px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {/* Mini logo entreprise */}
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${couleur}, #00D4AA)` }}
                  >
                    {nomEntreprise.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-[11px] font-semibold truncate" style={{ color: couleur }}>
                    {nomEntreprise}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(107,114,128,1)' }}>
                  {email}
                </p>
              </div>

              {/* Menu items */}
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
                  style={{ color: 'rgba(209,213,219,1)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(209,213,219,1)'
                  }}
                >
                  <User size={15} style={{ color: couleur }} />
                  Mon Profil
                </button>

                <button
                  onClick={() => { setDropdownOpen(false); router.push('/parametres') }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
                  style={{ color: 'rgba(209,213,219,1)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(209,213,219,1)'
                  }}
                >
                  <Settings size={15} style={{ color: 'rgba(156,163,175,1)' }} />
                  Paramètres
                </button>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 8px' }} />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
                  style={{ color: 'rgba(209,213,219,1)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                    e.currentTarget.style.color = '#F87171'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(209,213,219,1)'
                  }}
                >
                  <LogOut size={15} style={{ color: '#EF4444' }} />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
