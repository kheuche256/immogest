'use client'

import { Eye, Trash2, CheckCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import { Paiement } from '@/hooks/usePaiements'
import { useRouter } from 'next/navigation'

interface PaiementTableProps {
  paiements: Paiement[]
  isLoading?: boolean
  onMarquerPaye: (paiement: Paiement) => void
  onDelete: (paiement: Paiement) => void
}

function formatMontant(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

function formatMois(mois: string) {
  const [year, month] = mois.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR')
}

function isEcheancePassee(date: string | null, statut: string) {
  if (!date || statut === 'payé') return false
  return new Date(date) < new Date()
}

function getAvatarColor(nom: string) {
  const colors = ['#0066FF', '#00C48C', '#FFB800', '#FF6B6B', '#9370DB', '#FF8C42', '#20C9C9']
  return colors[(nom.charCodeAt(0) || 0) % colors.length]
}

function getModeLabel(mode: string | null) {
  if (!mode) return '—'
  const map: Record<string, string> = {
    especes: '💵 Espèces',
    wave: '🌊 Wave',
    om: '🟠 OM',
    virement: '🏦 Virement',
  }
  return map[mode] ?? mode
}

function StatutBadge({ statut }: { statut: Paiement['statut'] }) {
  if (statut === 'payé') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: 'rgba(0,196,140,0.15)', color: '#00C48C', border: '1px solid rgba(0,196,140,0.2)' }}>
      <CheckCircle size={11} /> Payé
    </span>
  )
  if (statut === 'en_attente') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: 'rgba(255,184,0,0.12)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.2)' }}>
      <Clock size={11} /> En attente
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse"
      style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
      <AlertTriangle size={11} /> Retard
    </span>
  )
}

// Skeleton row
function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: i === 0 ? '80%' : '60%' }} />
        </td>
      ))}
    </tr>
  )
}

export default function PaiementTable({ paiements, isLoading, onMarquerPaye, onDelete }: PaiementTableProps) {
  const router = useRouter()

  if (!isLoading && paiements.length === 0) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Locataire', 'Mois', 'Montant', 'Échéance', 'Statut', 'Mode', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : paiements.map((p) => {
                  const nom = p.locataire ? `${p.locataire.prenom ?? ''} ${p.locataire.nom}`.trim() : 'Locataire'
                  const avatarColor = getAvatarColor(p.locataire?.nom ?? 'L')
                  const initiales = nom.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                  const echeanceRouge = isEcheancePassee(p.date_echeance, p.statut)

                  return (
                    <tr
                      key={p.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                    >
                      {/* Locataire */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: `linear-gradient(135deg,${avatarColor},${avatarColor}bb)` }}>
                            {initiales}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{nom}</p>
                            <p className="text-xs text-gray-500">{p.bien?.nom ?? '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Mois */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-300 capitalize">{formatMois(p.mois)}</span>
                      </td>

                      {/* Montant */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-white">{formatMontant(p.montant)}</span>
                      </td>

                      {/* Échéance */}
                      <td className="px-4 py-3">
                        <span className={`text-sm ${echeanceRouge ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                          {formatDate(p.date_echeance)}
                          {echeanceRouge && <span className="ml-1 text-xs">⚠</span>}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <StatutBadge statut={p.statut} />
                      </td>

                      {/* Mode */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">{getModeLabel(p.mode_paiement)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Marquer payé */}
                          {(p.statut === 'en_attente' || p.statut === 'retard') && (
                            <button
                              onClick={() => onMarquerPaye(p)}
                              title="Marquer payé"
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: 'rgba(0,196,140,0.12)', color: '#00C48C', border: '1px solid rgba(0,196,140,0.2)' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,196,140,0.25)' }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,196,140,0.12)' }}
                            >
                              <CheckCircle size={13} />
                            </button>
                          )}
                          {/* Voir */}
                          <button
                            onClick={() => router.push(`/paiements/${p.id}`)}
                            title="Voir détail"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}
                            onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(255,255,255,0.1)'; b.style.color = '#fff' }}
                            onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(255,255,255,0.05)'; b.style.color = '#9ca3af' }}
                          >
                            <Eye size={13} />
                          </button>
                          {/* Supprimer */}
                          <button
                            onClick={() => onDelete(p)}
                            title="Supprimer"
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
