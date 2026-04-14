'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wallet, Plus, RefreshCw, Search, AlertTriangle,
  TrendingUp, Clock, CheckCircle, ChevronDown, Trash2, X
} from 'lucide-react'
import { usePaiements, Paiement } from '@/hooks/usePaiements'
import { useBiens } from '@/hooks/useBiens'
import PaiementTable from '@/components/paiements/PaiementTable'
import MarquerPayeModal from '@/components/paiements/MarquerPayeModal'

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatMontant(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

function getMoisActuel() {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }

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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, montant, sous, color, icon: Icon, pulse }: {
  label: string; montant: number; sous?: string; color: string; icon: React.ElementType; pulse?: boolean
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{
        background: 'rgba(17,24,39,0.8)',
        border: `1px solid ${color}20`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.2)`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pulse ? 'animate-pulse' : ''}`}
          style={{ background: `${color}18` }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <p className="text-xl font-bold text-white">{formatMontant(montant)}</p>
      {sous && <p className="text-xs text-gray-500">{sous}</p>}
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function PaiementsPage() {
  const router = useRouter()
  const { paiements, isLoading, stats, marquerPaye, deletePaiement, genererEcheancesMois, detecterRetards } = usePaiements()
  const { biens } = useBiens()

  const [moisSelectionne, setMoisSelectionne] = useState(getMoisActuel())
  const [search, setSearch] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('tous')
  const [filtreBien, setFiltreBien] = useState('tous')
  const [paiementAConfirmer, setPaiementAConfirmer] = useState<Paiement | null>(null)
  const [paiementASupprimer, setPaiementASupprimer] = useState<Paiement | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  // ─── Toast helpers
  let toastId = 0
  function addToast(message: string, type: Toast['type'] = 'success') {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }
  function removeToast(id: number) { setToasts((prev) => prev.filter((t) => t.id !== id)) }

  // ─── Stats du mois sélectionné
  const statsMois = useMemo(() => {
    const pm = paiements.filter((p) => p.mois === moisSelectionne)
    const total = pm.reduce((s, p) => s + p.montant, 0)
    const payes = pm.filter((p) => p.statut === 'payé').reduce((s, p) => s + p.montant, 0)
    const enAttente = pm.filter((p) => p.statut === 'en_attente').reduce((s, p) => s + p.montant, 0)
    const retards = pm.filter((p) => p.statut === 'retard').reduce((s, p) => s + p.montant, 0)
    const nbAttente = pm.filter((p) => p.statut === 'en_attente').length
    const nbRetard = pm.filter((p) => p.statut === 'retard').length
    const tauxCollecte = total > 0 ? Math.round((payes / total) * 100) : 0
    return { total, payes, enAttente, retards, nbAttente, nbRetard, tauxCollecte }
  }, [paiements, moisSelectionne])

  // ─── Filtrage
  const paiementsFiltres = useMemo(() => {
    return paiements.filter((p) => {
      const nomLocataire = p.locataire
        ? `${p.locataire.prenom ?? ''} ${p.locataire.nom}`.toLowerCase()
        : ''
      const matchSearch = !search || nomLocataire.includes(search.toLowerCase())
      const matchStatut = filtreStatut === 'tous' || p.statut === filtreStatut
      const matchBien = filtreBien === 'tous' || p.bien_id === filtreBien
      const matchMois = p.mois === moisSelectionne
      return matchSearch && matchStatut && matchBien && matchMois
    })
  }, [paiements, search, filtreStatut, filtreBien, moisSelectionne])

  // ─── Générer échéances
  async function handleGenererEcheances() {
    setIsGenerating(true)
    try {
      const count = await genererEcheancesMois(moisSelectionne)
      if (count === 0) {
        addToast('Aucune nouvelle échéance à générer', 'info')
      } else {
        addToast(`✅ ${count} échéance${count > 1 ? 's' : ''} générée${count > 1 ? 's' : ''}`, 'success')
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de la génération', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  // ─── Marquer payé
  async function handleMarquerPaye(mode: string, reference?: string) {
    if (!paiementAConfirmer) return
    try {
      await marquerPaye(paiementAConfirmer.id, mode, reference)
      addToast('✅ Paiement encaissé avec succès', 'success')
    } catch (err: any) {
      addToast(err.message || 'Erreur lors de la confirmation', 'error')
      throw err
    }
  }

  // ─── Supprimer
  async function handleDelete() {
    if (!paiementASupprimer) return
    try {
      await deletePaiement(paiementASupprimer.id)
      addToast('🗑️ Paiement supprimé', 'info')
      setPaiementASupprimer(null)
    } catch (err: any) {
      addToast(err.message || 'Erreur', 'error')
    }
  }

  // ─── Render
  return (
    <div className="p-6 space-y-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,184,0,0.15)' }}>
            <Wallet size={22} color="#FFB800" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Paiements</h1>
            <p className="text-sm text-gray-500">Suivi des loyers et encaissements</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur mois */}
          <input
            type="month"
            value={moisSelectionne}
            onChange={(e) => setMoisSelectionne(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm text-white outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              colorScheme: 'dark',
            }}
          />

          {/* Générer échéances */}
          <button
            onClick={handleGenererEcheances}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(147,112,219,0.15)',
              border: '1px solid rgba(147,112,219,0.3)',
              color: '#9370DB',
            }}
          >
            <RefreshCw size={15} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Génération...' : 'Générer échéances'}
          </button>

          {/* Nouveau paiement */}
          <button
            onClick={() => router.push('/paiements/nouveau')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg,#FFB800,#f59e0b)',
              boxShadow: '0 4px 15px rgba(255,184,0,0.3)',
            }}
          >
            <Plus size={16} />
            Nouveau paiement
          </button>
        </div>
      </div>

      {/* ── Stats du mois ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total attendu"
          montant={statsMois.total}
          sous={`Mois de ${new Date(moisSelectionne + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`}
          color="#0066FF"
          icon={Wallet}
        />
        <StatCard
          label="Encaissé"
          montant={statsMois.payes}
          sous={`${statsMois.tauxCollecte}% du total`}
          color="#00C48C"
          icon={CheckCircle}
        />
        <StatCard
          label="En attente"
          montant={statsMois.enAttente}
          sous={`${statsMois.nbAttente} paiement${statsMois.nbAttente > 1 ? 's' : ''}`}
          color="#FFB800"
          icon={Clock}
        />
        <StatCard
          label="En retard"
          montant={statsMois.retards}
          sous={`${statsMois.nbRetard} paiement${statsMois.nbRetard > 1 ? 's' : ''}`}
          color="#ef4444"
          icon={AlertTriangle}
          pulse={statsMois.nbRetard > 0}
        />
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un locataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>

        {/* Filtre statut */}
        <div className="relative">
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm text-white outline-none transition-all cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="tous">Tous les statuts</option>
            <option value="payé">Payé</option>
            <option value="en_attente">En attente</option>
            <option value="retard">En retard</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        {/* Filtre bien */}
        <div className="relative">
          <select
            value={filtreBien}
            onChange={(e) => setFiltreBien(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm text-white outline-none transition-all cursor-pointer"
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

      {/* ── Table / Empty state ── */}
      {!isLoading && paiementsFiltres.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'rgba(255,184,0,0.1)' }}>
            💰
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Aucun paiement pour ce mois</h3>
            <p className="text-sm text-gray-500 mb-4">
              Générez les échéances automatiquement ou ajoutez un paiement manuellement.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenererEcheances}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(147,112,219,0.15)', border: '1px solid rgba(147,112,219,0.3)', color: '#9370DB' }}
            >
              <RefreshCw size={15} className={isGenerating ? 'animate-spin' : ''} />
              Générer les échéances
            </button>
            <button
              onClick={() => router.push('/paiements/nouveau')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#FFB800,#f59e0b)', boxShadow: '0 4px 15px rgba(255,184,0,0.3)' }}
            >
              <Plus size={15} /> Ajouter manuellement
            </button>
          </div>
        </div>
      ) : (
        <PaiementTable
          paiements={paiementsFiltres}
          isLoading={isLoading}
          onMarquerPaye={(p) => setPaiementAConfirmer(p)}
          onDelete={(p) => setPaiementASupprimer(p)}
        />
      )}

      {/* ── Modal Marquer payé ── */}
      {paiementAConfirmer && (
        <MarquerPayeModal
          paiement={paiementAConfirmer}
          onConfirm={handleMarquerPaye}
          onClose={() => setPaiementAConfirmer(null)}
        />
      )}

      {/* ── Modal Suppression ── */}
      {paiementASupprimer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setPaiementASupprimer(null) }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 animate-fadeInUp"
            style={{ background: 'rgba(17,24,39,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.15)' }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Supprimer ce paiement ?</h3>
            <p className="text-sm text-gray-400 text-center mb-6">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPaiementASupprimer(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
