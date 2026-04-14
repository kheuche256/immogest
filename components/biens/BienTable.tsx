'use client'

import { Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Bien } from '@/types'
import { formatMontant } from '@/lib/utils'

interface BienTableProps {
  biens: Bien[]
  onEdit: (bien: Bien) => void
  onDelete: (bien: Bien) => void
  loading?: boolean
}

// ─── Configs ──────────────────────────────────────────────────────────────────

const typeLabel: Record<string, string> = {
  appartement: 'Appartement', villa: 'Villa', maison: 'Maison',
  studio: 'Studio', bureau: 'Bureau', commerce: 'Commerce',
  local_commercial: 'Local comm.', immeuble: 'Immeuble', terrain: 'Terrain',
}

const typeBadge: Record<string, { bg: string; color: string }> = {
  appartement:     { bg: 'rgba(0,102,255,0.12)',   color: '#4D9FFF' },
  villa:           { bg: 'rgba(0,196,140,0.12)',   color: '#00C48C' },
  maison:          { bg: 'rgba(255,184,0,0.12)',   color: '#FFB800' },
  studio:          { bg: 'rgba(147,112,219,0.12)', color: '#9370DB' },
  bureau:          { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8' },
  commerce:        { bg: 'rgba(255,144,0,0.12)',   color: '#FF9000' },
  local_commercial:{ bg: 'rgba(255,144,0,0.12)',   color: '#FF9000' },
  immeuble:        { bg: 'rgba(0,212,170,0.12)',   color: '#00D4AA' },
  terrain:         { bg: 'rgba(34,197,94,0.12)',   color: '#22C55E' },
}

const statutConfig: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  disponible:  { label: 'Disponible',  bg: 'rgba(0,196,140,0.1)',   color: '#00C48C', dot: '#00C48C' },
  loue:        { label: 'Loué',        bg: 'rgba(0,102,255,0.1)',   color: '#4D9FFF', dot: '#4D9FFF' },
  en_travaux:  { label: 'Travaux',     bg: 'rgba(255,144,0,0.1)',   color: '#FF9000', dot: '#FF9000' },
  maintenance: { label: 'Maintenance', bg: 'rgba(255,144,0,0.1)',   color: '#FF9000', dot: '#FF9000' },
  vendu:       { label: 'Vendu',       bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', dot: '#94A3B8' },
}

const typeEmoji: Record<string, string> = {
  appartement: '🏢', villa: '🏡', maison: '🏠', studio: '🛋️',
  bureau: '🏣', commerce: '🏪', local_commercial: '🏪', immeuble: '🏬', terrain: '🌿',
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[140, 90, 140, 110, 100, 120, 80].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded" style={{ width: w, background: 'rgba(255,255,255,0.05)' }} />
        </td>
      ))}
    </tr>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  const router = useRouter()
  return (
    <tr>
      <td colSpan={7}>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-5xl">{filtered ? '🔍' : '🏠'}</div>
          <div className="text-center">
            <p className="text-white font-semibold mb-1">
              {filtered ? 'Aucun résultat' : 'Aucun bien ajouté'}
            </p>
            <p className="text-sm text-gray-500">
              {filtered
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par ajouter votre premier bien immobilier'}
            </p>
          </div>
          {!filtered && (
            <button
              onClick={() => router.push('/biens/nouveau')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03]"
              style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}
            >
              + Ajouter mon premier bien
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Table principale ─────────────────────────────────────────────────────────

export default function BienTable({ biens, onEdit, onDelete, loading = false }: BienTableProps) {
  const router = useRouter()

  const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#6B7280',
    whiteSpace: 'nowrap',
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(17,24,39,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          {/* Header */}
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={thStyle}>
                <span className="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition-colors">
                  Bien <ArrowUpDown size={11} />
                </span>
              </th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Localisation</th>
              <th style={thStyle}>
                <span className="flex items-center gap-1 cursor-pointer hover:text-gray-300 transition-colors">
                  Loyer <ArrowUpDown size={11} />
                </span>
              </th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Locataire</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : biens.length === 0 ? (
              <EmptyState filtered={false} />
            ) : (
              biens.map((bien, idx) => {
                const statut = statutConfig[bien.statut] ?? statutConfig.disponible
                const type = typeBadge[bien.type] ?? typeBadge.appartement
                const locatairesActifs = bien.locataires?.filter((l) => l.statut === 'actif') ?? []
                const locataire = locatairesActifs[0]

                return (
                  <tr
                    key={bien.id}
                    className="group transition-colors duration-150 cursor-pointer"
                    style={{
                      borderBottom:
                        idx < biens.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                    onClick={() => router.push(`/biens/${bien.id}`)}
                  >
                    {/* Nom */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                          style={{ background: `${type.bg}` }}
                        >
                          {typeEmoji[bien.type] ?? '🏠'}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white leading-tight">{bien.nom}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: type.bg, color: type.color }}
                      >
                        {typeLabel[bien.type] ?? bien.type}
                      </span>
                    </td>

                    {/* Localisation */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-gray-300 leading-tight">
                        {bien.quartier || bien.ville || '—'}
                      </p>
                      {bien.quartier && bien.ville && (
                        <p className="text-xs text-gray-600">{bien.ville}</p>
                      )}
                    </td>

                    {/* Loyer */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-bold text-white whitespace-nowrap">
                        {formatMontant(bien.loyer_mensuel)}
                      </p>
                      {bien.charges && bien.charges > 0 && (
                        <p className="text-xs text-gray-500">
                          +{formatMontant(bien.charges)} charges
                        </p>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
                        style={{
                          background: statut.bg,
                          color: statut.color,
                          border: `1px solid ${statut.color}30`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: statut.dot }}
                        />
                        {statut.label}
                      </span>
                    </td>

                    {/* Locataire */}
                    <td className="px-4 py-3.5">
                      {locataire ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'rgba(0,102,255,0.5)' }}
                          >
                            {locataire.prenom?.[0]}{locataire.nom?.[0]}
                          </div>
                          <span className="text-sm text-gray-300">
                            {locataire.prenom} {locataire.nom}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600 italic">Vacant</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          title="Voir"
                          onClick={() => router.push(`/biens/${bien.id}`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                          style={{ color: '#4D9FFF' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,102,255,0.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Modifier"
                          onClick={() => onEdit(bien)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                          style={{ color: '#FFB800' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,184,0,0.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          title="Supprimer"
                          onClick={() => onDelete(bien)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                          style={{ color: '#FF4444' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,68,68,0.15)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
