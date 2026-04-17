'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useEtatsLieux } from '@/hooks/useEtatsLieux'
import { useBiens } from '@/hooks/useBiens'
import {
  ClipboardList,
  Plus,
  Search,
  LogIn,
  LogOut,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  Zap,
  Droplets,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Config ─────────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  entree: { icon: LogIn,  color: '#22C55E', bg: '#F0FDF4', label: 'Entrée' },
  sortie: { icon: LogOut, color: '#DC2626', bg: '#FEF2F2', label: 'Sortie' },
}

const ETAT_GENERAL_LABELS: Record<string, string> = {
  excellent: 'Excellent',
  bon:       'Bon',
  moyen:     'Moyen',
  mauvais:   'Mauvais',
}

const ETAT_GENERAL_COLORS: Record<string, { color: string; bg: string }> = {
  excellent: { color: '#22C55E', bg: '#F0FDF4' },
  bon:       { color: '#556B2F', bg: '#F0F5E8' },
  moyen:     { color: '#F59E0B', bg: '#FEF3C7' },
  mauvais:   { color: '#DC2626', bg: '#FEF2F2' },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function EtatsLieuxPage() {
  const { etatsLieux, isLoading, stats, deleteEtatLieux } = useEtatsLieux()
  const { biens } = useBiens()

  const [search,      setSearch]      = useState('')
  const [bienFilter,  setBienFilter]  = useState('tous')
  const [typeFilter,  setTypeFilter]  = useState('tous')
  const [deleteId,    setDeleteId]    = useState<string | null>(null)
  const [deleting,    setDeleting]    = useState(false)

  // ── Filtres ────────────────────────────────────────────────────────────────
  const filtered = etatsLieux.filter(e => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      e.bien?.nom?.toLowerCase().includes(q) ||
      e.locataire?.nom?.toLowerCase().includes(q)
    const matchBien = bienFilter === 'tous' || e.bien_id === bienFilter
    const matchType = typeFilter === 'tous' || e.type === typeFilter
    return matchSearch && matchBien && matchType
  })

  // ── Suppression ────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleting(true)
    const { error } = await deleteEtatLieux(id)
    setDeleting(false)
    setDeleteId(null)
    if (error) toast.error('Erreur lors de la suppression')
    else       toast.success('État des lieux supprimé')
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#5D3A1A' }}>États des lieux</h1>
          <p className="text-sm" style={{ color: '#8B7355' }}>
            Documentez les entrées et sorties de vos locataires
          </p>
        </div>
        <Link
          href="/etats-lieux/nouveau"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 w-fit"
          style={{ backgroundColor: '#8B4513' }}
        >
          <Plus className="w-4 h-4" />
          Nouvel état des lieux
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',                value: stats.total,     color: '#8B4513' },
          { label: 'Entrées',              value: stats.entrees,   color: '#22C55E' },
          { label: 'Sorties',              value: stats.sorties,   color: '#DC2626' },
          { label: 'En attente signature', value: stats.enAttente, color: '#DAA520' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#F0E6D8' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#8B7355' }}>{s.label}</p>
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
            placeholder="Bien, locataire…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-all bg-white"
            style={{ borderColor: '#F0E6D8', color: '#5D3A1A' }}
            onFocus={e => { e.target.style.borderColor = '#8B4513' }}
            onBlur={e  => { e.target.style.borderColor = '#F0E6D8' }}
          />
        </div>
        <select
          value={bienFilter}
          onChange={e => setBienFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 text-sm outline-none bg-white"
          style={{ borderColor: '#F0E6D8', color: '#5D3A1A' }}
        >
          <option value="tous">Tous les biens</option>
          {biens.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 text-sm outline-none bg-white"
          style={{ borderColor: '#F0E6D8', color: '#5D3A1A' }}
        >
          <option value="tous">Entrées &amp; Sorties</option>
          <option value="entree">Entrées seulement</option>
          <option value="sortie">Sorties seulement</option>
        </select>
      </div>

      {/* ── Contenu ── */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B4513' }} />
        </div>

      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#F0E6D8' }}>
          <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: '#8B7355' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: '#5D3A1A' }}>
            {search || bienFilter !== 'tous' || typeFilter !== 'tous'
              ? 'Aucun résultat'
              : 'Aucun état des lieux'}
          </h3>
          <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
            {search || bienFilter !== 'tous' || typeFilter !== 'tous'
              ? 'Modifiez vos critères de recherche'
              : 'Commencez par créer votre premier état des lieux'}
          </p>
          {!search && bienFilter === 'tous' && typeFilter === 'tous' && (
            <Link
              href="/etats-lieux/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm hover:opacity-90"
              style={{ backgroundColor: '#8B4513' }}
            >
              <Plus className="w-4 h-4" />
              Créer un état des lieux
            </Link>
          )}
        </div>

      ) : (
        <div className="space-y-3">
          {filtered.map(etat => {
            const cfg     = TYPE_CONFIG[etat.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.entree
            const TypeIcon = cfg.icon
            const etatCfg = etat.etat_general ? ETAT_GENERAL_COLORS[etat.etat_general] : null
            const signed  = etat.signe_proprietaire && etat.signe_locataire

            return (
              <div
                key={etat.id}
                className="bg-white rounded-2xl border overflow-hidden"
                style={{ borderColor: '#F0E6D8' }}
              >
                <div className="px-4 py-4 flex items-center gap-4">

                  {/* Type badge */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <TypeIcon className="w-5 h-5" style={{ color: cfg.color }} />
                  </div>

                  {/* Infos principales */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <span className="font-semibold text-sm truncate" style={{ color: '#5D3A1A' }}>
                        {etat.bien?.nom ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: '#8B7355' }}>
                      <span>{fmtDate(etat.date_etat)}</span>
                      {etat.locataire && (
                        <span className="truncate">· {etat.locataire.nom}</span>
                      )}
                    </div>
                  </div>

                  {/* Relevés */}
                  <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                    {etat.releve_electricite != null && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: '#8B7355' }}>
                        <Zap className="w-3 h-3" style={{ color: '#DAA520' }} />
                        {etat.releve_electricite} kWh
                      </div>
                    )}
                    {etat.releve_eau != null && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: '#8B7355' }}>
                        <Droplets className="w-3 h-3" style={{ color: '#0EA5E9' }} />
                        {etat.releve_eau} m³
                      </div>
                    )}
                  </div>

                  {/* État général */}
                  {etat.etat_general && etatCfg && (
                    <span
                      className="hidden sm:block text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: etatCfg.bg, color: etatCfg.color }}
                    >
                      {ETAT_GENERAL_LABELS[etat.etat_general]}
                    </span>
                  )}

                  {/* Signature */}
                  <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                    {signed ? (
                      <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                        style={{ backgroundColor: '#F0F5E8', color: '#556B2F' }}>
                        <CheckCircle className="w-3 h-3" /> Signé
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                        style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
                        <Clock className="w-3 h-3" /> En attente
                      </span>
                    )}
                  </div>

                  {/* Anomalies */}
                  {etat.anomalies && (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 hidden md:block" style={{ color: '#F59E0B' }} />
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      href={`/etats-lieux/${etat.id}`}
                      className="p-1.5 rounded-lg transition-all hover:bg-amber-50"
                      style={{ color: '#8B7355' }}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/etats-lieux/${etat.id}/modifier`}
                      className="p-1.5 rounded-lg transition-all hover:bg-amber-50"
                      style={{ color: '#8B7355' }}
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    {deleteId === etat.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(etat.id)}
                          disabled={deleting}
                          className="p-1.5 rounded-lg text-white"
                          style={{ backgroundColor: '#DC2626' }}
                        >
                          {deleting
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="p-1.5 rounded-lg"
                          style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(etat.id)}
                        className="p-1.5 rounded-lg transition-all hover:bg-red-50"
                        style={{ color: '#DC2626' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Anomalies banner */}
                {etat.anomalies && (
                  <div
                    className="px-4 py-2 text-xs flex items-start gap-2 border-t"
                    style={{ backgroundColor: '#FFFBEB', borderColor: '#FEF3C7', color: '#92400E' }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
                    <span className="line-clamp-1">{etat.anomalies}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
