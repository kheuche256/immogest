'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Search,
  LayoutGrid,
  LayoutList,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { useBiens } from '@/hooks/useBiens'
import { Bien } from '@/types'
import BienTable from '@/components/biens/BienTable'
import BienCard from '@/components/biens/BienCard'

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: string
  type: 'success' | 'error'
  message: string
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-fadeInUp pointer-events-auto"
          style={{
            background:
              t.type === 'success' ? 'rgba(0,196,140,0.15)' : 'rgba(255,68,68,0.15)',
            border: `1px solid ${
              t.type === 'success' ? 'rgba(0,196,140,0.35)' : 'rgba(255,68,68,0.35)'
            }`,
            backdropFilter: 'blur(12px)',
            minWidth: 280,
          }}
        >
          {t.type === 'success' ? (
            <CheckCircle size={16} style={{ color: '#00C48C', flexShrink: 0 }} />
          ) : (
            <AlertTriangle size={16} style={{ color: '#FF4444', flexShrink: 0 }} />
          )}
          <span className="text-sm text-white flex-1">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-gray-500 hover:text-white transition-colors ml-2"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Modal Confirmation Suppression ──────────────────────────────────────────

function DeleteModal({
  bien,
  onConfirm,
  onCancel,
}: {
  bien: Bien
  onConfirm: () => Promise<void>
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-fadeInUp"
        style={{
          background: 'rgba(13,18,35,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icône alerte */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{
            background: 'rgba(255,68,68,0.12)',
            border: '1px solid rgba(255,68,68,0.25)',
          }}
        >
          <AlertTriangle size={28} style={{ color: '#FF4444' }} />
        </div>

        <h3 className="text-lg font-bold text-white text-center mb-2">
          Supprimer ce bien ?
        </h3>
        <p className="text-sm text-gray-400 text-center mb-1">
          Vous êtes sur le point de supprimer
        </p>
        <p
          className="text-sm font-bold text-center mb-3"
          style={{ color: '#FF6B6B' }}
        >
          « {bien.nom} »
        </p>
        <p className="text-xs text-gray-500 text-center mb-6 px-4">
          Cette action est irréversible. Toutes les données associées
          (locataires, paiements) seront également supprimées.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-300 transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')
            }
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF4444, #FF6B6B)' }}
          >
            {loading ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                />
                Suppression…
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Options filtres ──────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: '', label: 'Tous les types' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'maison', label: 'Maison' },
  { value: 'studio', label: 'Studio' },
  { value: 'immeuble', label: 'Immeuble' },
  { value: 'local_commercial', label: 'Local commercial' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'terrain', label: 'Terrain' },
]

