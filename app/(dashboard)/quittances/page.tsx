'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Download, Search, ChevronDown,
  Loader2, X, Wallet, CheckCircle,
} from 'lucide-react'
import { usePaiements } from '@/hooks/usePaiements'
import { useBiens } from '@/hooks/useBiens'
import QuittanceCard from '@/components/quittances/QuittanceCard'

// ─── Utils ────────────────────────────────────────────────────────────────────

function getMoisActuel() {
  return new Date().toISOString().slice(0, 7)
}

function formatMontant(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

function formatMoisLabel(mois: string) {
  const [year, month] = mois.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 animate-pulse"
      style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded" style={{ background: 'rgba(255,255,255,0.07)', width: '70%' }} />
          <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.04)', width: '40%' }} />
        </div>
      </div>
      <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.05)', width: '60%' }} />
      <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.04)', width: '80%' }} />
      <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-14 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-14 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
      <div className="h-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }} />
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function QuittancesPage() {
  const router = useRouter()
  const { paiements, isLoading } = usePaiements()
  const { biens } = useBiens()

  const [moisSelectionne, setMoisSelectionne] = useState(getMoisActuel())
  const [search, setSearch]         = useState('')
  const [filtreBien, setFiltreBien] = useState('tous')
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  // ─── Toast helpers
  function addToast(message: string, type: Toast['type'] = 'success') {
    const id = ++_toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }
  function removeToast(id: number) { setToasts((prev) => prev.filter((t) => t.id !== id)) }

  // ─── Paiements payés du mois
  const paiementsPayes = useMemo(() =>
    paiements.filter((p) => p.statut === 'payé' && p.mois === moisSelectionne),
    [paiements, moisSelectionne]
  )

  // ─── Filtrage dynamique
  const paiementsFiltres = useMemo(() => {
    return paiementsPayes.filter((p) => {
      const nom = p.locataire
        ? `${p.locataire.prenom ?? ''} ${p.locataire.nom}`.toLowerCase()
        : ''
      const matchSearch = !search || nom.includes(search.toLowerCase()) ||
        (p.bien?.nom ?? '').toLowerCase().includes(search.toLowerCase())
      const matchBien = filtreBien === 'tous' || p.bien_id === filtreBien
      return matchSearch && matchBien
    })
  }, [paiementsPayes, search, filtreBien])

  // ─── Stats du mois
  const totalEncaisse = paiementsFiltres.reduce((s, p) => s + p.montant, 0)

  // ─── Télécharger toutes les quittances du mois
  async function telechargerToutes() {
    if (paiementsFiltres.length === 0) return
    setIsDownloadingAll(true)
    let success = 0
    let errors = 0

    for (const p of paiementsFiltres) {
      try {
        const response = await fetch(`/api/quittances/${p.id}`)
        if (!response.ok) throw new Error()

        const blob = await response.blob()
        const moisStr = p.mois.replace('-', '')
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Quittance_QUI-${moisStr}-${p.id.slice(0, 4).toUpperCase()}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        success++
        // Petite pause entre téléchargements
        await new Promise((r) => setTimeout(r, 300))
      } catch {
        errors++
      }
    }

    setIsDownloadingAll(false)
    if (errors === 0) {
      addToast(`✅ ${success} quittance${success > 1 ? 's' : ''} téléchargée${success > 1 ? 's' : ''} !`, 'success')
    } else {
      addToast(`${success} réussie${success > 1 ? 's' : ''}, ${errors} erreur${errors > 1 ? 's' : ''}`, 'error')
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,102,255,0.15)' }}>
            <FileText size={22} color="#0066FF" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Quittances</h1>
            <p className="text-sm text-gray-500 capitalize">
              {formatMoisLabel(moisSelectionne)} — {paiementsPayes.length} quittance{paiementsPayes.length !== 1 ? 's' : ''} disponible{paiementsPayes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur mois */}
          <input
            type="month"
            value={moisSelectionne}
            onChange={(e) => setMoisSelectionne(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm text-white outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              colorScheme: 'dark',
            }}
          />

          {/* Télécharger toutes */}
          {paiementsFiltres.length > 1 && (
            <button
              onClick={telechargerToutes}
              disabled={isDownloadingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background: isDownloadingAll
                  ? 'rgba(0,102,255,0.4)'
                  : 'linear-gradient(135deg,#0066FF,#0052cc)',
                boxShadow: isDownloadingAll ? 'none' : '0 4px 15px rgba(0,102,255,0.3)',
              }}
            >
              {isDownloadingAll
                ? <Loader2 size={15} className="animate-spin" />
                : <Download size={15} />
              }
              {isDownloadingAll ? 'Génération...' : `Tout télécharger (${paiementsFiltres.length})`}
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(0,102,255,0.15)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(0,102,255,0.15)' }}>
            <FileText size={18} color="#0066FF" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Quittances</p>
            <p className="text-lg font-bold text-white">{paiementsFiltres.length}</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(0,196,140,0.15)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(0,196,140,0.12)' }}>
            <Wallet size={18} color="#00C48C" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Encaissé</p>
            <p className="text-base font-bold text-emerald-400">{formatMontant(totalEncaisse)}</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 flex items-center gap-3 col-span-2 sm:col-span-1"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,184,0,0.12)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,184,0,0.1)' }}>
            <CheckCircle size={18} color="#FFB800" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Taux</p>
            <p className="text-lg font-bold text-yellow-400">
              {paiementsPayes.length > 0
                ? `${Math.round((paiementsFiltres.length / paiementsPayes.length) * 100)}%`
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher locataire ou bien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>

        {/* Filtre bien */}
        <div className="relative">
          <select
            value={filtreBien}
            onChange={(e) => setFiltreBien(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm text-white outline-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="tous">Tous les biens</option>
            {biens.map((b) => (
              <option key={b.id} value={b.id}>{b.nom}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* ── Contenu ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : paiementsFiltres.length === 0 ? (
        /* ── Empty state ── */
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: 'rgba(0,102,255,0.1)' }}>
            📄
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2 capitalize">
              Aucune quittance disponible pour {formatMoisLabel(moisSelectionne)}
            </h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Les quittances sont générées automatiquement lorsqu'un paiement est marqué comme payé.
            </p>
          </div>
          <button
            onClick={() => router.push('/paiements')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white mt-2"
            style={{
              background: 'linear-gradient(135deg,#FFB800,#f59e0b)',
              boxShadow: '0 4px 15px rgba(255,184,0,0.3)',
            }}
          >
            <Wallet size={15} />
            Gérer les paiements
          </button>
        </div>
      ) : (
        /* ── Grille de cards ── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paiementsFiltres.map((p) => (
            <QuittanceCard
              key={p.id}
              paiement={p}
              onToast={addToast}
            />
          ))}
        </div>
      )}

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
