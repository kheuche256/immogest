'use client'

import { useState, useMemo } from 'react'
import { Bell, RefreshCw, CheckCheck, ChevronDown, X, Trash2, AlertTriangle } from 'lucide-react'
import { useAlertes, Alerte } from '@/hooks/useAlertes'
import AlerteCard from '@/components/alertes/AlerteCard'

// ─── Toast ────────────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }

let _toastId = 0

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-2xl animate-fadeInUp"
          style={{
            background: t.type === 'success' ? 'rgba(0,196,140,0.95)'
              : t.type === 'error' ? 'rgba(239,68,68,0.95)'
              : 'rgba(59,130,246,0.95)',
            backdropFilter: 'blur(10px)',
            minWidth: '260px',
          }}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)}><X size={14} /></button>
        </div>
      ))}
    </div>
  )
}

// ─── Modal de confirmation ────────────────────────────────────────────────────
interface ConfirmModalProps {
  titre: string
  message: string
  onConfirm: () => void
  onClose: () => void
  isDestructive?: boolean
}

function ConfirmModal({ titre, message, onConfirm, onClose, isDestructive = true }: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 animate-fadeInUp"
        style={{
          background: 'rgba(17,24,39,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: isDestructive ? 'rgba(239,68,68,0.15)' : 'rgba(255,184,0,0.12)' }}
        >
          <AlertTriangle size={22} color={isDestructive ? '#ef4444' : '#FFB800'} />
        </div>
        <h3 className="text-lg font-bold text-white text-center mb-2">{titre}</h3>
        <p className="text-sm text-gray-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 transition-colors hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Annuler
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: isDestructive
                ? 'linear-gradient(135deg,#ef4444,#dc2626)'
                : 'linear-gradient(135deg,#FFB800,#f59e0b)',
              boxShadow: isDestructive
                ? '0 4px 15px rgba(239,68,68,0.3)'
                : '0 4px 15px rgba(255,184,0,0.3)',
            }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Config groupes ───────────────────────────────────────────────────────────
const PRIORITES = ['urgente', 'haute', 'normale', 'basse'] as const

const PRIORITE_META: Record<string, { label: string; color: string; emoji: string }> = {
  urgente: { label: 'Urgentes', color: '#ef4444', emoji: '🔴' },
  haute:   { label: 'Haute',    color: '#f97316', emoji: '🟠' },
  normale: { label: 'Normale',  color: '#0066FF', emoji: '🔵' },
  basse:   { label: 'Basse',    color: '#6b7280', emoji: '⚪' },
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-4 flex gap-4 animate-pulse"
      style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-4 rounded" style={{ background: 'rgba(255,255,255,0.07)', width: '60%' }} />
        <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.05)', width: '80%' }} />
        <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.04)', width: '40%' }} />
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AlertesPage() {
  const {
    alertes, isLoading, stats,
    marquerLue, marquerToutesLues, deleteAlerte, supprimerLues,
    genererToutesAlertes,
  } = useAlertes()

  const [tab, setTab]                     = useState<'toutes' | 'non_lues' | 'lues'>('toutes')
  const [filtreType, setFiltreType]       = useState('tous')
  const [filtrePriorite, setFiltrePriorite] = useState('toutes')
  const [isRefreshing, setIsRefreshing]   = useState(false)
  const [toasts, setToasts]               = useState<Toast[]>([])

  // Modals de confirmation
  const [confirmDelete, setConfirmDelete]         = useState<string | null>(null)   // id alerte
  const [confirmSupprimerLues, setConfirmSupprimerLues] = useState(false)
  const [confirmToutesLues, setConfirmToutesLues] = useState(false)

  // ─── Toast helpers
  function addToast(message: string, type: Toast['type'] = 'success') {
    const id = ++_toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }
  function removeToast(id: number) { setToasts((prev) => prev.filter((t) => t.id !== id)) }

  // ─── Actualiser
  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      const { retards, contrats } = await genererToutesAlertes()
      const total = retards + contrats
      if (total === 0) {
        addToast('Aucune nouvelle alerte détectée', 'info')
      } else {
        const parts: string[] = []
        if (retards > 0) parts.push(`${retards} retard${retards > 1 ? 's' : ''}`)
        if (contrats > 0) parts.push(`${contrats} contrat${contrats > 1 ? 's' : ''}`)
        addToast(`🔔 ${total} nouvelle${total > 1 ? 's' : ''} alerte${total > 1 ? 's' : ''} générée${total > 1 ? 's' : ''} (${parts.join(' + ')})`, 'success')
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de la génération', 'error')
    } finally {
      setIsRefreshing(false)
    }
  }

  // ─── Tout marquer lu (avec confirmation)
  async function handleMarquerToutesLues() {
    try {
      await marquerToutesLues()
      addToast(`✅ ${stats.nonLues} alerte${stats.nonLues > 1 ? 's' : ''} marquée${stats.nonLues > 1 ? 's' : ''} comme lues`, 'success')
    } catch {
      addToast('Erreur', 'error')
    }
  }

  // ─── Supprimer lues (avec confirmation)
  async function handleSupprimerLues() {
    const count = alertes.filter((a) => a.lue).length
    try {
      await supprimerLues()
      addToast(`🗑️ ${count} alerte${count > 1 ? 's' : ''} lue${count > 1 ? 's' : ''} supprimée${count > 1 ? 's' : ''}`, 'info')
    } catch {
      addToast('Erreur', 'error')
    }
  }

  // ─── Marquer une alerte lue (refresh instantané)
  async function handleMarquerLue(id: string) {
    try {
      await marquerLue(id)
    } catch {
      addToast('Erreur', 'error')
    }
  }

  // ─── Supprimer une alerte (avec confirmation)
  async function handleDelete(id: string) {
    try {
      await deleteAlerte(id)
      addToast('🗑️ Alerte supprimée', 'info')
    } catch {
      addToast('Erreur', 'error')
    }
  }

  // ─── Filtrage dynamique
  const alertesFiltrees = useMemo(() => {
    return alertes.filter((a) => {
      const matchTab =
        tab === 'toutes'   ? true :
        tab === 'non_lues' ? !a.lue :
        a.lue
      const matchType = filtreType === 'tous' || a.type === filtreType
      const matchPrio = filtrePriorite === 'toutes' || a.priorite === filtrePriorite
      return matchTab && matchType && matchPrio
    })
  }, [alertes, tab, filtreType, filtrePriorite])

  // ─── Groupement par priorité
  const groupes = useMemo(() => {
    const result: Record<string, Alerte[]> = {}
    for (const p of PRIORITES) {
      const items = alertesFiltrees.filter((a) => a.priorite === p)
      if (items.length > 0) result[p] = items
    }
    return result
  }, [alertesFiltrees])

  const nbLues = alertes.filter((a) => a.lue).length

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.15)' }}
            >
              <Bell size={22} color="#ef4444" />
            </div>
            {stats.nonLues > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-white animate-pulse"
                style={{ background: '#ef4444', fontSize: '10px' }}
              >
                {stats.nonLues > 9 ? '9+' : stats.nonLues}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Centre d'alertes</h1>
            <p className="text-sm text-gray-500">
              {stats.nonLues > 0
                ? `${stats.nonLues} alerte${stats.nonLues > 1 ? 's' : ''} non lue${stats.nonLues > 1 ? 's' : ''}`
                : '🎉 Tout est à jour !'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tout marquer lu */}
          {stats.nonLues > 0 && (
            <button
              onClick={() => setConfirmToutesLues(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'rgba(0,196,140,0.1)',
                border: '1px solid rgba(0,196,140,0.2)',
                color: '#00C48C',
              }}
            >
              <CheckCheck size={15} />
              Tout marquer lu
            </button>
          )}

          {/* Actualiser */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: isRefreshing ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
              boxShadow: isRefreshing ? 'none' : '0 4px 15px rgba(239,68,68,0.3)',
            }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Analyse...' : 'Actualiser alertes'}
          </button>
        </div>
      </div>

      {/* ── Mini stats ── */}
      <div className="flex flex-wrap gap-2">
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          🔴 {stats.urgentes} urgente{stats.urgentes > 1 ? 's' : ''}
        </span>
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.2)' }}
        >
          💸 {stats.retards} retard{stats.retards > 1 ? 's' : ''} paiement
        </span>
        <span
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(0,102,255,0.1)', color: '#60a5fa', border: '1px solid rgba(0,102,255,0.2)' }}
        >
          📋 {stats.contrats} contrat{stats.contrats > 1 ? 's' : ''} expirant
        </span>
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        {/* Tabs */}
        <div
          className="flex rounded-xl overflow-hidden shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {([
            { key: 'toutes',   label: 'Toutes',   count: alertes.length },
            { key: 'non_lues', label: 'Non lues', count: stats.nonLues },
            { key: 'lues',     label: 'Lues',     count: nbLues },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all"
              style={{
                background: tab === t.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: tab === t.key ? '#fff' : '#6b7280',
              }}
            >
              {t.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: tab === t.key ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                  color: tab === t.key ? '#fff' : '#6b7280',
                }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Type */}
        <div className="relative">
          <select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2 rounded-xl text-sm text-white outline-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="tous">Tous les types</option>
            <option value="retard_paiement">Retard paiement</option>
            <option value="contrat_expire">Contrat expire</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        {/* Priorité */}
        <div className="relative">
          <select
            value={filtrePriorite}
            onChange={(e) => setFiltrePriorite(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2 rounded-xl text-sm text-white outline-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="toutes">Toutes priorités</option>
            <option value="urgente">Urgente</option>
            <option value="haute">Haute</option>
            <option value="normale">Normale</option>
            <option value="basse">Basse</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* ── Contenu ── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : alertesFiltrees.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: 'rgba(0,196,140,0.1)' }}
          >
            🎉
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              {tab === 'non_lues' ? 'Aucune alerte non lue !' : 'Aucune alerte 🎉'}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              {tab === 'non_lues'
                ? 'Bravo ! Vous avez traité toutes vos alertes. Votre portefeuille est en parfait état.'
                : 'Tout est sous contrôle. Cliquez sur "Actualiser" pour vérifier s\'il y a de nouvelles anomalies.'}
            </p>
          </div>
          {tab !== 'non_lues' && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white mt-2"
              style={{
                background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
              }}
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
              Vérifier maintenant
            </button>
          )}
        </div>
      ) : (
        /* Groupes par priorité */
        <div className="space-y-6">
          {PRIORITES.map((priorite) => {
            const items = groupes[priorite]
            if (!items) return null
            const meta = PRIORITE_META[priorite]
            return (
              <section key={priorite}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">{meta.emoji}</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                    {meta.label}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${meta.color}15`, color: meta.color }}
                  >
                    {items.length}
                  </span>
                  <div className="flex-1 h-px" style={{ background: `${meta.color}20` }} />
                </div>

                {/* Grid 1 col mobile / 2 col desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {items.map((alerte) => (
                    <AlerteCard
                      key={alerte.id}
                      alerte={alerte}
                      onMarquerLue={handleMarquerLue}
                      onDelete={(id) => setConfirmDelete(id)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* ── Bouton bas de page : Supprimer alertes lues ── */}
      {nbLues > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setConfirmSupprimerLues(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.15)',
              color: '#f87171',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)' }}
          >
            <Trash2 size={15} />
            Supprimer les alertes lues ({nbLues})
          </button>
        </div>
      )}

      {/* ── Modals de confirmation ── */}

      {/* Supprimer une alerte */}
      {confirmDelete && (
        <ConfirmModal
          titre="Supprimer cette alerte ?"
          message="Cette action est irréversible."
          onConfirm={() => handleDelete(confirmDelete)}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {/* Supprimer toutes les alertes lues */}
      {confirmSupprimerLues && (
        <ConfirmModal
          titre={`Supprimer ${nbLues} alerte${nbLues > 1 ? 's' : ''} lue${nbLues > 1 ? 's' : ''} ?`}
          message="Toutes les alertes marquées comme lues seront définitivement supprimées."
          onConfirm={handleSupprimerLues}
          onClose={() => setConfirmSupprimerLues(false)}
        />
      )}

      {/* Marquer toutes lues */}
      {confirmToutesLues && (
        <ConfirmModal
          titre={`Marquer ${stats.nonLues} alerte${stats.nonLues > 1 ? 's' : ''} comme lues ?`}
          message="Toutes les alertes non lues seront marquées comme traitées."
          onConfirm={handleMarquerToutesLues}
          onClose={() => setConfirmToutesLues(false)}
          isDestructive={false}
        />
      )}

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
