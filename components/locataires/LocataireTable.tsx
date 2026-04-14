'use client'

import { Eye, Pencil, Trash2, MessageCircle, ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Locataire } from '@/types'
import { formatDate } from '@/lib/utils'

interface LocataireTableProps {
  locataires: Locataire[]
  onDelete: (l: Locataire) => void
  loading?: boolean
}

// ─── Helpers avatar ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
]

function getAvatarColor(nom: string): string {
  return AVATAR_COLORS[nom.charCodeAt(0) % AVATAR_COLORS.length]
}

function getInitiales(prenom: string, nom: string): string {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase()
}

// ─── Configs statut ───────────────────────────────────────────────────────────

const statutConfig = {
  actif:       { label: 'Actif',       bg: 'rgba(0,196,140,0.1)',   color: '#00C48C', border: 'rgba(0,196,140,0.25)' },
  inactif:     { label: 'Inactif',     bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: 'rgba(100,116,139,0.25)' },
  parti:       { label: 'Parti',       bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: 'rgba(100,116,139,0.25)' },
  en_attente:  { label: 'En attente',  bg: 'rgba(255,184,0,0.1)',   color: '#FFB800', border: 'rgba(255,184,0,0.25)' },
  en_retard:   { label: 'En retard',   bg: 'rgba(255,68,68,0.1)',   color: '#FF4444', border: 'rgba(255,68,68,0.25)' },
} as const

// ─── Badge expiration contrat ─────────────────────────────────────────────────

function ContratBadge({ date }: { date?: string | null }) {
  if (!date) return <span className="text-sm text-gray-600">—</span>

  const fin = new Date(date)
  const now = new Date()
  const joursRestants = Math.ceil((fin.getTime() - now.getTime()) / 86_400_000)
  const dateStr = formatDate(date)

  if (joursRestants < 0) {
    return (
      <div>
        <p className="text-xs text-gray-400 mb-1">{dateStr}</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,68,68,0.12)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.25)' }}>
          Expiré
        </span>
      </div>
    )
  }

  if (joursRestants <= 30) {
    return (
      <div>
        <p className="text-xs text-gray-400 mb-1">{dateStr}</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,144,0,0.12)', color: '#FF9000', border: '1px solid rgba(255,144,0,0.25)' }}>
          {joursRestants}j restants
        </span>
      </div>
    )
  }

  return <span className="text-sm text-gray-300">{dateStr}</span>
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[200, 140, 90, 100, 90, 100, 80].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded" style={{ width: w, background: 'rgba(255,255,255,0.05)' }} />
          {i === 0 && <div className="h-3 w-24 rounded mt-1.5" style={{ background: 'rgba(255,255,255,0.03)' }} />}
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
          <span className="text-5xl">{filtered ? '🔍' : '👥'}</span>
          <div className="text-center">
            <p className="text-white font-semibold mb-1">
              {filtered ? 'Aucun résultat' : 'Aucun locataire ajouté'}
            </p>
            <p className="text-sm text-gray-500">
              {filtered
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par ajouter votre premier locataire'}
            </p>
          </div>
          {!filtered && (
            <button
              onClick={() => router.push('/locataires/nouveau')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-[1.03] transition-transform"
              style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}
            >
              + Ajouter un locataire
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function LocataireTable({ locataires, onDelete, loading = false }: LocataireTableProps) {
  const router = useRouter()
  const filtered = locataires.length === 0 && !loading

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

          {/* ── Header ─────────────────────────────────────────────────── */}
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={thStyle}>
                <span className="flex items-center gap-1 cursor-pointer hover:text-gray-300">
                  Locataire <ArrowUpDown size={11} />
                </span>
              </th>
              <th style={thStyle}>Logement</th>
              <th style={thStyle}>Entrée</th>
              <th style={thStyle}>Fin contrat</th>
              <th style={thStyle}>Paiement</th>
              <th style={thStyle}>Statut</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>

          {/* ── Body ───────────────────────────────────────────────────── */}
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : locataires.length === 0
              ? <EmptyState filtered={false} />
              : locataires.map((loc, idx) => {
                  const cfg = statutConfig[loc.statut] ?? statutConfig.inactif
                  const avatarColor = getAvatarColor(loc.nom)
                  const initiales = getInitiales(loc.prenom ?? '', loc.nom)
                  const tel = loc.telephone.replace(/\s/g, '')
                  const waLink = `https://wa.me/221${tel}?text=${encodeURIComponent(`Bonjour ${loc.prenom ?? loc.nom}, c'est ImmoGest.`)}`

                  return (
                    <tr
                      key={loc.id}
                      className="group transition-colors duration-150 cursor-pointer"
                      style={{
                        borderBottom: idx < locataires.length - 1
                          ? '1px solid rgba(255,255,255,0.04)'
                          : 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => router.push(`/locataires/${loc.id}`)}
                    >

                      {/* Avatar + Nom */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: `${avatarColor}CC` }}
                          >
                            {initiales}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white leading-tight">
                              {loc.prenom ? `${loc.prenom} ${loc.nom}` : loc.nom}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{loc.telephone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Bien */}
                      <td className="px-4 py-3.5">
                        {loc.bien ? (
                          <div>
                            <p className="text-sm text-gray-300 font-medium leading-tight">
                              {(loc.bien as any).nom}
                            </p>
                            {(loc.bien as any).quartier && (
                              <p className="text-xs text-gray-600 mt-0.5">{(loc.bien as any).quartier}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600 italic">Sans logement</span>
                        )}
                      </td>

                      {/* Date entrée */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-300">
                          {loc.date_entree ? formatDate(loc.date_entree) : '—'}
                        </span>
                      </td>

                      {/* Fin contrat */}
                      <td className="px-4 py-3.5">
                        <ContratBadge date={loc.date_fin_contrat} />
                      </td>

                      {/* Statut paiement */}
                      <td className="px-4 py-3.5">
                        {loc.statut === 'en_retard' ? (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
                            style={{ background: 'rgba(255,68,68,0.1)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.25)' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Retard
                          </span>
                        ) : loc.statut === 'actif' ? (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
                            style={{ background: 'rgba(0,196,140,0.1)', color: '#00C48C', border: '1px solid rgba(0,196,140,0.25)' }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            À jour
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>

                      {/* Statut locataire */}
                      <td className="px-4 py-3.5">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                        >
                          {cfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Voir */}
                          <ActionBtn
                            title="Voir le profil"
                            color="#4D9FFF"
                            onClick={() => router.push(`/locataires/${loc.id}`)}
                          >
                            <Eye size={15} />
                          </ActionBtn>

                          {/* Modifier */}
                          <ActionBtn
                            title="Modifier"
                            color="#FFB800"
                            onClick={() => router.push(`/locataires/${loc.id}/modifier`)}
                          >
                            <Pencil size={15} />
                          </ActionBtn>

                          {/* WhatsApp */}
                          <ActionBtn
                            title="Envoyer un message WhatsApp"
                            color="#25D366"
                            onClick={() => window.open(waLink, '_blank')}
                          >
                            <MessageCircle size={15} />
                          </ActionBtn>

                          {/* Supprimer */}
                          <ActionBtn
                            title="Supprimer"
                            color="#FF4444"
                            onClick={() => onDelete(loc)}
                          >
                            <Trash2 size={15} />
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Bouton action réutilisable ───────────────────────────────────────────────

function ActionBtn({
  children,
  onClick,
  title,
  color,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  color: string
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
      style={{ color }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${color}20`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  )
}
