'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface Payment {
  id: string
  locataire_nom: string
  locataire_prenom: string
  bien_nom: string
  montant: number
  statut: 'paye' | 'en_attente' | 'en_retard' | 'partiel'
  date: string
}

interface RecentPaymentsProps {
  payments: Payment[]
  loading?: boolean
}

const DEMO_PAYMENTS: Payment[] = [
  { id: '1', locataire_nom: 'Diallo', locataire_prenom: 'Amadou', bien_nom: 'Villa Almadies B4', montant: 350000, statut: 'paye', date: '2026-03-28' },
  { id: '2', locataire_nom: 'Ndiaye', locataire_prenom: 'Fatou', bien_nom: 'Appt Plateau T3', montant: 180000, statut: 'paye', date: '2026-03-25' },
  { id: '3', locataire_nom: 'Sow', locataire_prenom: 'Ibrahima', bien_nom: 'Studio Dakar Sacré-Cœur', montant: 120000, statut: 'en_attente', date: '2026-03-20' },
  { id: '4', locataire_nom: 'Fall', locataire_prenom: 'Mariama', bien_nom: 'Appt Mermoz T2', montant: 200000, statut: 'en_retard', date: '2026-03-01' },
  { id: '5', locataire_nom: 'Mbaye', locataire_prenom: 'Ousmane', bien_nom: 'Commerce Sandaga', montant: 450000, statut: 'paye', date: '2026-03-15' },
]

const statutConfig = {
  paye: { label: 'Payé', bg: 'rgba(0,196,140,0.12)', color: '#00C48C', border: 'rgba(0,196,140,0.25)' },
  en_attente: { label: 'En attente', bg: 'rgba(255,184,0,0.12)', color: '#FFB800', border: 'rgba(255,184,0,0.25)' },
  en_retard: { label: 'Retard', bg: 'rgba(255,68,68,0.12)', color: '#FF4444', border: 'rgba(255,68,68,0.25)' },
  partiel: { label: 'Partiel', bg: 'rgba(147,112,219,0.12)', color: '#9370DB', border: 'rgba(147,112,219,0.25)' },
}

const AVATAR_COLORS = [
  'rgba(0,102,255,0.8)',
  'rgba(0,212,170,0.8)',
  'rgba(255,184,0,0.8)',
  'rgba(255,68,68,0.8)',
  'rgba(147,112,219,0.8)',
]

function initials(nom: string, prenom: string) {
  return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function formatMontant(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-white/5 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="w-28 h-3.5 rounded bg-white/5" />
        <div className="w-36 h-3 rounded bg-white/5" />
      </div>
      <div className="w-20 h-6 rounded-full bg-white/5" />
      <div className="w-24 h-4 rounded bg-white/5" />
    </div>
  )
}

export default function RecentPayments({ payments, loading = false }: RecentPaymentsProps) {
  const list = payments.length > 0 ? payments : DEMO_PAYMENTS
  const isDemo = payments.length === 0

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(17,24,39,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white">Derniers Paiements</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isDemo ? 'Données de démonstration' : `${list.length} transactions récentes`}
          </p>
        </div>
        <Link
          href="/paiements"
          className="flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: '#0066FF' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00D4AA')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#0066FF')}
        >
          Voir tout <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* List */}
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : list.map((p, i) => {
              const cfg = statutConfig[p.statut]
              const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 py-3 group"
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: avatarColor }}
                  >
                    {initials(p.locataire_nom, p.locataire_prenom)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {p.locataire_prenom} {p.locataire_nom}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{p.bien_nom}</p>
                  </div>

                  {/* Statut */}
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                  >
                    {cfg.label}
                  </span>

                  {/* Montant + date */}
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-sm font-bold text-white">{formatMontant(p.montant)}</p>
                    <p className="text-xs text-gray-500">{formatDate(p.date)}</p>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}
