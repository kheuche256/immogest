'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useBiens } from '@/hooks/useBiens'
import { useLocataires } from '@/hooks/useLocataires'
import { useReservations } from '@/hooks/useReservations'
import type { ReservationFormData } from '@/types'
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  Building2,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Styles partagés ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  marginBottom: '6px',
  color: '#5D3A1A',
}

const inputBase =
  'w-full px-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-all'

const inputStyle: React.CSSProperties = {
  borderColor: '#F0E6D8',
  backgroundColor: '#FAFAFA',
  color: '#5D3A1A',
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#8B4513'
  e.target.style.backgroundColor = '#FFFFFF'
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#F0E6D8'
  e.target.style.backgroundColor = '#FAFAFA'
}

// ── Calcul nb nuits ────────────────────────────────────────────────────────────
function calcNbNuits(debut: string, fin: string): number {
  if (!debut || !fin) return 0
  const d = new Date(debut)
  const f = new Date(fin)
  const diff = Math.ceil((f.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NouvelleReservationPage() {
  const router  = useRouter()
  const { biens } = useBiens()
  const { locataires } = useLocataires()
  const { creerReservation, verifierDisponibilite } = useReservations()

  // ── Form state ───────────────────────────────────────────────────────────────
  const [bienId,            setBienId]            = useState('')
  const [dateDebut,         setDateDebut]          = useState('')
  const [dateFin,           setDateFin]            = useState('')
  const [tarifNuitee,       setTarifNuitee]        = useState('')
  const [acompte,           setAcompte]            = useState('')
  const [notes,             setNotes]              = useState('')

  // Client : locataire existant ou nouveau
  const [clientMode,        setClientMode]         = useState<'nouveau' | 'existant'>('nouveau')
  const [locataireId,       setLocataireId]        = useState('')
  const [clientNom,         setClientNom]          = useState('')
  const [clientTelephone,   setClientTelephone]    = useState('')
  const [clientEmail,       setClientEmail]        = useState('')

  // Disponibilité
  const [dispo,             setDispo]              = useState<boolean | null>(null)
  const [checkingDispo,     setCheckingDispo]      = useState(false)
  const [conflitDates,      setConflitDates]       = useState<string[]>([])

  // Soumission
  const [isSubmitting,      setIsSubmitting]       = useState(false)
  const [errors,            setErrors]             = useState<Record<string, string>>({})

  // ── Biens meublés uniquement ─────────────────────────────────────────────────
  const biensMeubles = biens.filter(b => b.est_meuble && b.statut !== 'loue')

  // ── Auto-remplir tarif depuis le bien ────────────────────────────────────────
  useEffect(() => {
    if (!bienId) return
    const bien = biens.find(b => b.id === bienId)
    if (bien?.tarif_nuit) {
      setTarifNuitee(String(bien.tarif_nuit))
    }
  }, [bienId, biens])

  // ── Auto-remplir client si locataire existant sélectionné ───────────────────
  useEffect(() => {
    if (clientMode !== 'existant' || !locataireId) return
    const loc = locataires.find(l => l.id === locataireId)
    if (loc) {
      setClientNom(loc.nom)
      setClientTelephone(loc.telephone)
      setClientEmail(loc.email || '')
    }
  }, [locataireId, locataires, clientMode])

  // ── Vérification disponibilité (debounced) ────────────────────────────────────
  const checkDispo = useCallback(async () => {
    if (!bienId || !dateDebut || !dateFin) return
    if (new Date(dateFin) <= new Date(dateDebut)) return
    setCheckingDispo(true)
    setDispo(null)
    try {
      const result = await verifierDisponibilite(bienId, dateDebut, dateFin)
      setDispo(result.disponible)
      setConflitDates(result.conflits.map(c =>
        `${formatDate(c.date_debut)} → ${formatDate(c.date_fin)} (${c.client_nom})`
      ))
    } finally {
      setCheckingDispo(false)
    }
  }, [bienId, dateDebut, dateFin, verifierDisponibilite])

  useEffect(() => {
    if (!bienId || !dateDebut || !dateFin) { setDispo(null); return }
    const t = setTimeout(checkDispo, 600)
    return () => clearTimeout(t)
  }, [bienId, dateDebut, dateFin, checkDispo])

  // ── Calculs ──────────────────────────────────────────────────────────────────
  const nbNuits      = calcNbNuits(dateDebut, dateFin)
  const tarif        = parseFloat(tarifNuitee) || 0
  const acompteVal   = parseFloat(acompte) || 0
  const montantTotal = nbNuits * tarif
  const restant      = Math.max(0, montantTotal - acompteVal)

  // ── Validation ───────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!bienId)               errs.bienId          = 'Sélectionnez un bien'
    if (!dateDebut)            errs.dateDebut        = 'Date de début requise'
    if (!dateFin)              errs.dateFin          = 'Date de fin requise'
    if (dateDebut && dateFin && new Date(dateFin) <= new Date(dateDebut))
                               errs.dateFin          = 'La date de fin doit être après la date de début'
    if (!tarifNuitee || tarif <= 0)
                               errs.tarifNuitee      = 'Tarif nuitée requis'
    if (clientMode === 'existant' && !locataireId)
                               errs.locataireId      = 'Sélectionnez un locataire'
    if (clientMode === 'nouveau') {
      if (!clientNom.trim())   errs.clientNom        = 'Nom du client requis'
      if (!clientTelephone.trim())
                               errs.clientTelephone  = 'Téléphone requis'
    }
    if (acompteVal > montantTotal && montantTotal > 0)
                               errs.acompte          = `L'acompte ne peut pas dépasser ${montantTotal.toLocaleString()} FCFA`
    if (dispo === false)       errs.dispo            = 'Le bien n\'est pas disponible sur ces dates'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Soumission ───────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const formData: ReservationFormData = {
        bien_id:          bienId,
        locataire_id:     clientMode === 'existant' ? locataireId : null,
        client_nom:       clientNom.trim(),
        client_telephone: clientTelephone.trim(),
        client_email:     clientEmail.trim() || undefined,
        date_debut:       dateDebut,
        date_fin:         dateFin,
        tarif_nuitee:     tarif,
        acompte:          acompteVal,
        notes:            notes.trim() || undefined,
        statut:           'en_attente',
      }

      await creerReservation(formData)
      toast.success('Réservation créée avec succès !')
      router.push('/reservations')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Rendu ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-center gap-4">
        <Link
          href="/reservations"
          className="p-2 rounded-xl transition-all hover:bg-amber-50 flex-shrink-0"
          style={{ backgroundColor: '#FAF5F0' }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#8B4513' }} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#5D3A1A' }}>
            Nouvelle réservation
          </h2>
          <p className="text-sm" style={{ color: '#8B7355' }}>
            Enregistrez une réservation courte durée
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Sélection du bien ── */}
        <div
          className="bg-white rounded-2xl border p-5 lg:p-6 space-y-4"
          style={{ borderColor: '#F0E6D8' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5" style={{ color: '#8B4513' }} />
            <h3 className="font-bold" style={{ color: '#5D3A1A' }}>Bien à réserver</h3>
          </div>

          {biensMeubles.length === 0 ? (
            <div
              className="rounded-xl p-4 text-sm"
              style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
            >
              <p className="font-medium mb-1">Aucun bien meublé disponible</p>
              <p className="text-xs opacity-80">
                Activez l'option "Bien meublé" dans les paramètres de vos biens.
              </p>
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Bien *</label>
              <select
                value={bienId}
                onChange={e => { setBienId(e.target.value); setDispo(null) }}
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                <option value="">Sélectionner un bien meublé...</option>
                {biensMeubles.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nom} — {b.ville}
                    {b.tarif_nuit ? ` (${b.tarif_nuit.toLocaleString()} F/nuit)` : ''}
                  </option>
                ))}
              </select>
              {errors.bienId && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.bienId}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Période ── */}
        <div
          className="bg-white rounded-2xl border p-5 lg:p-6 space-y-4"
          style={{ borderColor: '#F0E6D8' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5" style={{ color: '#8B4513' }} />
            <h3 className="font-bold" style={{ color: '#5D3A1A' }}>Période de séjour</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Date d'arrivée *</label>
              <input
                type="date"
                value={dateDebut}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setDateDebut(e.target.value)}
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {errors.dateDebut && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.dateDebut}</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Date de départ *</label>
              <input
                type="date"
                value={dateFin}
                min={dateDebut || new Date().toISOString().split('T')[0]}
                onChange={e => setDateFin(e.target.value)}
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {errors.dateFin && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.dateFin}</p>
              )}
            </div>
          </div>

          {/* Indicateur durée + disponibilité */}
          {dateDebut && dateFin && nbNuits > 0 && (
            <div
              className="rounded-xl px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: '#FAF5F0' }}
            >
              <span className="text-sm font-semibold" style={{ color: '#5D3A1A' }}>
                Durée : {nbNuits} nuit{nbNuits > 1 ? 's' : ''}
              </span>

              {checkingDispo ? (
                <span className="flex items-center gap-1.5 text-xs" style={{ color: '#8B7355' }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Vérification...
                </span>
              ) : dispo === true ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#556B2F' }}>
                  <CheckCircle className="w-4 h-4" />
                  Disponible
                </span>
              ) : dispo === false ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#DC2626' }}>
                  <AlertTriangle className="w-4 h-4" />
                  Non disponible
                </span>
              ) : null}
            </div>
          )}

          {/* Conflits */}
          {dispo === false && conflitDates.length > 0 && (
            <div
              className="rounded-xl p-3 text-xs space-y-1"
              style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
            >
              <p className="font-semibold mb-1">Réservations existantes :</p>
              {conflitDates.map((c, i) => (
                <p key={i}>· {c}</p>
              ))}
            </div>
          )}
          {errors.dispo && (
            <p className="text-xs" style={{ color: '#DC2626' }}>{errors.dispo}</p>
          )}
        </div>

        {/* ── Informations client ── */}
        <div
          className="bg-white rounded-2xl border p-5 lg:p-6 space-y-4"
          style={{ borderColor: '#F0E6D8' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5" style={{ color: '#8B4513' }} />
            <h3 className="font-bold" style={{ color: '#5D3A1A' }}>Informations client</h3>
          </div>

          {/* Toggle nouveau / existant */}
          <div
            className="flex rounded-xl p-1"
            style={{ backgroundColor: '#FAF5F0' }}
          >
            <button
              type="button"
              onClick={() => setClientMode('nouveau')}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                clientMode === 'nouveau'
                  ? { backgroundColor: '#8B4513', color: '#FFFFFF' }
                  : { color: '#8B7355' }
              }
            >
              <User className="w-4 h-4" />
              Nouveau client
            </button>
            <button
              type="button"
              onClick={() => setClientMode('existant')}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                clientMode === 'existant'
                  ? { backgroundColor: '#8B4513', color: '#FFFFFF' }
                  : { color: '#8B7355' }
              }
            >
              <Users className="w-4 h-4" />
              Locataire existant
            </button>
          </div>

          {/* Locataire existant */}
          {clientMode === 'existant' && (
            <div>
              <label style={labelStyle}>Locataire *</label>
              <select
                value={locataireId}
                onChange={e => setLocataireId(e.target.value)}
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                <option value="">Sélectionner un locataire...</option>
                {locataires.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.nom} — {l.telephone}
                  </option>
                ))}
              </select>
              {errors.locataireId && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.locataireId}</p>
              )}
            </div>
          )}

          {/* Champs client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>
                <User className="w-3.5 h-3.5 inline mr-1" />
                Nom complet *
              </label>
              <input
                type="text"
                value={clientNom}
                onChange={e => setClientNom(e.target.value)}
                placeholder="Prénom Nom"
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
                readOnly={clientMode === 'existant' && !!locataireId}
              />
              {errors.clientNom && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.clientNom}</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>
                <Phone className="w-3.5 h-3.5 inline mr-1" />
                Téléphone *
              </label>
              <input
                type="tel"
                value={clientTelephone}
                onChange={e => setClientTelephone(e.target.value)}
                placeholder="+221 77 000 00 00"
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
                readOnly={clientMode === 'existant' && !!locataireId}
              />
              {errors.clientTelephone && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.clientTelephone}</p>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              <Mail className="w-3.5 h-3.5 inline mr-1" />
              Email <span style={{ color: '#8B7355', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={e => setClientEmail(e.target.value)}
              placeholder="client@email.com"
              className={inputBase}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {/* ── Tarification ── */}
        <div
          className="bg-white rounded-2xl border p-5 lg:p-6 space-y-4"
          style={{ borderColor: '#F0E6D8' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5" style={{ color: '#8B4513' }} />
            <h3 className="font-bold" style={{ color: '#5D3A1A' }}>Tarification</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Tarif par nuit (FCFA) *</label>
              <input
                type="number"
                value={tarifNuitee}
                onChange={e => setTarifNuitee(e.target.value)}
                placeholder="25000"
                min="0"
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {errors.tarifNuitee && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.tarifNuitee}</p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Acompte reçu (FCFA)</label>
              <input
                type="number"
                value={acompte}
                onChange={e => setAcompte(e.target.value)}
                placeholder="0"
                min="0"
                max={montantTotal || undefined}
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              {errors.acompte && (
                <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.acompte}</p>
              )}
            </div>
          </div>

          {/* Récapitulatif montants */}
          {nbNuits > 0 && tarif > 0 && (
            <div
              className="rounded-xl p-4 space-y-2"
              style={{ backgroundColor: '#FAF5F0', border: '1px solid #F0E6D8' }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: '#8B7355' }}>
                  {nbNuits} nuit{nbNuits > 1 ? 's' : ''} × {tarif.toLocaleString()} FCFA
                </span>
                <span className="font-semibold" style={{ color: '#5D3A1A' }}>
                  {montantTotal.toLocaleString()} FCFA
                </span>
              </div>
              {acompteVal > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#8B7355' }}>Acompte versé</span>
                  <span className="font-semibold" style={{ color: '#556B2F' }}>
                    − {acompteVal.toLocaleString()} FCFA
                  </span>
                </div>
              )}
              <div
                className="flex justify-between text-sm font-bold pt-2"
                style={{ borderTop: '1px solid #E8DDD0' }}
              >
                <span style={{ color: '#5D3A1A' }}>Reste à payer</span>
                <span style={{ color: restant > 0 ? '#DC2626' : '#556B2F' }}>
                  {restant.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Notes ── */}
        <div
          className="bg-white rounded-2xl border p-5 lg:p-6"
          style={{ borderColor: '#F0E6D8' }}
        >
          <label style={{ ...labelStyle, marginBottom: '12px', fontSize: '1rem' }}>
            Notes / remarques
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Informations complémentaires, besoins spéciaux..."
            className="w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all resize-none"
            style={{ borderColor: '#F0E6D8', backgroundColor: '#FAFAFA', color: '#5D3A1A' }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button
            type="submit"
            disabled={isSubmitting || dispo === false || biensMeubles.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#8B4513' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Créer la réservation
              </>
            )}
          </button>
          <Link
            href="/reservations"
            className="flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
            style={{ backgroundColor: '#FAF5F0', color: '#8B7355', border: '1px solid #F0E6D8' }}
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
