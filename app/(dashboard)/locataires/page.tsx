'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Search, Plus, X, AlertTriangle,
  CheckCircle, LayoutGrid, LayoutList,
  Phone, MapPin, CalendarDays, MessageCircle,
  Eye, Pencil, Trash2,
} from 'lucide-react'
import { useLocataires } from '@/hooks/useLocataires'
import { useBiens } from '@/hooks/useBiens'
import { Locataire } from '@/types'
import LocataireTable from '@/components/locataires/LocataireTable'
import { formatDate } from '@/lib/utils'

// ─── Helpers avatar ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
]

function getAvatarColor(nom: string) {
  return AVATAR_COLORS[nom.charCodeAt(0) % AVATAR_COLORS.length]
}

function getInitiales(prenom: string, nom: string) {
  return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase()
}

// ─── Configs statut ───────────────────────────────────────────────────────────

const statutConfig = {
  actif:      { label: 'Actif',      bg: 'rgba(0,196,140,0.1)',   color: '#00C48C', border: 'rgba(0,196,140,0.25)' },
  inactif:    { label: 'Inactif',    bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: 'rgba(100,116,139,0.25)' },
  parti:      { label: 'Parti',      bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: 'rgba(100,116,139,0.25)' },
  en_attente: { label: 'En attente', bg: 'rgba(255,184,0,0.1)',   color: '#FFB800', border: 'rgba(255,184,0,0.25)' },
  en_retard:  { label: 'En retard',  bg: 'rgba(255,68,68,0.1)',   color: '#FF4444', border: 'rgba(255,68,68,0.25)' },
} as const

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastData { id: string; type: 'success' | 'error'; msg: string }

