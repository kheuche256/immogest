'use client'

import { Building2, Users, Wallet, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCard {
  title: string
  value: string
  badge: string
  badgeTrend?: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'red'
  loading?: boolean
}

interface StatsCardsProps {
  totalBiens: number
  biensLoues: number
  locatairesActifs: number
  totalLocataires: number
  revenusMois: number
  revenusMoisPrec: number
  paiementsRetard: number
  montantImpaye: number
  loading?: boolean
}

const colorMap = {
  blue: {
    border: '#0066FF',
    bg: 'rgba(0,102,255,0.08)',
    icon: 'rgba(0,102,255,0.2)',
    iconColor: '#0066FF',
    glow: 'rgba(0,102,255,0.15)',
  },
  green: {
    border: '#00C48C',
    bg: 'rgba(0,196,140,0.08)',
    icon: 'rgba(0,196,140,0.2)',
    iconColor: '#00C48C',
    glow: 'rgba(0,196,140,0.15)',
  },
  yellow: {
    border: '#FFB800',
    bg: 'rgba(255,184,0,0.08)',
    icon: 'rgba(255,184,0,0.2)',
    iconColor: '#FFB800',
    glow: 'rgba(255,184,0,0.15)',
  },
  red: {
    border: '#FF4444',
    bg: 'rgba(255,68,68,0.08)',
    icon: 'rgba(255,68,68,0.2)',
    iconColor: '#FF4444',
    glow: 'rgba(255,68,68,0.15)',
  },
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-6 animate-pulse"
      style={{
        background: 'rgba(17,24,39,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/5" />
        <div className="w-20 h-6 rounded-full bg-white/5" />
      </div>
      <div className="w-24 h-8 rounded bg-white/5 mb-2" />
      <div className="w-32 h-4 rounded bg-white/5" />
    </div>
  )
}

function StatCard({ title, value, badge, badgeTrend, icon: Icon, color, loading }: StatCard) {
  if (loading) return <SkeletonCard />

  const c = colorMap[color]

  return (
    <div
      className="group rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-default"
      style={{
        background: `rgba(17,24,39,0.8)`,
        backdropFilter: 'blur(12px)',
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeft: `3px solid ${c.border}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 32px ${c.glow}, 0 4px 24px rgba(0,0,0,0.3)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: c.icon }}
        >
          <Icon size={22} style={{ color: c.iconColor }} />
        </div>

        {/* Badge */}
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
          style={{
            background: c.bg,
            color: c.border,
            border: `1px solid ${c.border}30`,
          }}
        >
          {badgeTrend === 'up' && <TrendingUp size={11} />}
          {badgeTrend === 'down' && <TrendingDown size={11} />}
          {badge}
        </span>
      </div>

      {/* Value */}
      <div className="text-2xl font-bold text-white mb-1 tracking-tight">{value}</div>

      {/* Title */}
      <div className="text-sm text-gray-400 font-medium">{title}</div>
    </div>
  )
}

export default function StatsCards({
  totalBiens,
  biensLoues,
  locatairesActifs,
  totalLocataires,
  revenusMois,
  revenusMoisPrec,
  paiementsRetard,
  montantImpaye,
  loading = false,
}: StatsCardsProps) {
  const tauxOccupation = totalBiens > 0 ? Math.round((biensLoues / totalBiens) * 100) : 0
  const biensNouveaux = 0 // Could be fetched from DB

  const varRevenues =
    revenusMoisPrec > 0
      ? Math.round(((revenusMois - revenusMoisPrec) / revenusMoisPrec) * 100)
      : 0

  function formatRevenu(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
    return n.toString()
  }

  function formatMontantImpaye(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M FCFA`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k FCFA`
    return `${n} FCFA`
  }

  const cards: StatCard[] = [
    {
      title: 'Total Biens',
      value: totalBiens.toString(),
      badge: biensNouveaux > 0 ? `+${biensNouveaux} ce mois` : `${biensLoues} loués`,
      badgeTrend: 'neutral',
      icon: Building2,
      color: 'blue',
      loading,
    },
    {
      title: 'Locataires Actifs',
      value: locatairesActifs.toString(),
      badge: `${tauxOccupation}% occupation`,
      badgeTrend: tauxOccupation >= 70 ? 'up' : 'down',
      icon: Users,
      color: 'green',
      loading,
    },
    {
      title: 'Revenus du Mois',
      value: `${formatRevenu(revenusMois)} FCFA`,
      badge:
        varRevenues > 0
          ? `+${varRevenues}% vs mois dernier`
          : varRevenues < 0
          ? `${varRevenues}% vs mois dernier`
          : 'Stable',
      badgeTrend: varRevenues > 0 ? 'up' : varRevenues < 0 ? 'down' : 'neutral',
      icon: Wallet,
      color: 'yellow',
      loading,
    },
    {
      title: 'Impayés',
      value: paiementsRetard.toString(),
      badge: montantImpaye > 0 ? formatMontantImpaye(montantImpaye) : 'Aucun impayé',
      badgeTrend: paiementsRetard > 0 ? 'down' : 'up',
      icon: AlertTriangle,
      color: 'red',
      loading,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className="animate-fadeInUp"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
        >
          <StatCard {...card} />
        </div>
      ))}
    </div>
  )
}
