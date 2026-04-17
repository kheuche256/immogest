'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useReservations } from '@/hooks/useReservations'
import type { StatutReservation, Reservation } from '@/types'
import {
  Calendar,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  FlagTriangleRight,
  Phone,
  MapPin,
  ChevronRight,
  TrendingUp,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Statut config ──────────────────────────────────────────────────────────────
const STATUT_CONFIG: Record<StatutReservation, {
  label: string
  color: string
  bg: string
  icon: React.ElementType
  border: string
}> = {
  en_attente: { label: 'En attente',  color: '#DAA520', bg: '#FDF8E8', icon: Clock,             border: '#DAA520' },
  confirmee:  { label: 'Confirmée',   color: '#556B2F', bg: '#F0F5E8', icon: CheckCircle,        border: '#556B2F' },
  en_cours:   { label: 'En cours',    color: '#8B4513', bg: '#FFF5EB', icon: PlayCircle,         border: '#8B4513' },
  terminee:   { label: 'Terminée',    color: '#6B7280', bg: '#F3F4F6', icon: FlagTriangleRight,  border: '#9CA3AF' },
  annulee:    { label: 'Annulée',     color: '#DC2626', bg: '#FEF2F2', icon: XCircle,            border: '#DC2626' },
}

const FILTRES: { value: 'tous' | StatutReservation; label: string }[] = [
  { value: 'tous',        label: 'Toutes' },
  { value: 'en_attente',  label: 'En attente' },
  { value: 'confirmee',   label: 'Confirmées' },
  { value: 'en_cours',    label: 'En cours' },
  { value: 'terminee',    label: 'Terminées' },
  { value: 'annulee',     label: 'Annulées' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatMontant(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return `${n}`
}

// ── Composant carte réservation ────────────────────────────────────────────────
function ReservationCard({
  reservation,
  onStatutChange,
}: {
  reservation: Reservation
  onStatutChange: (id: string, statut: StatutReservation) => void
}) {
  const cfg = STATUT_CONFIG[reservation.statut]
  const Icon = cfg.icon

  const nextStatuts: Record<StatutReservation, StatutReservation | null> = {
    en_attente: 'confirmee',
    confirmee:  'en_cours',
    en_cours:   'terminee',
    terminee:   null,
    annulee:    null,
  }
  const nextStatut = nextStatuts[reservation.statut]

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-md"
      style={{ borderColor: '#F0E6D8' }}
    >
      {/* Bande colorée en haut */}
      <div className="h-1" style={{ backgroundColor: cfg.border }} />

      <div className="p-4 lg:p-5">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm lg:text-base truncate" style={{ color: '#5D3A1A' }}>
              {reservation.client_nom}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 flex-shrink-0" style={{ color: '#8B7355' }} />
              <span className="text-xs" style={{ color: '#8B7355' }}>
                {reservation.client_telephone}
              </span>
            </div>
          </div>
          <span
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
          >
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>

        {/* Bien */}
        {reservation.bien && (
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#8B4513' }} />
            <span className="text-sm font-medium truncate" style={{ color: '#5D3A1A' }}>
              {reservation.bien.nom}
            </span>
            {reservation.bien.ville && (
              <span className="text-xs" style={{ color: '#8B7355' }}>
                · {reservation.bien.ville}
              </span>
            )}
          </div>
        )}

        {/* Dates */}
        <div
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl mb-3"
          style={{ backgroundColor: '#FAF5F0' }}
        >
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#8B4513' }} />
          <span style={{ color: '#5D3A1A' }}>{formatDate(reservation.date_debut)}</span>
          <ChevronRight className="w-3 h-3" style={{ color: '#8B7355' }} />
          <span style={{ color: '#5D3A1A' }}>{formatDate(reservation.date_fin)}</span>
          <span className="ml-auto font-semibold" style={{ color: '#8B4513' }}>
            {reservation.nb_nuits} nuit{reservation.nb_nuits > 1 ? 's' : ''}
          </span>
        </div>

        {/* Montants */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs" style={{ color: '#8B7355' }}>Montant total</p>
            <p className="font-bold text-base" style={{ color: '#5D3A1A' }}>
              {reservation.montant_total.toLocaleString()} F
            </p>
          </div>
          {reservation.acompte > 0 && (
            <div className="text-right">
              <p className="text-xs" style={{ color: '#8B7355' }}>Acompte versé</p>
              <p className="font-semibold text-sm" style={{ color: '#556B2F' }}>
                {reservation.acompte.toLocaleString()} F
              </p>
            </div>
          )}
          {reservation.montant_restant > 0 && (
            <div className="text-right">
              <p className="text-xs" style={{ color: '#8B7355' }}>Reste à payer</p>
              <p className="font-semibold text-sm" style={{ color: '#DC2626' }}>
                {reservation.montant_restant.toLocaleString()} F
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {nextStatut && (
            <button
              onClick={() => onStatutChange(reservation.id, nextStatut)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: STATUT_CONFIG[nextStatut].border }}
            >
              → {STATUT_CONFIG[nextStatut].label}
            </button>
          )}
          {reservation.statut !== 'annulee' && reservation.statut !== 'terminee' && (
            <button
              onClick={() => onStatutChange(reservation.id, 'annulee')}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-all hover:bg-red-50"
              style={{ color: '#DC2626', border: '1px solid #FECACA' }}
            >
              Annuler
            </button>
          )}
          <Link
            href={`/reservations/${reservation.id}`}
            className="p-2 rounded-xl transition-all hover:bg-amber-50 flex-shrink-0"
            style={{ backgroundColor: '#FAF5F0' }}
            title="Voir le détail"
          >
            <ExternalLink className="w-3.5 h-3.5" style={{ color: '#8B4513' }} />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function ReservationsPage() {
  const { reservations, isLoading, stats, mettreAJourStatut } = useReservations()
  const [recherche, setRecherche]   = useState('')
  const [filtre, setFiltre]         = useState<'tous' | StatutReservation>('tous')

  const handleStatutChange = async (id: string, statut: StatutReservation) => {
    try {
      await mettreAJourStatut(id, statut)
      toast.success(`Réservation ${STATUT_CONFIG[statut].label.toLowerCase()}`)
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  // Filtre + recherche
  const reservationsFiltrees = reservations.filter(r => {
    const matchStatut = filtre === 'tous' || r.statut === filtre
    const q = recherche.toLowerCase()
    const matchRecherche = !q || [
      r.client_nom,
      r.client_telephone,
      r.bien?.nom,
      r.bien?.ville,
      r.client_email,
    ].some(v => v?.toLowerCase().includes(q))
    return matchStatut && matchRecherche
  })

  const statsCards = [
    {
      label:   'Total',
      value:   stats.total,
      color:   '#8B4513',
      bg:      '#FFF5EB',
    },
    {
      label:   'En cours',
      value:   stats.en_cours + stats.confirmees,
      color:   '#556B2F',
      bg:      '#F0F5E8',
    },
    {
      label:   'En attente',
      value:   stats.en_attente,
      color:   '#DAA520',
      bg:      '#FDF8E8',
    },
    {
      label:   'Revenus du mois',
      value:   `${formatMontant(stats.revenusMois)} F`,
      color:   '#5D3A1A',
      bg:      '#FAF5F0',
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#5D3A1A' }}>
            Réservations
          </h2>
          <p className="text-sm" style={{ color: '#8B7355' }}>
            Gestion des locations courte durée
          </p>
        </div>
        <Link
          href="/reservations/nouveau"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 w-fit"
          style={{ backgroundColor: '#8B4513' }}
        >
          <Plus className="w-4 h-4" />
          Nouvelle réservation
        </Link>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: card.bg, borderColor: '#F0E6D8' }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: '#8B7355' }}>
              {card.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filtres + Recherche ── */}
      <div className="bg-white rounded-2xl border p-4 space-y-3" style={{ borderColor: '#F0E6D8' }}>
        {/* Recherche */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: '#8B7355' }}
          />
          <input
            type="text"
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher par client, bien, téléphone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
            style={{
              borderColor: '#F0E6D8',
              backgroundColor: '#FAF5F0',
              color: '#5D3A1A',
            }}
            onFocus={e  => { e.target.style.borderColor = '#8B4513' }}
            onBlur={e   => { e.target.style.borderColor = '#F0E6D8' }}
          />
        </div>

        {/* Filtres statut */}
        <div className="flex flex-wrap gap-2">
          {FILTRES.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltre(f.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={
                filtre === f.value
                  ? { backgroundColor: '#8B4513', color: '#FFFFFF' }
                  : { backgroundColor: '#FAF5F0', color: '#8B7355' }
              }
            >
              {f.label}
              {f.value !== 'tous' && (
                <span className="ml-1.5 opacity-70">
                  ({f.value === 'en_attente' ? stats.en_attente :
                    f.value === 'confirmee'  ? stats.confirmees  :
                    f.value === 'en_cours'   ? stats.en_cours    :
                    f.value === 'terminee'   ? stats.terminees   :
                    stats.annulees})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Liste ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B4513' }} />
        </div>
      ) : reservationsFiltrees.length === 0 ? (
        <div
          className="bg-white rounded-2xl border p-12 text-center"
          style={{ borderColor: '#F0E6D8' }}
        >
          <Calendar
            className="w-16 h-16 mx-auto mb-4 opacity-20"
            style={{ color: '#8B4513' }}
          />
          <h3 className="text-lg font-bold mb-2" style={{ color: '#5D3A1A' }}>
            {recherche || filtre !== 'tous'
              ? 'Aucune réservation trouvée'
              : 'Aucune réservation'}
          </h3>
          <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
            {recherche || filtre !== 'tous'
              ? 'Modifiez vos critères de recherche'
              : 'Créez votre première réservation pour commencer'}
          </p>
          {!recherche && filtre === 'tous' && (
            <Link
              href="/reservations/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: '#8B4513' }}
            >
              <Plus className="w-4 h-4" />
              Nouvelle réservation
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm" style={{ color: '#8B7355' }}>
            {reservationsFiltrees.length} réservation{reservationsFiltrees.length > 1 ? 's' : ''}
            {filtre !== 'tous' && ` · ${FILTRES.find(f => f.value === filtre)?.label}`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reservationsFiltrees.map(r => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onStatutChange={handleStatutChange}
              />
            ))}
          </div>

          {/* Résumé revenus si terminées affichées */}
          {(filtre === 'tous' || filtre === 'terminee') && stats.revenusTotal > 0 && (
            <div
              className="rounded-2xl border p-4 flex items-center gap-3"
              style={{ backgroundColor: '#F0F5E8', borderColor: '#C8DDA0' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#556B2F' }}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold" style={{ color: '#556B2F' }}>
                  {stats.revenusTotal.toLocaleString()} FCFA encaissés au total
                </p>
                <p className="text-sm" style={{ color: '#6B8C3F' }}>
                  Dont {stats.revenusMois.toLocaleString()} FCFA ce mois-ci
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
