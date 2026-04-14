'use client'

import { ArrowUpRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Bien } from '@/types'

interface TopPropertyItem {
  id: string
  nom: string
  type: string
  quartier?: string
  ville: string
  locataires_total: number
  locataires_actifs: number
  revenus_mensuels: number
}

interface TopPropertiesProps {
  biens: TopPropertyItem[]
  loading?: boolean
}

const DEMO_BIENS: TopPropertyItem[] = [
  { id: '1', nom: 'Villa Almadies B4', type: 'villa', quartier: 'Almadies', ville: 'Dakar', locataires_total: 1, locataires_actifs: 1, revenus_mensuels: 350000 },
  { id: '2', nom: 'Appartement Plateau T3', type: 'appartement', quartier: 'Plateau', ville: 'Dakar', locataires_total: 1, locataires_actifs: 1, revenus_mensuels: 180000 },
  { id: '3', nom: 'Commerce Sandaga', type: 'commerce', quartier: 'Sandaga', ville: 'Dakar', locataires_total: 2, locataires_actifs: 2, revenus_mensuels: 450000 },
]

const typeEmoji: Record<string, string> = {
  villa: '🏡',
  appartement: '🏢',
  maison: '🏠',
  studio: '🛋️',
  bureau: '🏣',
  commerce: '🏪',
  terrain: '🌿',
}

const typeGradient: Record<string, string> = {
  villa: 'linear-gradient(135deg, rgba(0,196,140,0.15), rgba(0,212,170,0.05))',
  appartement: 'linear-gradient(135deg, rgba(0,102,255,0.15), rgba(0,130,255,0.05))',
  maison: 'linear-gradient(135deg, rgba(255,184,0,0.15), rgba(255,200,50,0.05))',
  studio: 'linear-gradient(135deg, rgba(147,112,219,0.15), rgba(180,140,255,0.05))',
  bureau: 'linear-gradient(135deg, rgba(100,116,139,0.15), rgba(130,150,170,0.05))',
  commerce: 'linear-gradient(135deg, rgba(255,144,0,0.15), rgba(255,165,50,0.05))',
  terrain: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(60,220,100,0.05))',
}

function formatRevenu(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M FCFA`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k FCFA`
  return `${n} FCFA`
}

function SkeletonItem() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="w-12 h-12 rounded-xl bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="w-32 h-3.5 rounded bg-white/5" />
        <div className="w-24 h-3 rounded bg-white/5" />
      </div>
      <div className="space-y-2 text-right">
        <div className="w-20 h-3.5 rounded bg-white/5" />
        <div className="w-14 h-3 rounded bg-white/5" />
      </div>
    </div>
  )
}

export default function TopProperties({ biens, loading = false }: TopPropertiesProps) {
  const list = biens.length > 0 ? biens : DEMO_BIENS
  const isDemo = biens.length === 0

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(17,24,39,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white">Top Biens</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isDemo ? 'Données de démonstration' : 'Par revenus générés'}
          </p>
        </div>
        <Link
          href="/biens"
          className="flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: '#0066FF' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00D4AA')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#0066FF')}
        >
          Tous les biens <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonItem key={i} />)
          : list.slice(0, 3).map((bien, idx) => {
              const emoji = typeEmoji[bien.type] ?? '🏠'
              const gradient = typeGradient[bien.type] ?? typeGradient.appartement
              const tauxOcc =
                bien.locataires_total > 0
                  ? Math.round((bien.locataires_actifs / bien.locataires_total) * 100)
                  : 0

              return (
                <div
                  key={bien.id}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-default group"
                  style={{
                    background: gradient,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Rank + emoji */}
                  <div className="relative shrink-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      {emoji}
                    </div>
                    {idx === 0 && (
                      <div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: '#FFB800', color: '#000' }}
                      >
                        1
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{bien.nom}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {bien.quartier ? `${bien.quartier} · ` : ''}{bien.ville}
                    </p>

                    {/* Occupation bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="h-1 rounded-full flex-1"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${tauxOcc}%`,
                            background: tauxOcc >= 80 ? '#00C48C' : tauxOcc >= 50 ? '#FFB800' : '#FF4444',
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {bien.locataires_actifs}/{bien.locataires_total}
                      </span>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{formatRevenu(bien.revenus_mensuels)}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-end gap-0.5">
                      <TrendingUp size={10} className="text-green-400" />
                      <span className="text-green-400">+{tauxOcc}%</span>
                    </p>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}