const STATUT_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'loue', label: 'Loué' },
  { value: 'en_travaux', label: 'En travaux' },
  { value: 'maintenance', label: 'Maintenance' },
]

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#D1D5DB',
  borderRadius: 12,
  padding: '10px 36px 10px 14px',
  fontSize: 14,
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function BiensPage() {
  const router = useRouter()
  const { biens, isLoading, error, deleteBien, stats } = useBiens()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [deleteTarget, setDeleteTarget] = useState<Bien | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Forcer grid view sur mobile
  useEffect(() => {
    function check() {
      if (window.innerWidth < 768) setViewMode('grid')
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Filtrage ───────────────────────────────────────────────────────────────
  const biensFiltres = useMemo(() => {
    return biens.filter((b) => {
      if (search) {
        const q = search.toLowerCase()
        const match =
          b.nom.toLowerCase().includes(q) ||
          b.adresse.toLowerCase().includes(q) ||
          b.ville.toLowerCase().includes(q) ||
          (b.quartier ?? '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (typeFilter && b.type !== typeFilter) return false
      if (statutFilter && b.statut !== statutFilter) return false
      return true
    })
  }, [biens, search, typeFilter, statutFilter])

  const hasFilters = !!(search || typeFilter || statutFilter)

  // ── Toasts ─────────────────────────────────────────────────────────────────
  function addToast(type: Toast['type'], message: string) {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500)
  }

  // ── Suppression ────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    const nom = deleteTarget.nom
    try {
      await deleteBien(deleteTarget.id)
      setDeleteTarget(null)
      addToast('success', `« ${nom} » supprimé avec succès`)
    } catch {
      setDeleteTarget(null)
      addToast('error', `Erreur lors de la suppression de « ${nom} »`)
    }
  }

  // ── Skeleton grid ──────────────────────────────────────────────────────────
  function GridSkeleton() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 animate-pulse"
            style={{
              background: 'rgba(17,24,39,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              height: 220,
            }}
          >
            <div className="flex gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-white/5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-white/5" />
                <div className="h-3 w-20 rounded bg-white/5" />
              </div>
            </div>
            <div className="h-3 w-48 rounded bg-white/5 mb-6" />
            <div className="h-px bg-white/5 mb-4" />
            <div className="flex justify-between">
              <div className="h-5 w-28 rounded bg-white/5" />
              <div className="h-4 w-16 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  function EmptyState() {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 rounded-2xl"
        style={{
          background: 'rgba(17,24,39,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span className="text-5xl mb-4">{hasFilters ? '🔍' : '🏠'}</span>
        <p className="text-white font-semibold mb-2">
          {hasFilters ? 'Aucun résultat trouvé' : 'Aucun bien ajouté'}
        </p>
        <p className="text-sm text-gray-500 mb-6 text-center px-8">
          {hasFilters
            ? 'Essayez de modifier vos critères de recherche'
            : 'Commencez par ajouter votre premier bien immobilier'}
        </p>
        {!hasFilters && (
          <button
            onClick={() => router.push('/biens/nouveau')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-[1.03] transition-transform"
            style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}
          >
            <Plus size={16} /> Ajouter mon premier bien
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))}
      />

      {deleteTarget && (
        <DeleteModal
          bien={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="space-y-6 pb-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,102,255,0.15)' }}
            >
              <Building2 size={20} style={{ color: '#4D9FFF' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mes Biens</h1>
              {!isLoading && (
                <p className="text-sm text-gray-500">
                  <span className="text-gray-400 font-medium">{stats.total}</span> bien{stats.total > 1 ? 's' : ''}{' '}
                  &nbsp;·&nbsp;
                  <span style={{ color: '#4D9FFF' }}>{stats.loues} loué{stats.loues > 1 ? 's' : ''}</span>
                  &nbsp;·&nbsp;
                  <span style={{ color: '#00C48C' }}>{stats.disponibles} disponible{stats.disponibles > 1 ? 's' : ''}</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push('/biens/nouveau')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.03] shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0066FF, #00D4AA)',
              boxShadow: '0 4px 16px rgba(0,102,255,0.3)',
            }}
          >
            <Plus size={18} />
            Nouveau bien
          </button>
        </div>

        {/* ── Filtres ─────────────────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl"
          style={{
            background: 'rgba(17,24,39,0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Recherche */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#6B7280' }}
            />
            <input
              type="text"
              placeholder="Rechercher par nom, adresse, quartier…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-colors duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(0,102,255,0.5)')
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')
              }
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={selectStyle}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: '#0D1223' }}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Statut */}
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            style={selectStyle}
          >
            {STATUT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} style={{ background: '#0D1223' }}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Boutons vue + reset */}
          <div className="flex items-center gap-2 shrink-0">
            {hasFilters && (
              <button
                onClick={() => {
                  setSearch('')
                  setTypeFilter('')
                  setStatutFilter('')
                }}
                className="px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all duration-200"
                style={{
                  background: 'rgba(255,68,68,0.1)',
                  color: '#FF6B6B',
                  border: '1px solid rgba(255,68,68,0.2)',
                }}
              >
                <X size={12} /> Effacer
              </button>
            )}

            <div
              className="hidden md:flex rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <button
                title="Vue tableau"
                onClick={() => setViewMode('table')}
                className="px-3 py-2.5 flex items-center transition-colors duration-200"
                style={{
                  background:
                    viewMode === 'table'
                      ? 'rgba(0,102,255,0.2)'
                      : 'rgba(255,255,255,0.03)',
                  color: viewMode === 'table' ? '#4D9FFF' : '#6B7280',
                }}
              >
                <LayoutList size={16} />
              </button>
              <button
                title="Vue grille"
                onClick={() => setViewMode('grid')}
                className="px-3 py-2.5 flex items-center transition-colors duration-200"
                style={{
                  background:
                    viewMode === 'grid'
                      ? 'rgba(0,102,255,0.2)'
                      : 'rgba(255,255,255,0.03)',
                  color: viewMode === 'grid' ? '#4D9FFF' : '#6B7280',
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Info résultats ───────────────────────────────────────────────── */}
        {!isLoading && hasFilters && (
          <p className="text-sm text-gray-500 -mt-2">
            {biensFiltres.length} résultat{biensFiltres.length > 1 ? 's' : ''} sur{' '}
            {biens.length} bien{biens.length > 1 ? 's' : ''}
          </p>
        )}

        {/* ── Erreur ──────────────────────────────────────────────────────── */}
        {error && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl text-sm"
            style={{
              background: 'rgba(255,68,68,0.08)',
              border: '1px solid rgba(255,68,68,0.2)',
              color: '#FF6B6B',
            }}
          >
            <AlertTriangle size={16} className="shrink-0" />
            Erreur de chargement : {error.message}
          </div>
        )}

        {/* ── Vue Tableau (desktop) ─────────────────────────────────────────── */}
        <div className={viewMode === 'table' ? 'hidden md:block' : 'hidden'}>
          <BienTable
            biens={biensFiltres}
            onEdit={(b) => router.push(`/biens/${b.id}/modifier`)}
            onDelete={(b) => setDeleteTarget(b)}
            loading={isLoading}
          />
        </div>

        {/* ── Vue Grille ────────────────────────────────────────────────────── */}
        <div className={viewMode === 'grid' ? 'block' : 'block md:hidden'}>
          {isLoading ? (
            <GridSkeleton />
          ) : biensFiltres.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {biensFiltres.map((bien, i) => (
                <div
                  key={bien.id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  <BienCard
                    bien={bien}
                    onEdit={(b) => router.push(`/biens/${b.id}/modifier`)}
                    onDelete={(b) => setDeleteTarget(b)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
