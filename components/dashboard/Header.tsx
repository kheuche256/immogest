'use client'

import { usePathname } from 'next/navigation'
import { useProfile } from '@/hooks/useProfile'
import { Bell, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { useAlertes } from '@/hooks/useAlertes'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    "Tableau de bord",
  '/biens':        "Gestion des biens",
  '/locataires':   "Gestion des locataires",
  '/paiements':    "Suivi des paiements",
  '/reservations': "Réservations",
  '/charges':      "Gestion des charges",
  '/inventaire':   "Inventaire",
  '/etats-lieux':  "États des lieux",
  '/alertes':      "Centre d'alertes",
  '/quittances':   "Quittances de loyer",
  '/rapports':     "Rapports & Analyses",
  '/parametres':   "Paramètres",
}

const PAGE_ACTIONS: Record<string, { label: string; href: string }> = {
  '/biens':        { label: 'Nouveau bien',          href: '/biens/nouveau' },
  '/locataires':   { label: 'Nouveau locataire',     href: '/locataires/nouveau' },
  '/paiements':    { label: 'Nouveau paiement',      href: '/paiements/nouveau' },
  '/reservations': { label: 'Nouvelle réservation',  href: '/reservations/nouveau' },
  '/charges':      { label: 'Nouvelle charge',       href: '/charges/nouveau' },
  '/inventaire':   { label: 'Ajouter un item',         href: '/inventaire/nouveau'   },
  '/etats-lieux':  { label: 'Nouvel état des lieux',  href: '/etats-lieux/nouveau'  },
}

export function Header() {
  const pathname = usePathname()
  const { profile } = useProfile()
  const { stats } = useAlertes()

  // Titre courant
  let title = 'KeurGest'
  for (const [path, pageTitle] of Object.entries(PAGE_TITLES)) {
    if (path === '/dashboard' ? pathname === path : pathname.startsWith(path)) {
      title = pageTitle
      break
    }
  }

  // Action contextuelle
  let action: { label: string; href: string } | undefined
  for (const [path, pageAction] of Object.entries(PAGE_ACTIONS)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      action = pageAction
      break
    }
  }

  const alertesNonLues = stats?.nonLues || 0
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header
      className="h-16 lg:h-20 px-4 lg:px-6 flex items-center justify-between border-b sticky top-0 z-10"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#F0E6D8' }}
    >
      {/* Titre + Date */}
      <div className="ml-12 lg:ml-0">
        <h1 className="text-lg lg:text-xl font-bold" style={{ color: '#5D3A1A' }}>
          {title}
        </h1>
        <p className="text-xs lg:text-sm capitalize hidden sm:block" style={{ color: '#8B7355' }}>
          {today}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Bouton action contextuel */}
        {action && (
          <Link
            href={action.href}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: '#8B4513' }}
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </Link>
        )}

        {/* Recherche */}
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: '#8B7355' }}
          />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 rounded-xl border-2 text-sm w-48 lg:w-64 outline-none transition-all"
            style={{
              borderColor: '#F0E6D8',
              backgroundColor: '#FAF5F0',
              color: '#5D3A1A',
            }}
            onFocus={(e)  => { e.target.style.borderColor = '#8B4513' }}
            onBlur={(e)   => { e.target.style.borderColor = '#F0E6D8' }}
          />
        </div>

        {/* Bell alertes */}
        <Link
          href="/alertes"
          className="relative p-2 lg:p-3 rounded-xl transition-all hover:bg-amber-50"
          style={{ backgroundColor: '#FAF5F0' }}
        >
          <Bell className="w-5 h-5" style={{ color: '#8B4513' }} />
          {alertesNonLues > 0 && (
            <span
              className="absolute -top-1 -right-1 text-[10px] font-bold text-white w-5 h-5 flex items-center justify-center rounded-full"
              style={{ backgroundColor: '#DC2626' }}
            >
              {alertesNonLues > 9 ? '9+' : alertesNonLues}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <Link
          href="/parametres"
          className="w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#8B4513' }}
        >
          {profile?.nom?.charAt(0).toUpperCase() || 'U'}
        </Link>
      </div>
    </header>
  )
}

export default Header
