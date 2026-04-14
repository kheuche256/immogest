'use client'

import { useState } from 'react'
import { X, CheckCircle, Wallet } from 'lucide-react'
import { Paiement } from '@/hooks/usePaiements'

interface MarquerPayeModalProps {
  paiement: Paiement
  onConfirm: (mode: string, reference?: string) => Promise<void>
  onClose: () => void
}

const MODES = [
  { value: 'especes',  label: '💵 Espèces' },
  { value: 'wave',     label: '🌊 Wave' },
  { value: 'om',       label: '🟠 Orange Money' },
  { value: 'virement', label: '🏦 Virement bancaire' },
]

function formatMontant(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

export default function MarquerPayeModal({ paiement, onConfirm, onClose }: MarquerPayeModalProps) {
  const [mode, setMode] = useState('especes')
  const [reference, setReference] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nomLocataire = paiement.locataire
    ? `${paiement.locataire.prenom ?? ''} ${paiement.locataire.nom}`.trim()
    : 'Locataire'
  const nomBien = paiement.bien?.nom ?? 'Bien'
  const today = new Date().toISOString().split('T')[0]

  async function handleConfirm() {
    setIsSubmitting(true)
    try {
      await onConfirm(mode, reference || undefined)
      onClose()
    } catch {
      // L'erreur est gérée dans le parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-fadeInUp"
        style={{
          background: 'rgba(17,24,39,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,196,140,0.15)' }}>
              <CheckCircle size={20} color="#00C48C" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Confirmer le paiement</h2>
              <p className="text-xs text-gray-500">Marquer comme encaissé</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Infos paiement */}
        <div className="rounded-xl p-4 mb-5 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Locataire</span>
            <span className="text-sm font-medium text-white">{nomLocataire}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Logement</span>
            <span className="text-sm text-gray-300">{nomBien}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Mois</span>
            <span className="text-sm text-gray-300">{paiement.mois}</span>
          </div>
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Montant</span>
            <span className="text-base font-bold text-emerald-400">{formatMontant(paiement.montant)}</span>
          </div>
        </div>

        {/* Mode de paiement */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Mode de paiement *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className="p-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                style={{
                  background: mode === m.value ? 'rgba(0,196,140,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${mode === m.value ? 'rgba(0,196,140,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  color: mode === m.value ? '#00C48C' : '#9ca3af',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Référence */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Référence <span className="text-gray-600 normal-case">(optionnel)</span>
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="N° transaction, reçu..."
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(0,196,140,0.4)' }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Date de paiement
          </label>
          <input
            type="date"
            defaultValue={today}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
            style={{
              background: isSubmitting ? 'rgba(0,196,140,0.5)' : 'linear-gradient(135deg,#00C48C,#00a876)',
              boxShadow: isSubmitting ? 'none' : '0 4px 15px rgba(0,196,140,0.3)',
            }}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            {isSubmitting ? 'Confirmation...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}
