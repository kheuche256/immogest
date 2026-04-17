'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useReservation, useReservations } from '@/hooks/useReservations'
import type { StatutReservation } from '@/types'
import {
  ArrowLeft,
  Calendar,
  Home,
  User,
  Phone,
  Mail,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  AlertCircle,
  CreditCard,
  FileText,
  PlayCircle,
  FlagTriangleRight,
  Moon,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Statut config ──────────────────────────────────────────────────────────────
const statutConfig: Record<StatutReservation, {
  bg: string; text: string; label: string; icon: React.ElementType
}> = {
  en_attente: { bg: '#FDF8E8', text: '#DAA520', label: 'En attente',  icon: Clock           },
  confirmee:  { bg: '#E8F4EA', text: '#22C55E', label: 'Confirmée',   icon: CheckCircle     },
  en_cours:   { bg: '#FFF5EB', text: '#8B4513', label: 'En cours',    icon: PlayCircle      },
  terminee:   { bg: '#F0F5E8', text: '#556B2F', label: 'Terminée',    icon: FlagTriangleRight },
  annulee:    { bg: '#FEF2F2', text: '#DC2626', label: 'Annulée',     icon: XCircle         },
}

// ── Statut paiement dérivé des montants ────────────────────────────────────────
function getPaiementStatut(montantTotal: number, acompte: number, montantRestant: number) {
  if (montantTotal === 0)     return { bg: '#F3F4F6', text: '#6B7280', label: '—' }
  if (montantRestant === 0)   return { bg: '#F0F5E8', text: '#556B2F', label: 'Payé intégralement' }
  if (acompte > 0)            return { bg: '#FDF8E8', text: '#DAA520', label: 'Acompte reçu' }
  return                             { bg: '#FEF2F2', text: '#DC2626', label: 'Non payé' }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatMontant(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReservationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id     = params.id as string

  const { reservation, isLoading, error } = useReservation(id)
  const { mettreAJourStatut, supprimerReservation } = useReservations()

  const [actionLoading,   setActionLoading]   = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // ── Actions de statut ──────────────────────────────────────────────────────
  const handleStatut = async (action: string, statut: StatutReservation) => {
    setActionLoading(action)
    try {
      await mettreAJourStatut(id, statut)
      toast.success(`Statut mis à jour : ${statutConfig[statut].label}`)
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Suppression ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setActionLoading('delete')
    try {
      await supprimerReservation(id)
      toast.success('Réservation supprimée')
      router.push('/reservations')
    } catch {
      toast.error('Erreur lors de la suppression')
      setActionLoading(null)
      setShowDeleteModal(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#8B4513', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: '#DC2626' }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: '#5D3A1A' }}>
          Réservation introuvable
        </h2>
        <p className="mb-4" style={{ color: '#8B7355' }}>
          {error?.message || 'Cette réservation n\'existe pas.'}
        </p>
        <Link
          href="/reservations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
          style={{ backgroundColor: '#8B4513', color: '#FFFFFF' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux réservations
        </Link>
      </div>
    )
  }

  // ── Données dérivées ───────────────────────────────────────────────────────
  const cfg       = statutConfig[reservation.statut]
  const StatIcon  = cfg.icon
  const paiement  = getPaiementStatut(
    reservation.montant_total,
    reservation.acompte,
    reservation.montant_restant,
  )

  const clientNom   = reservation.locataire?.nom       || reservation.client_nom       || 'Client'
  const clientTel   = reservation.locataire?.telephone || reservation.client_telephone || ''
  const clientEmail = reservation.locataire?.email     || reservation.client_email     || ''

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/reservations"
            className="p-2 rounded-xl transition-all hover:bg-white"
            style={{ color: '#5D3A1A' }}
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#5D3A1A' }}>
              Réservation #{reservation.id.slice(0, 8).toUpperCase()}
            </h1>
            <p style={{ color: '#8B7355' }}>
              Créée le {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium w-fit"
          style={{ backgroundColor: cfg.bg, color: cfg.text }}
        >
          <StatIcon className="w-5 h-5" />
          {cfg.label}
        </div>
      </div>

      {/* ── Grille principale ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Colonne gauche ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Bien réservé */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#F0E6D8' }}>
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#5D3A1A' }}>
              <Home className="w-5 h-5" style={{ color: '#8B4513' }} />
              Bien réservé
            </h2>
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: '#FFF5EB' }}
              >
                🏠
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate" style={{ color: '#5D3A1A' }}>
                  {reservation.bien?.nom || 'Bien'}
                </h3>
                <p className="text-sm" style={{ color: '#8B7355' }}>
                  {[reservation.bien?.adresse, reservation.bien?.ville]
                    .filter(Boolean).join(', ')}
                </p>
                {reservation.bien?.est_meuble && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full mt-2"
                    style={{ backgroundColor: '#FDF8E8', color: '#DAA520' }}
                  >
                    🛋️ Meublé
                  </span>
                )}
              </div>
              <Link
                href={`/biens/${reservation.bien_id}`}
                className="text-sm font-medium flex-shrink-0 hover:underline"
                style={{ color: '#8B4513' }}
              >
                Voir →
              </Link>
            </div>
          </div>

          {/* Client */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#F0E6D8' }}>
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#5D3A1A' }}>
              <User className="w-5 h-5" style={{ color: '#8B4513' }} />
              Client
            </h2>
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl flex-shrink-0"
                style={{ backgroundColor: '#8B4513' }}
              >
                {clientNom.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="text-lg font-bold" style={{ color: '#5D3A1A' }}>
                  {clientNom}
                </h3>
                {clientTel && (
                  <a
                    href={`tel:${clientTel}`}
                    className="flex items-center gap-2 hover:underline"
                    style={{ color: '#8B7355' }}
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {clientTel}
                  </a>
                )}
                {clientEmail && (
                  <a
                    href={`mailto:${clientEmail}`}
                    className="flex items-center gap-2 hover:underline truncate"
                    style={{ color: '#8B7355' }}
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    {clientEmail}
                  </a>
                )}
                {reservation.locataire_id && (
                  <Link
                    href={`/locataires/${reservation.locataire_id}`}
                    className="inline-block text-sm font-medium hover:underline"
                    style={{ color: '#8B4513' }}
                  >
                    Voir le profil locataire →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Dates du séjour */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#F0E6D8' }}>
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#5D3A1A' }}>
              <Calendar className="w-5 h-5" style={{ color: '#8B4513' }} />
              Dates du séjour
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#F0F5E8' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#556B2F' }}>Arrivée</p>
                <p className="font-bold capitalize text-sm lg:text-base" style={{ color: '#5D3A1A' }}>
                  {formatDate(reservation.date_debut)}
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#DC2626' }}>Départ</p>
                <p className="font-bold capitalize text-sm lg:text-base" style={{ color: '#5D3A1A' }}>
                  {formatDate(reservation.date_fin)}
                </p>
              </div>
            </div>
            <div
              className="mt-4 p-4 rounded-xl text-center"
              style={{ backgroundColor: '#FAF5F0' }}
            >
              <div className="flex items-center justify-center gap-2">
                <Moon className="w-5 h-5" style={{ color: '#8B4513' }} />
                <p className="text-3xl font-bold" style={{ color: '#8B4513' }}>
                  {reservation.nb_nuits}
                </p>
              </div>
              <p className="text-sm mt-1" style={{ color: '#8B7355' }}>
                nuit{reservation.nb_nuits > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Notes */}
          {reservation.notes && (
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#F0E6D8' }}>
              <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: '#5D3A1A' }}>
                <FileText className="w-5 h-5" style={{ color: '#8B4513' }} />
                Notes
              </h2>
              <p className="text-sm whitespace-pre-wrap" style={{ color: '#5D3A1A' }}>
                {reservation.notes}
              </p>
            </div>
          )}
        </div>

        {/* ── Colonne droite ── */}
        <div className="space-y-6">

          {/* Paiement */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#F0E6D8' }}>
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#5D3A1A' }}>
              <Wallet className="w-5 h-5" style={{ color: '#8B4513' }} />
              Paiement
            </h2>

            {/* Badge statut paiement */}
            <div
              className="px-4 py-2 rounded-xl text-center font-semibold text-sm mb-4"
              style={{ backgroundColor: paiement.bg, color: paiement.text }}
            >
              {paiement.label}
            </div>

            {/* Détails financiers */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#8B7355' }}>
                  Tarif / nuit
                </span>
                <span className="font-medium" style={{ color: '#5D3A1A' }}>
                  {formatMontant(reservation.tarif_nuitee)} F
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#8B7355' }}>Nuits</span>
                <span className="font-medium" style={{ color: '#5D3A1A' }}>
                  × {reservation.nb_nuits}
                </span>
              </div>
              <div
                className="border-t pt-3"
                style={{ borderColor: '#F0E6D8' }}
              >
                <div className="flex justify-between">
                  <span className="font-bold" style={{ color: '#5D3A1A' }}>Total</span>
                  <span className="text-xl font-bold" style={{ color: '#8B4513' }}>
                    {formatMontant(reservation.montant_total)} F
                  </span>
                </div>
              </div>

              {reservation.acompte > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#556B2F' }}>Acompte reçu</span>
                    <span className="font-semibold" style={{ color: '#556B2F' }}>
                      − {formatMontant(reservation.acompte)} F
                    </span>
                  </div>
                  <div
                    className="flex justify-between font-bold pt-2 border-t"
                    style={{ borderColor: '#F0E6D8', color: reservation.montant_restant === 0 ? '#556B2F' : '#DC2626' }}
                  >
                    <span>Reste à payer</span>
                    <span>
                      {reservation.montant_restant === 0
                        ? '✓ Soldé'
                        : `${formatMontant(reservation.montant_restant)} F`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#F0E6D8' }}>
            <h2 className="font-bold mb-4" style={{ color: '#5D3A1A' }}>Actions</h2>
            <div className="space-y-3">

              {/* Confirmer */}
              {reservation.statut === 'en_attente' && (
                <button
                  onClick={() => handleStatut('confirmer', 'confirmee')}
                  disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#22C55E' }}
                >
                  {actionLoading === 'confirmer'
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <CheckCircle className="w-5 h-5" />}
                  Confirmer la réservation
                </button>
              )}

              {/* Marquer En cours */}
              {reservation.statut === 'confirmee' && (
                <button
                  onClick={() => handleStatut('encours', 'en_cours')}
                  disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#8B4513' }}
                >
                  {actionLoading === 'encours'
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <PlayCircle className="w-5 h-5" />}
                  Marquer "En cours"
                </button>
              )}

              {/* Terminer */}
              {reservation.statut === 'en_cours' && (
                <button
                  onClick={() => handleStatut('terminer', 'terminee')}
                  disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#556B2F' }}
                >
                  {actionLoading === 'terminer'
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <FlagTriangleRight className="w-5 h-5" />}
                  Terminer la réservation
                </button>
              )}

              {/* Marquer comme payé (si reste > 0 et non annulée) */}
              {reservation.montant_restant > 0 && reservation.statut !== 'annulee' && (
                <button
                  onClick={async () => {
                    // Met à jour l'acompte = montant_total dans la DB
                    setActionLoading('paye')
                    try {
                      const { createClient } = await import('@/lib/supabase/client')
                      const supabase = createClient()
                      await supabase
                        .from('reservations')
                        .update({
                          acompte:          reservation.montant_total,
                          montant_restant:  0,
                          updated_at:       new Date().toISOString(),
                        })
                        .eq('id', id)
                      toast.success('Paiement intégral enregistré')
                      router.refresh()
                    } catch {
                      toast.error('Erreur lors de la mise à jour')
                    } finally {
                      setActionLoading(null)
                    }
                  }}
                  disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50 border-2"
                  style={{ borderColor: '#556B2F', color: '#556B2F' }}
                >
                  {actionLoading === 'paye'
                    ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <CreditCard className="w-5 h-5" />}
                  Marquer comme payé
                </button>
              )}

              {/* Annuler */}
              {reservation.statut !== 'annulee' && reservation.statut !== 'terminee' && (
                <button
                  onClick={() => handleStatut('annuler', 'annulee')}
                  disabled={!!actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
                >
                  {actionLoading === 'annuler'
                    ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <XCircle className="w-5 h-5" />}
                  Annuler la réservation
                </button>
              )}

              {/* Supprimer */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all hover:bg-red-50"
                style={{ color: '#DC2626' }}
              >
                <Trash2 className="w-5 h-5" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal suppression ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: 'rgba(93,58,26,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#FEF2F2' }}>
              <Trash2 className="w-7 h-7" style={{ color: '#DC2626' }} />
            </div>
            <h3 className="text-xl font-bold text-center mb-2" style={{ color: '#5D3A1A' }}>
              Supprimer la réservation ?
            </h3>
            <p className="text-center mb-6" style={{ color: '#8B7355' }}>
              Cette action est irréversible. La réservation de{' '}
              <strong style={{ color: '#5D3A1A' }}>{clientNom}</strong>{' '}
              sera définitivement supprimée.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl font-medium border-2"
                style={{ borderColor: '#E8DDD0', color: '#5D3A1A' }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading === 'delete'}
                className="flex-1 py-3 rounded-xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#DC2626' }}
              >
                {actionLoading === 'delete' ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
