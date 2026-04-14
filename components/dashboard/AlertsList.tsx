'use client'

import { AlertTriangle, FileWarning, Wrench, Bell, ArrowUpRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { Alerte } from '@/types'

interface AlertsListProps {
  alertes: Alerte[]
  loading?: boolean
}

const DEMO_ALERTES: Partial<Alerte>[] = [
  {
    id: '1',
    type: 'loyer_impaye',
    priorite: 'urgente',
    titre: 'Loyer impayé – Ibrahima Sow',
    message: 'Studio Sacré-Cœur · Retard de 29 jours',
  },
  {
    id: '2',
    type: 'contrat_bientot_expire',
    priorite: 'haute',
    titre: 'Contrat bientôt expiré – Fall M.',
    message: 'Appt Mermoz T2 · Expire dans 12 jours',
  },
  {
    id: '3',
    type: 'travaux',
    priorite: 'moyenne',
    titre: 'Maintenance demandée – Villa B4',
    message: 'Climatisation défectueuse · À planifier',
  },
  {
    id: '4',
    type: 'document',
    priorite: 'faible',
    titre: 'Document manquant – Mbaye O.',
    message: 'Copie CNI non fournie · Commerce Sandaga',
  },
]

const prioriteConfig = {
  urgente: {
    bg: 'rgba(255,68,68,0.08)',
    border: 'rgba(255,68,68,0.2)',
    dot: '#FF4444',
    label: 'Urgent',
    labelBg: 'rgba(255,68,68,0.12)',
    labelColor: '#FF4444',
    labelBorder: 'rgba(255,68,68,0.25)',
  },
  haute: {
    bg: 'rgba(255,144,0,0.08)',
    border: 'rgba(255,144,0,0.2)',
    dot: '#FF9000',
    label: 'Haute',
    labelBg: 'rgba(255,144,0,0.12)',
    labelColor: '#FF9000',
    labelBorder: 'rgba(255,144,0,0.25)',
  },
  moyenne: {
    bg: 'rgba(255,184,0,0.08)',
    border: 'rgba(255,184,0,0.2)',
    dot: '#FFB800',
    label: 'Moyenne',
    labelBg: 'rgba(255,184,0,0.12)',
    labelColor: '#FFB800',
    labelBorder: 'rgba(255,184,0,0.25)',
  },
  faible: {
    bg: 'rgba(100,116,139,0.08)',
    border: 'rgba(100,116,139,0.15)',
    dot: '#64748B',
    label: 'Faible',
    labelBg: 'rgba(100,116,139,0.1)',
    labelColor: '#94A3B8',
    labelBorder: 'rgba(100,116,139,0.2)',
  },
}

const typeIconMap: Record<string, React.ElementType> = {
  loyer_impaye: AlertTriangle,
  contrat_expire: FileWarning,
  contrat_bientot_expire: Clock,
  travaux: Wrench,
  document: FileWarning,
  autre: Bell,
}

const typeIconColorMap: Record<string, string> = {
  loyer_impaye: '#FF4444',
  contrat_expire: '#FF9000',
  contrat_bientot_expire: '#FF9000',
  travaux: '#FFB800',
  document: '#64748B',
  autre: '#0066FF',
}

function SkeletonAlert() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="w-9 h-9 rounded-lg bg-white/5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="w-40 h-3.5 rounded bg-white/5" />
        <div className="w-52 h-3 rounded bg-white/5" />
      </div>
      <div className="w-14 h-5 rounded-full bg-white/5 shrink-0" />
    </div>
  )
}

export default function AlertsList({ alertes, loading = false }: AlertsListProps) {
  const list = alertes.length > 0 ? alertes : (DEMO_ALERTES as Alerte[])
  const isDemo = alertes.length === 0

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
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white">Alertes Prioritaires</h3>
          {!loading && (
            <span
              className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: '#FF4444', color: '#fff' }}
            >
              {list.filter((a) => a.priorite === 'urgente' || a.priorite === 'haute').length}
            </span>
          )}
        </div>
        <Link
          href="/alertes"
          className="flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: '#0066FF' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00D4AA')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#0066FF')}
        >
          Voir tout <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonAlert key={i} />)
          : list.slice(0, 4).map((alerte) => {
              const cfg = prioriteConfig[alerte.priorite]
              const Icon = typeIconMap[alerte.type] ?? Bell
              const iconColor = typeIconColorMap[alerte.type] ?? '#0066FF'

              return (
                <div
                  key={alerte.id}
                  className="flex items-start gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-default"
                  style={{
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${iconColor}18` }}
                  >
                    <Icon size={17} style={{ color: iconColor }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{alerte.titre}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{alerte.message}</p>
                  </div>

                  {/* Priority badge */}
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      background: cfg.labelBg,
                      color: cfg.labelColor,
                      border: `1px solid ${cfg.labelBorder}`,
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>
              )
            })}
      </div>

      {isDemo && (
        <p className="text-xs text-gray-600 mt-4 text-center">Données de démonstration</p>
      )}
    </div>
  )
}
