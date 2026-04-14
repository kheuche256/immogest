'use client'

import { useState } from 'react'
import { FileText, Download, Loader2, Building2, Calendar, CreditCard, User } from 'lucide-react'

interface QuittanceCardProps {
  paiement: {
    id: string
    mois: string
    montant: number
    date_paiement: string | null
    mode_paiement: string | null
    reference?: string | null
    locataire?: { nom: string; prenom?: string | null; telephone?: string | null } | null
    bien?: { nom: string; adresse?: string | null } | null
  }
  onToast: (message: string, type: 'success' | 'error') => void
}

// ─── Utils ───────────────────────────────────────────────────────────────────

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

function getModeLabel(mode: string | null) {
  if (!mode) return '—'
  const map: Record<string, string> = {
    especes: '💵 Espèces',
    wave: '🌊 Wave',
    om: '🟠 Orange Money',
    virement: '🏦 Virement',
  }
  return map[mode] ?? mode
}

function getAvatarColor(nom: string) {
  const colors = ['#0066FF', '#00C48C', '#FFB800', '#FF6B6B', '#9370DB', '#FF8C42', '#20C9C9']
  return colors[(nom.charCodeAt(0) || 0) % colors.length]
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function QuittanceCard({ paiement, onToast }: QuittanceCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const nomLocataire = paiement.locataire
    ? `${paiement.locataire.prenom ?? ''} ${paiement.locataire.nom}`.trim()
    : 'Locataire'
  const initiales = nomLocataire.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
  const avatarColor = getAvatarColor(paiement.locataire?.nom ?? 'L')
  const moisFormate = formatMois(paiement.mois)
  const numero = `QUI-${paiement.mois.replace('-', '')}-${paiement.id.slice(0, 4).toUpperCase()}`

  async function telechargerQuittance() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/quittances/${paiement.id}`)
      if (!response.ok) throw new Error('Erreur génération')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Quittance_${numero}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      onToast('✅ Quittance téléchargée !', 'success')
    } catch {
      onToast('Erreur lors du téléchargement', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 group"
      style={{
        background: 'rgba(17,24,39,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.border = '1px solid rgba(0,196,140,0.25)'
        el.style.boxShadow = '0 8px 32px rgba(0,196,140,0.08)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.border = '1px solid rgba(255,255,255,0.07)'
        el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'
      }}
    >
      {/* ── Top row : icône + titre + numéro ── */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(0,102,255,0.15)' }}
        >
          <FileText size={20} color="#0066FF" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate capitalize">
            Quittance — {moisFormate}
          </h3>
          <p className="text-xs text-gray-500 font-mono">{numero}</p>
        </div>
      </div>

      {/* ── Locataire ── */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: `linear-gradient(135deg,${avatarColor},${avatarColor}bb)` }}
        >
          {initiales}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{nomLocataire}</p>
          {paiement.locataire?.telephone && (
            <p className="text-xs text-gray-500">{paiement.locataire.telephone}</p>
          )}
        </div>
      </div>

      {/* ── Bien ── */}
      <div className="flex items-start gap-2.5">
        <Building2 size={14} className="text-gray-500 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-300 truncate">
            {paiement.bien?.nom ?? '—'}
          </p>
          {paiement.bien?.adresse && (
            <p className="text-xs text-gray-600 truncate">{paiement.bien.adresse}</p>
          )}
        </div>
      </div>

      {/* ── Séparateur ── */}
      <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Infos paiement ── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Montant */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(0,196,140,0.08)', border: '1px solid rgba(0,196,140,0.12)' }}>
          <p className="text-xs text-gray-500 mb-0.5">Montant</p>
          <p className="text-sm font-bold text-emerald-400">{formatMontant(paiement.montant)}</p>
        </div>

        {/* Date */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
            <Calendar size={10} /> Date
          </p>
          <p className="text-sm font-medium text-gray-200">{formatDate(paiement.date_paiement)}</p>
        </div>
      </div>

      {/* Mode paiement */}
      <div className="flex items-center gap-2">
        <CreditCard size={13} className="text-gray-500 shrink-0" />
        <span className="text-xs text-gray-400">{getModeLabel(paiement.mode_paiement)}</span>
        {paiement.reference && (
          <>
            <span className="text-gray-700">·</span>
            <span className="text-xs text-gray-600 font-mono truncate">{paiement.reference}</span>
          </>
        )}
      </div>

      {/* ── Bouton télécharger ── */}
      <button
        onClick={telechargerQuittance}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
        style={{
          background: isLoading
            ? 'rgba(0,196,140,0.4)'
            : 'linear-gradient(135deg,#00C48C,#00a876)',
          boxShadow: isLoading ? 'none' : '0 4px 15px rgba(0,196,140,0.25)',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(0,196,140,0.4)'
        }}
        onMouseLeave={(e) => {
          if (!isLoading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(0,196,140,0.25)'
        }}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {isLoading ? 'Génération en cours...' : 'Télécharger PDF'}
      </button>
    </div>
  )
}