function ToastStack({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-fadeInUp pointer-events-auto"
          style={{
            background: t.type === 'success' ? 'rgba(0,196,140,0.15)' : 'rgba(255,68,68,0.15)',
            border: `1px solid ${t.type === 'success' ? 'rgba(0,196,140,0.35)' : 'rgba(255,68,68,0.35)'}`,
            backdropFilter: 'blur(12px)', minWidth: 280,
          }}>
          {t.type === 'success'
            ? <CheckCircle size={16} style={{ color: '#00C48C', flexShrink: 0 }} />
            : <AlertTriangle size={16} style={{ color: '#FF4444', flexShrink: 0 }} />}
          <span className="text-sm text-white flex-1">{t.msg}</span>
          <button onClick={() => onDismiss(t.id)}
            className="text-gray-500 hover:text-white transition-colors ml-2">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Modal suppression ────────────────────────────────────────────────────────

function DeleteModal({
  locataire, onConfirm, onCancel,
}: { locataire: Locataire; onConfirm: () => Promise<void>; onCancel: () => void }) {
  const [loading, setLoading] = useState(false)
  const avatarColor = getAvatarColor(locataire.nom)
  const initiales = getInitiales(locataire.prenom ?? '', locataire.nom)
  const fullName = locataire.prenom ? `${locataire.prenom} ${locataire.nom}` : locataire.nom

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
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.25)' }}>
          <AlertTriangle size={28} style={{ color: '#FF4444' }} />
        </div>

        <h3 className="text-lg font-bold text-white text-center mb-3">
          Supprimer ce locataire ?
        </h3>

        {/* Aperçu */}
        <div className="flex items-center gap-3 p-3 rounded-xl mb-4 mx-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: `${avatarColor}CC` }}>
            {initiales}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{fullName}</p>
            <p className="text-xs text-gray-500">{locataire.telephone}</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mb-6 px-4">
          Cette action est irréversible. L'historique des paiements sera supprimé
          et le logement associé redeviendra disponible.
        </p>

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-300 transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Annuler
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false) }}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF4444, #FF6B6B)' }}>
            {loading
              ? <span className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card mobile ──────────────────────────────────────────────────────────────

function LocataireCard({ loc, onDelete }: { loc: Locataire; onDelete: (l: Locataire) => void }) {
  const router = useRouter()
  const cfg = statutConfig[loc.statut as keyof typeof statutConfig] ?? statutConfig.inactif
  const avatarColor = getAvatarColor(loc.nom)
  const initiales = getInitiales(loc.prenom ?? '', loc.nom)
  const tel = loc.telephone.replace(/\s/g, '')
  const waLink = `https://wa.me/221${tel}?text=${encodeURIComponent(`Bonjour ${loc.prenom ?? loc.nom}, c'est ImmoGest.`)}`
  const fullName = loc.prenom ? `${loc.prenom} ${loc.nom}` : loc.nom

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
      style={{
        background: 'rgba(17,24,39,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}
      onClick={() => router.push(`/locataires/${loc.id}`)}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: `${avatarColor}CC` }}>
          {initiales}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{fullName}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Phone size={10} /> {loc.telephone}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
          {cfg.label}
        </span>
      </div>

      {/* Bien */}
      {loc.bien && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin size={11} style={{ color: '#6B7280' }} />
          <span className="truncate">{(loc.bien as any).nom}</span>
        </div>
      )}

      {/* Date entrée */}
      {loc.date_entree && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarDays size={11} />
          <span>Entrée le {formatDate(loc.date_entree)}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        onClick={(e) => e.stopPropagation()}>
        <button onClick={() => router.push(`/locataires/${loc.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ background: 'rgba(0,102,255,0.1)', color: '#4D9FFF' }}>
          <Eye size={13} /> Voir
        </button>
        <button onClick={() => router.push(`/locataires/${loc.id}/modifier`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800' }}>
          <Pencil size={13} /> Modifier
        </button>
        <button onClick={() => window.open(waLink, '_blank')}
          className="px-3 py-2 rounded-lg transition-colors"
          style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366' }}>
          <MessageCircle size={14} />
        </button>
        <button onClick={() => onDelete(loc)}
          className="px-3 py-2 rounded-lg transition-colors"
          style={{ background: 'rgba(255,68,68,0.1)', color: '#FF4444' }}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Style select partagé ─────────────────────────────────────────────────────

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

export default function LocatairesPage() {
  const router = useRouter()
  const { locataires, isLoading, error, deleteLocataire, stats } = useLocataires()
  const { biens } = useBiens()

  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [bienFilter, setBienFilter] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [deleteTarget, setDeleteTarget] = useState<Locataire | null>(null)
  const [toasts, setToasts] = useState<ToastData[]>([])

  // Forcer grid sur mobile
  useEffect(() => {
    function check() { if (window.innerWidth < 768) setViewMode('grid') }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Filtrage côté client ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return locataires.filter((l) => {
      if (search) {
        const q = search.toLowerCase()
        const fullName = `${l.prenom ?? ''} ${l.nom}`.toLowerCase()
        if (
          !fullName.includes(q) &&
          !l.telephone.includes(q) &&
          !(l.email ?? '').toLowerCase().includes(q)
        ) return false
      }
      if (statutFilter && l.statut !== statutFilter) return false
      if (bienFilter === '__sans__' && l.bien_id) return false
      if (bienFilter && bienFilter !== '__sans__' && l.bien_id !== bienFilter) return false
      return true
    })
  }, [locataires, search, statutFilter, bienFilter])

  const hasFilters = !!(search || statutFilter || bienFilter)

  // ── Contrats expirant dans 30 jours ───────────────────────────────────────
  const expirantBientot = useMemo(() => {
    const now = new Date()
    return locataires.filter((l) => {
      const dateRef = l.date_fin_contrat
      if (!dateRef) return false
      const fin = new Date(dateRef)
      const jours = Math.ceil((fin.getTime() - now.getTime()) / 86_400_000)
      return jours > 0 && jours <= 30
    })
  }, [locataires])

  // ── Toasts ─────────────────────────────────────────────────────────────────
  function addToast(type: ToastData['type'], msg: string) {
    const id = Date.now().toString()
    setToasts((p) => [...p, { id, type, msg }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500)
  }

  // ── Suppression ────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    const nom = deleteTarget.prenom
      ? `${deleteTarget.prenom} ${deleteTarget.nom}`
      : deleteTarget.nom
    try {
      await deleteLocataire(deleteTarget.id)
      setDeleteTarget(null)
      addToast('success', `${nom} supprimé avec succès`)
    } catch {
      setDeleteTarget(null)
      addToast('error', `Erreur lors de la suppression de ${nom}`)
    }
  }

  // ── Skeletons ──────────────────────────────────────────────────────────────
  function GridSkeleton() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4 animate-pulse"
            style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)', height: 180 }}>
            <div className="flex gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-white/5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 rounded bg-white/5" />
                <div className="h-3 w-20 rounded bg-white/5" />
              </div>
              <div className="w-16 h-6 rounded-full bg-white/5" />
            </div>
            <div className="h-3 w-36 rounded bg-white/5 mb-2" />
            <div className="h-3 w-28 rounded bg-white/5 mb-4" />
            <div className="h-px bg-white/5 mb-3" />
            <div className="flex gap-2">
              <div className="flex-1 h-8 rounded-lg bg-white/5" />
              <div className="flex-1 h-8 rounded-lg bg-white/5" />
              <div className="w-9 h-8 rounded-lg bg-white/5" />
              <div className="w-9 h-8 rounded-lg bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  function EmptyState() {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
        style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-5xl mb-4">{hasFilters ? '🔍' : '👥'}</span>
        <p className="text-white font-semibold mb-2">
          {hasFilters ? 'Aucun résultat trouvé' : 'Aucun locataire ajouté'}
        </p>
        <p className="text-sm text-gray-500 mb-6 text-center px-8">
          {hasFilters
            ? 'Modifiez vos critères de recherche'
            : 'Ajoutez votre premier locataire pour commencer'}
        </p>
        {!hasFilters && (
          <button onClick={() => router.push('/locataires/nouveau')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-[1.02] transition-transform"
            style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}>
            <Plus size={16} /> Ajouter un locataire
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))}
      />

      {deleteTarget && (
        <DeleteModal
          locataire={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="space-y-6 pb-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(16,185,129,0.15)' }}>
              <Users size={20} style={{ color: '#10B981' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mes Locataires</h1>
              {!isLoading && (
                <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
                  <span style={{ color: '#D1D5DB', fontWeight: 600 }}>{stats.total}</span> total
                  {' · '}
                  <span style={{ color: '#00C48C' }}>{stats.actifs} actif{stats.actifs > 1 ? 's' : ''}</span>
                  {stats.enRetard > 0 && (
                    <>{' · '}<span style={{ color: '#FF4444' }}>{stats.enRetard} en retard</span></>
                  )}
                  {stats.enAttente > 0 && (
                    <>{' · '}<span style={{ color: '#FFB800' }}>{stats.enAttente} en attente</span></>
                  )}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push('/locataires/nouveau')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-[1.03] transition-all duration-200 shrink-0"
            style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)', boxShadow: '0 4px 16px rgba(0,102,255,0.3)' }}>
            <Plus size={18} /> Nouveau locataire
          </button>
        </div>

        {/* ── Alerte contrats expirant ─────────────────────────────────────── */}
        {!isLoading && expirantBientot.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(255,144,0,0.08)', border: '1px solid rgba(255,144,0,0.2)', color: '#FF9000' }}>
            <AlertTriangle size={16} className="shrink-0" />
            <span>
              <strong>{expirantBientot.length} contrat{expirantBientot.length > 1 ? 's' : ''}</strong>
              {' '}expire{expirantBientot.length > 1 ? 'nt' : ''} dans moins de 30 jours :
              {' '}
              <span className="font-semibold">
                {expirantBientot.map((l) => l.prenom ? `${l.prenom} ${l.nom}` : l.nom).join(', ')}
              </span>
            </span>
          </div>
        )}

        {/* ── Filtres ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Recherche */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,102,255,0.5)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Statut */}
          <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} style={selectStyle}>
            <option value="" style={{ background: '#0D1223' }}>Tous les statuts</option>
            <option value="actif" style={{ background: '#0D1223' }}>Actif</option>
            <option value="en_attente" style={{ background: '#0D1223' }}>En attente</option>
            <option value="en_retard" style={{ background: '#0D1223' }}>En retard</option>
            <option value="parti" style={{ background: '#0D1223' }}>Parti</option>
            <option value="inactif" style={{ background: '#0D1223' }}>Inactif</option>
          </select>

          {/* Logement */}
          <select value={bienFilter} onChange={(e) => setBienFilter(e.target.value)} style={selectStyle}>
            <option value="" style={{ background: '#0D1223' }}>Tous les logements</option>
            <option value="__sans__" style={{ background: '#0D1223' }}>Sans logement</option>
            {biens.map((b) => (
              <option key={b.id} value={b.id} style={{ background: '#0D1223' }}>
                {b.nom}
              </option>
            ))}
          </select>

          {/* Vue + Reset */}
          <div className="flex items-center gap-2 shrink-0">
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setStatutFilter(''); setBienFilter('') }}
                className="px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                style={{ background: 'rgba(255,68,68,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,68,68,0.2)' }}>
                <X size={12} /> Effacer
              </button>
            )}

            <div className="hidden md:flex rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {([['table', LayoutList], ['grid', LayoutGrid]] as const).map(([mode, Icon]) => (
                <button key={mode}
                  onClick={() => setViewMode(mode)}
                  className="px-3 py-2.5 flex items-center transition-colors duration-200"
                  style={{
                    background: viewMode === mode ? 'rgba(0,102,255,0.2)' : 'rgba(255,255,255,0.03)',
                    color: viewMode === mode ? '#4D9FFF' : '#6B7280',
                  }}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Info résultats ─────────────────────────────────────────────── */}
        {!isLoading && hasFilters && (
          <p className="text-sm text-gray-500 -mt-2">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''} sur{' '}
            {locataires.length} locataire{locataires.length > 1 ? 's' : ''}
          </p>
        )}

        {/* ── Erreur ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl text-sm"
            style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: '#FF6B6B' }}>
            <AlertTriangle size={16} className="shrink-0" />
            Erreur de chargement : {error.message}
          </div>
        )}

        {/* ── Vue Tableau ──────────────────────────────────────────────────── */}
        <div className={viewMode === 'table' ? 'hidden md:block' : 'hidden'}>
          <LocataireTable
            locataires={filtered}
            onDelete={setDeleteTarget}
            loading={isLoading}
          />
        </div>

        {/* ── Vue Grille ────────────────────────────────────────────────────── */}
        <div className={viewMode === 'grid' ? 'block' : 'block md:hidden'}>
          {isLoading ? <GridSkeleton />
          : filtered.length === 0 ? <EmptyState />
          : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((loc, i) => (
                <div key={loc.id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                  <LocataireCard loc={loc} onDelete={setDeleteTarget} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
