'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCharges } from '@/hooks/useCharges'
import { useBiens } from '@/hooks/useBiens'
import {
  Receipt,
  Plus,
  Search,
  Home,
  Zap,
  Droplets,
  Wifi,
  Sparkles,
  Shield,
  Building,
  Trash2,
  Tv,
  Wrench,
  MoreHorizontal,
  Edit,
  Check,
  X,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Config types ───────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, {
  icon: React.ElementType; color: string; bg: string; label: string
}> = {
  electricite: { icon: Zap,           color: '#F59E0B', bg: '#FEF3C7', label: 'Électricité'  },
  eau:         { icon: Droplets,      color: '#0EA5E9', bg: '#E0F2FE', label: 'Eau'           },
  wifi:        { icon: Wifi,          color: '#8B5CF6', bg: '#EDE9FE', label: 'WiFi/Internet' },
  internet:    { icon: Wifi,          color: '#8B5CF6', bg: '#EDE9FE', label: 'Internet'      },
  menage:      { icon: Sparkles,      color: '#EC4899', bg: '#FCE7F3', label: 'Ménage'        },
  gardiennage: { icon: Shield,        color: '#10B981', bg: '#D1FAE5', label: 'Gardiennage'   },
  syndic:      { icon: Building,      color: '#6366F1', bg: '#E0E7FF', label: 'Syndic'        },
  ordures:     { icon: Trash2,        color: '#78716C', bg: '#F5F5F4', label: 'Ordures'       },
  tv:          { icon: Tv,            color: '#EF4444', bg: '#FEE2E2', label: 'TV/Câble'      },
  entretien:   { icon: Wrench,        color: '#8B4513', bg: '#FFF5EB', label: 'Entretien'     },
  reparation:  { icon: Wrench,        color: '#8B4513', bg: '#FFF5EB', label: 'Réparation'    },
  autre:       { icon: MoreHorizontal,color: '#6B7280', bg: '#F3F4F6', label: 'Autre'         },
}

const PERIODICITE_LABELS: Record<string, string> = {
  mensuel:      '/mois',
  trimestriel:  '/trim.',
  annuel:       '/an',
  ponctuel:     '(ponctuel)',
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ChargesPage() {
  const { charges, isLoading, stats, deleteCharge } = useCharges()
  const { biens } = useBiens()

  const [search,      setSearch]      = useState('')
  const [bienFilter,  setBienFilter]  = useState('tous')
  const [deleteId,    setDeleteId]    = useState<string | null>(null)
  const [deleting,    setDeleting]    = useState(false)

  // ── Filtres ────────────────────────────────────────────────────────────────
  const filtered = charges.filter(c => {
    const cfg = TYPE_CONFIG[c.type] ?? TYPE_CONFIG.autre
    const matchSearch = !search ||
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      cfg.label.toLowerCase().includes(search.toLowerCase())
    const matchBien = bienFilter === 'tous' || c.bien_id === bienFilter
    return matchSearch && matchBien
  })

  // ── Suppression ────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleting(true)
    const { error } = await deleteCharge(id)
    setDeleting(false)
    setDeleteId(null)
    if (error) toast.error('Erreur lors de la suppression')
    else       toast.success('Charge supprimée')
  }

  // ── Stats cards ────────────────────────────────────────────────────────────
  const statsCards = [
    { label: 'Total charges',     value: stats.total,                           color: '#8B4513' },
    { label: 'Mensuel',           value: `${fmt(stats.montantMensuel)} F`,      color: '#556B2F' },
    { label: 'Annuel estimé',     value: `${fmt(stats.montantAnnuel)} F`,       color: '#DAA520' },
    { label: 'Incluses au loyer', value: stats.incluses,                        color: '#22C55E' },
  ]

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#5D3A1A' }}>Charges</h1>
          <p className="text-sm" style={{ color: '#8B7355' }}>
            Gérez les charges de vos biens
          </p>
        </div>
        <Link
          href="/charges/nouveau"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 w-fit"
          style={{ backgroundColor: '#8B4513' }}
        >
          <Plus className="w-4 h-4" />
          Nouvelle charge
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border"
            style={{ borderColor: '#F0E6D8' }}
          >
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8B7355' }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8B7355' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une charge…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-all"
            style={{ borderColor: '#F0E6D8', backgroundColor: '#FFFFFF', color: '#5D3A1A' }}
            onFocus={e  => { e.target.style.borderColor = '#8B4513' }}
            onBlur={e   => { e.target.style.borderColor = '#F0E6D8' }}
          />
        </div>
        <select
          value={bienFilter}
          onChange={e => setBienFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 text-sm outline-none"
          style={{ borderColor: '#F0E6D8', backgroundColor: '#FFFFFF', color: '#5D3A1A' }}
        >
          <option value="tous">Tous les biens</option>
          {biens.map(b => (
            <option key={b.id} value={b.id}>{b.nom}</option>
          ))}
        </select>
      </div>

      {/* ── Contenu ── */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B4513' }} />
        </div>

      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 bg-white rounded-2xl border"
          style={{ borderColor: '#F0E6D8' }}
        >
          <Receipt className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: '#8B7355' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: '#5D3A1A' }}>
            {search || bienFilter !== 'tous' ? 'Aucun résultat' : 'Aucune charge'}
          </h3>
          <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
            {search || bienFilter !== 'tous'
              ? 'Modifiez vos critères de recherche'
              : 'Ajoutez vos premières charges pour les suivre'}
          </p>
          {!search && bienFilter === 'tous' && (
            <Link
              href="/charges/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: '#8B4513' }}
            >
              <Plus className="w-4 h-4" />
              Nouvelle charge
            </Link>
          )}
        </div>

      ) : (
        <>
          <p className="text-sm" style={{ color: '#8B7355' }}>
            {filtered.length} charge{filtered.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-3">
            {filtered.map(charge => {
              const cfg  = TYPE_CONFIG[charge.type] ?? TYPE_CONFIG.autre
              const Icon = cfg.icon

              return (
                <div
                  key={charge.id}
                  className="bg-white rounded-2xl border p-4 lg:p-5 transition-all hover:shadow-md"
                  style={{ borderColor: '#F0E6D8' }}
                >
                  <div className="flex items-center gap-4">

                    {/* Icône type */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="font-bold text-sm truncate" style={{ color: '#5D3A1A' }}>
                          {charge.nom}
                        </h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                        {charge.inclus_loyer && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                            style={{ backgroundColor: '#F0F5E8', color: '#556B2F' }}
                          >
                            Inclus
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8B7355' }}>
                        <Home className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{charge.bien?.nom || '—'}</span>
                      </div>
                    </div>

                    {/* Montant */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold" style={{ color: '#5D3A1A' }}>
                        {fmt(charge.montant)} F
                      </p>
                      <p className="text-xs" style={{ color: '#8B7355' }}>
                        {PERIODICITE_LABELS[charge.periodicite] ?? ''}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        href={`/charges/${charge.id}/modifier`}
                        className="p-2 rounded-lg transition-all hover:bg-amber-50"
                        style={{ color: '#8B7355' }}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      {deleteId === charge.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(charge.id)}
                            disabled={deleting}
                            className="p-2 rounded-lg text-white transition-all"
                            style={{ backgroundColor: '#DC2626' }}
                            title="Confirmer"
                          >
                            {deleting
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="p-2 rounded-lg transition-all"
                            style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                            title="Annuler"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(charge.id)}
                          className="p-2 rounded-lg transition-all hover:bg-red-50"
                          style={{ color: '#DC2626' }}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes si présentes */}
                  {charge.notes && (
                    <p
                      className="mt-3 pt-3 text-xs border-t"
                      style={{ borderColor: '#F0E6D8', color: '#8B7355' }}
                    >
                      {charge.notes}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Récap annuel */}
          {stats.montantAnnuel > 0 && (
            <div
              className="rounded-2xl border p-4 flex items-center gap-3"
              style={{ backgroundColor: '#FFF5EB', borderColor: '#F0E6D8' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#8B4513' }}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#5D3A1A' }}>
                  Coût annuel estimé : {fmt(stats.montantAnnuel)} FCFA
                </p>
                <p className="text-xs" style={{ color: '#8B7355' }}>
                  Dont {fmt(stats.montantMensuel)} FCFA/mois de charges récurrentes
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
