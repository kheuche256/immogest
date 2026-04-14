'use client'

import { Eye, Pencil, Trash2, MapPin, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Bien } from '@/types'
import { formatMontant } from '@/lib/utils'

interface BienCardProps {
  bien: Bien
  onEdit: (bien: Bien) => void
  onDelete: (bien: Bien) => void
}

// ─── Configs visuelles ────────────────────────────────────────────────────────

const typeEmoji: Record<string, string> = {
  appartement: '🏢',
  villa: '🏡',
  maison: '🏠',
  studio: '🛋️',
  bureau: '🏣',
  commerce: '🏪',
  local_commercial: '🏪',
  immeuble: '🏬',
  terrain: '🌿',
}

const typeLabel: Record<string, string> = {
  appartement: 'Appartement',
  villa: 'Villa',
  maison: 'Maison',
  studio: 'Studio',
  bureau: 'Bureau',
  commerce: 'Commerce',
  local_commercial: 'Local commercial',
  immeuble: 'Immeuble',
  terrain: 'Terrain',
}

const statutConfig: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
  disponible: { label: 'Disponible', bg: 'rgba(0,196,140,0.1)', color: '#00C48C', border: 'rgba(0,196,140,0.25)', dot: '#00C48C' },
  loue:       { label: 'Loué',       bg: 'rgba(0,102,255,0.1)', color: '#4D9FFF', border: 'rgba(0,102,255,0.25)', dot: '#4D9FFF' },
  en_travaux: { label: 'Travaux',    bg: 'rgba(255,144,0,0.1)', color: '#FF9000', border: 'rgba(255,144,0,0.25)',  dot: '#FF9000' },
  maintenance:{ label: 'Maintenance',bg: 'rgba(255,144,0,0.1)', color: '#FF9000', border: 'rgba(255,144,0,0.25)', dot: '#FF9000' },
  vendu:      { label: 'Vendu',      bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: 'rgba(100,116,139,0.25)', dot: '#94A3B8' },
}

const typeGradient: Record<string, string> = {
  villa:           'rgba(0,196,140,0.06)',
  appartement:     'rgba(0,102,255,0.06)',
  maison:          'rgba(255,184,0,0.06)',
  studio:          'rgba(147,112,219,0.06)',
  bureau:          'rgba(100,116,139,0.06)',
  commerce:        'rgba(255,144,0,0.06)',
  local_commercial:'rgba(255,144,0,0.06)',
  immeuble:        'rgba(0,212,170,0.06)',
  terrain:         'rgba(34,197,94,0.06)',
}

export default function BienCard({ bien, onEdit, onDelete }: BienCardProps) {
  const router = useRouter()
  const statut = statutConfig[bien.statut] ?? statutConfig.disponible
  const locatairesActifs = bien.locataires?.filter((l) => l.statut === 'actif') ?? []
  const bg = typeGradient[bien.type] ?? 'rgba(17,24,39,0.8)'

  return (
    <div
      className="group rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        background: `rgba(17,24,39,0.85)`,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `color-mix(in srgb, ${bg} 60%, rgba(17,24,39,0.85))`
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(17,24,39,0.85)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
      }}
      onClick={() => router.push(`/biens/${bien.id}`)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${bg.replace('0.06', '0.15')}` }}
          >
            {typeEmoji[bien.type] ?? '🏠'}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{bien.nom}</h3>
            <span className="text-xs text-gray-500">{typeLabel[bien.type] ?? bien.type}</span>
          </div>
        </div>

        {/* Statut badge */}
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1.5"
          style={{ background: statut.bg, color: statut.color, border: `1px solid ${statut.border}` }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: statut.dot }} />
          {statut.label}
        </span>
      </div>

      {/* Address */}
      {(bien.adresse || bien.quartier || bien.ville) && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin size={12} className="shrink-0 text-gray-600" />
          <span className="truncate">
            {[bien.quartier, bien.ville].filter(Boolean).join(', ')}
          </span>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

      {/* Bottom row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Loyer mensuel</p>
          <p className="text-base font-bold text-white">{formatMontant(bien.loyer_mensuel)}</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users size={12} />
          {locatairesActifs.length > 0 ? (
            <span style={{ color: '#4D9FFF' }}>
              {locatairesActifs[0].prenom} {locatairesActifs[0].nom}
            </span>
          ) : (
            <span className="text-gray-600">Vacant</span>
          )}
        </div>
      </div>

      {/* Actions — visibles au hover */}
      <div
        className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => router.push(`/biens/${bien.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200"
          style={{ background: 'rgba(0,102,255,0.12)', color: '#4D9FFF', border: '1px solid rgba(0,102,255,0.2)' }}
        >
          <Eye size={13} /> Voir
        </button>
        <button
          onClick={() => onEdit(bien)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200"
          style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.2)' }}
        >
          <Pencil size={13} /> Modifier
        </button>
        <button
          onClick={() => onDelete(bien)}
          className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
          style={{ background: 'rgba(255,68,68,0.1)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.2)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
