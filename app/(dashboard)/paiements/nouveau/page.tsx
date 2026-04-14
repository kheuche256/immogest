'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Wallet, User, Building2, Calendar,
  CreditCard, FileText, CheckCircle, Loader2, AlertCircle,
  ChevronDown, Banknote, Smartphone, Landmark, Hash,
} from 'lucide-react'
import { usePaiements, type PaiementFormData } from '@/hooks/usePaiements'
import { useLocataires } from '@/hooks/useLocataires'
import { useBiens } from '@/hooks/useBiens'

// ─── Types locaux ─────────────────────────────────────────────────────────────

type TypePaiement = 'loyer' | 'charges' | 'depot' | 'autre'
type ModePaiement = 'especes' | 'wave' | 'om' | 'virement'
type StatutPaiement = 'payé' | 'en_attente' | 'retard'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMoisActuel() {
  return new Date().toISOString().slice(0, 7)
}

function getDateAujourdHui() {
  return new Date().toISOString().split('T')[0]
}

function getDateEcheanceDefaut(mois: string) {
  return `${mois}-05`
}

function formatMontant(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

// ─── Composants UI ────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
      {children}
      {required && <span className="ml-1" style={{ color: '#FF4D4F' }}>*</span>}
    </label>
  )
}

function SelectField({
  value, onChange, children, icon: Icon, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  icon?: React.ElementType
  placeholder?: string
}) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon size={16} color="rgba(255,255,255,0.3)" />
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl text-sm text-white outline-none transition-all py-3 pr-10"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          paddingLeft: Icon ? '40px' : '14px',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.4)' }} />
    </div>
  )
}

function InputField({
  type = 'text', value, onChange, placeholder, icon: Icon, min, max, step,
}: {
  type?: string
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  icon?: React.ElementType
  min?: string | number
  max?: string | number
  step?: string | number
}) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon size={16} color="rgba(255,255,255,0.3)" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-xl text-sm text-white outline-none transition-all py-3"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          paddingLeft: Icon ? '40px' : '14px',
          paddingRight: '14px',
          colorScheme: 'dark',
        }}
      />
    </div>
  )
}

// ─── Mode de paiement boutons ─────────────────────────────────────────────────

const MODES: { value: ModePaiement; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'especes',  label: 'Espèces',  icon: Banknote,   color: '#00C48C' },
  { value: 'wave',     label: 'Wave',     icon: Smartphone, color: '#0066FF' },
  { value: 'om',       label: 'Orange Money', icon: Smartphone, color: '#FF8C00' },
  { value: 'virement', label: 'Virement', icon: Landmark,   color: '#8B5CF6' },
]

function ModePaiementSelector({
  value,
  onChange,
}: {
  value: ModePaiement | ''
  onChange: (v: ModePaiement) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {MODES.map((m) => {
        const selected = value === m.value
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background: selected ? `${m.color}20` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selected ? m.color : 'rgba(255,255,255,0.08)'}`,
              color: selected ? m.color : 'rgba(255,255,255,0.5)',
              transform: selected ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <m.icon size={18} color={selected ? m.color : 'rgba(255,255,255,0.3)'} />
            {m.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title, icon: Icon, color = '#0066FF', children,
}: {
  title: string; icon: React.ElementType; color?: string; children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="flex items-center gap-2 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={16} color={color} />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function NouveauPaiementPage() {
  const router = useRouter()
  const { createPaiement } = usePaiements()
  const { locataires, isLoading: loadingLoc } = useLocataires()
  const { biens } = useBiens()

  // ── Champs du formulaire
  const [locataireId, setLocataireId]     = useState('')
  const [bienId, setBienId]               = useState('')
  const [montant, setMontant]             = useState('')
  const [type, setType]                   = useState<TypePaiement>('loyer')
  const [mois, setMois]                   = useState(getMoisActuel())
  const [dateEcheance, setDateEcheance]   = useState(getDateEcheanceDefaut(getMoisActuel()))
  const [statut, setStatut]               = useState<StatutPaiement>('en_attente')
  const [datePaiement, setDatePaiement]   = useState(getDateAujourdHui())
  const [modePaiement, setModePaiement]   = useState<ModePaiement | ''>('')
  const [reference, setReference]         = useState('')
  const [notes, setNotes]                 = useState('')

  // ── UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [success, setSuccess]           = useState(false)

  // ── Locataires actifs seulement
  const locatairesActifs = useMemo(
    () => locataires.filter((l) => l.statut === 'actif'),
    [locataires]
  )

  // ── Locataire sélectionné
  const locataireSelectionne = useMemo(
    () => locataires.find((l) => l.id === locataireId) ?? null,
    [locataires, locataireId]
  )

  // ── Bien sélectionné (depuis la liste ou celui du locataire)
  const bienSelectionne = useMemo(
    () => biens.find((b) => b.id === bienId) ?? null,
    [biens, bienId]
  )

  // ── Quand le locataire change → pré-remplir bien + montant
  useEffect(() => {
    if (!locataireSelectionne) return

    // Pré-remplir le bien du locataire
    if (locataireSelectionne.bien_id) {
      setBienId(locataireSelectionne.bien_id)
    }
  }, [locataireSelectionne])

  // ── Quand le bien change → pré-remplir montant
  useEffect(() => {
    if (!bienSelectionne) return
    if (type === 'loyer') {
      setMontant(String(bienSelectionne.loyer_mensuel + (bienSelectionne.charges || 0)))
    } else if (type === 'charges') {
      setMontant(String(bienSelectionne.charges || 0))
    }
  }, [bienSelectionne, type])

  // ── Quand le mois change → ajuster la date d'échéance
  useEffect(() => {
    setDateEcheance(getDateEcheanceDefaut(mois))
  }, [mois])

  // ── Validation
  const isValid = useMemo(() => {
    const m = parseFloat(montant)
    if (!locataireId) return false
    if (!bienId) return false
    if (isNaN(m) || m <= 0) return false
    if (!mois) return false
    if (statut === 'payé' && !modePaiement) return false
    return true
  }, [locataireId, bienId, montant, mois, statut, modePaiement])

  // ── Soumettre
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const formData: PaiementFormData = {
        locataire_id:  locataireId,
        bien_id:       bienId,
        montant:       parseFloat(montant),
        type,
        mois,
        date_echeance: dateEcheance || undefined,
        statut,
        notes:         notes || undefined,
      }

      if (statut === 'payé') {
        formData.date_paiement  = datePaiement
        formData.mode_paiement  = modePaiement || undefined
        formData.reference      = reference || undefined
      }

      await createPaiement(formData)
      setSuccess(true)

      // Rediriger après 1.2s
      setTimeout(() => router.push('/paiements'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-fadeIn">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,196,140,0.15)' }}
        >
          <CheckCircle size={40} color="#00C48C" />
        </div>
        <h2 className="text-2xl font-bold text-white">Paiement enregistré !</h2>
        <p className="text-gray-400 text-sm">Redirection en cours…</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,102,255,0.15)' }}>
            <Wallet size={20} color="#0066FF" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nouveau paiement</h1>
            <p className="text-xs text-gray-500">Enregistrer un paiement manuellement</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Section 1 : Locataire & Bien ── */}
        <SectionCard title="Locataire & Bien" icon={User} color="#0066FF">
          <div>
            <FieldLabel required>Locataire</FieldLabel>
            <SelectField
              value={locataireId}
              onChange={(v) => { setLocataireId(v); setBienId(''); setMontant('') }}
              icon={User}
              placeholder={loadingLoc ? 'Chargement…' : 'Sélectionner un locataire'}
            >
              {locatairesActifs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.prenom ? `${l.prenom} ${l.nom}` : l.nom}
                  {l.bien?.nom ? ` — ${l.bien.nom}` : ''}
                </option>
              ))}
            </SelectField>
            {locataires.length > 0 && locatairesActifs.length === 0 && (
              <p className="mt-1.5 text-xs" style={{ color: '#FFB800' }}>
                Aucun locataire actif trouvé.
              </p>
            )}
          </div>

          {/* Info locataire sélectionné */}
          {locataireSelectionne && (
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(0,102,255,0.08)', border: '1px solid rgba(0,102,255,0.15)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(0,102,255,0.2)', color: '#0066FF' }}>
                {(locataireSelectionne.prenom?.[0] ?? locataireSelectionne.nom[0]).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {locataireSelectionne.prenom ? `${locataireSelectionne.prenom} ${locataireSelectionne.nom}` : locataireSelectionne.nom}
                </p>
                <p className="text-xs text-gray-400 truncate">{locataireSelectionne.telephone}</p>
              </div>
              {locataireSelectionne.bien && (
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-blue-400">{locataireSelectionne.bien.nom}</p>
                  <p className="text-xs text-gray-500">{formatMontant(locataireSelectionne.bien.loyer_mensuel)}</p>
                </div>
              )}
            </div>
          )}

          {/* Bien (si pas auto-rempli) */}
          {locataireId && !locataireSelectionne?.bien_id && (
            <div>
              <FieldLabel required>Bien concerné</FieldLabel>
              <SelectField
                value={bienId}
                onChange={setBienId}
                icon={Building2}
                placeholder="Sélectionner un bien"
              >
                {biens.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nom} — {formatMontant(b.loyer_mensuel)}
                  </option>
                ))}
              </SelectField>
            </div>
          )}
        </SectionCard>

        {/* ── Section 2 : Détails du paiement ── */}
        <SectionCard title="Détails du paiement" icon={CreditCard} color="#00C48C">
          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <FieldLabel required>Type</FieldLabel>
              <SelectField value={type} onChange={(v) => setType(v as TypePaiement)}>
                <option value="loyer">🏠 Loyer</option>
                <option value="charges">⚡ Charges</option>
                <option value="depot">🔒 Dépôt garantie</option>
                <option value="autre">📋 Autre</option>
              </SelectField>
            </div>

            {/* Statut */}
            <div>
              <FieldLabel required>Statut</FieldLabel>
              <SelectField value={statut} onChange={(v) => setStatut(v as StatutPaiement)}>
                <option value="en_attente">⏳ En attente</option>
                <option value="payé">✅ Payé</option>
                <option value="retard">🔴 En retard</option>
              </SelectField>
            </div>
          </div>

          {/* Montant */}
          <div>
            <FieldLabel required>Montant (FCFA)</FieldLabel>
            <InputField
              type="number"
              value={montant}
              onChange={setMontant}
              placeholder="Ex: 150000"
              icon={Wallet}
              min={0}
              step={500}
            />
            {bienSelectionne && (
              <div className="mt-1.5 flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMontant(String(bienSelectionne.loyer_mensuel))}
                  className="text-xs px-2 py-1 rounded-lg transition-all hover:scale-105"
                  style={{ background: 'rgba(0,102,255,0.12)', color: '#0066FF', border: '1px solid rgba(0,102,255,0.2)' }}
                >
                  Loyer: {formatMontant(bienSelectionne.loyer_mensuel)}
                </button>
                {(bienSelectionne.charges || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setMontant(String(bienSelectionne.loyer_mensuel + (bienSelectionne.charges || 0)))}
                    className="text-xs px-2 py-1 rounded-lg transition-all hover:scale-105"
                    style={{ background: 'rgba(0,196,140,0.12)', color: '#00C48C', border: '1px solid rgba(0,196,140,0.2)' }}
                  >
                    Loyer + charges: {formatMontant(bienSelectionne.loyer_mensuel + (bienSelectionne.charges || 0))}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Mois */}
            <div>
              <FieldLabel required>Mois concerné</FieldLabel>
              <InputField
                type="month"
                value={mois}
                onChange={setMois}
                icon={Calendar}
              />
            </div>

            {/* Date échéance */}
            <div>
              <FieldLabel>Date d&apos;échéance</FieldLabel>
              <InputField
                type="date"
                value={dateEcheance}
                onChange={setDateEcheance}
                icon={Calendar}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Section 3 : Paiement (si statut = payé) ── */}
        {statut === 'payé' && (
          <SectionCard title="Informations de paiement" icon={CheckCircle} color="#00C48C">
            {/* Date paiement */}
            <div>
              <FieldLabel required>Date de paiement</FieldLabel>
              <InputField
                type="date"
                value={datePaiement}
                onChange={setDatePaiement}
                icon={Calendar}
              />
            </div>

            {/* Mode de paiement */}
            <div>
              <FieldLabel required>Mode de paiement</FieldLabel>
              <ModePaiementSelector value={modePaiement} onChange={setModePaiement} />
              {statut === 'payé' && !modePaiement && (
                <p className="mt-1.5 text-xs" style={{ color: '#FF4D4F' }}>
                  Veuillez sélectionner un mode de paiement
                </p>
              )}
            </div>

            {/* Référence */}
            <div>
              <FieldLabel>Référence / Numéro de transaction</FieldLabel>
              <InputField
                value={reference}
                onChange={setReference}
                placeholder="Ex: TXN-20260330-001"
                icon={Hash}
              />
            </div>
          </SectionCard>
        )}

        {/* ── Section 4 : Notes ── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="flex items-center gap-2 pb-4 mb-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(156,163,175,0.15)' }}>
              <FileText size={16} color="rgba(156,163,175,0.8)" />
            </div>
            <h3 className="text-sm font-semibold text-white">Notes (optionnel)</h3>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajouter une note ou commentaire sur ce paiement…"
            rows={3}
            className="w-full rounded-xl text-sm text-white outline-none resize-none px-4 py-3"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
        </div>

        {/* ── Résumé ── */}
        {locataireSelectionne && bienId && montant && parseFloat(montant) > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(0,102,255,0.07)', border: '1px solid rgba(0,102,255,0.2)' }}
          >
            <p className="text-xs font-semibold text-blue-400 mb-3 uppercase tracking-wider">Récapitulatif</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Locataire</span>
                <span className="text-white font-medium">
                  {locataireSelectionne.prenom ? `${locataireSelectionne.prenom} ${locataireSelectionne.nom}` : locataireSelectionne.nom}
                </span>
              </div>
              {bienSelectionne && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Bien</span>
                  <span className="text-white">{bienSelectionne.nom}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Mois</span>
                <span className="text-white capitalize">
                  {new Date(mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <span className="text-white capitalize">{type}</span>
              </div>
              <div className="flex justify-between pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-gray-400 font-medium">Montant</span>
                <span className="text-blue-400 font-bold">{formatMontant(parseFloat(montant))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Statut</span>
                <span
                  className="font-medium"
                  style={{
                    color: statut === 'payé' ? '#00C48C' : statut === 'retard' ? '#FF4D4F' : '#FFB800',
                  }}
                >
                  {statut === 'payé' ? '✅ Payé' : statut === 'retard' ? '🔴 En retard' : '⏳ En attente'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Erreur ── */}
        {error && (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <AlertCircle size={18} color="#EF4444" className="shrink-0 mt-0.5" />
            <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
          </div>
        )}

        {/* ── Boutons ── */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: !isValid || isSubmitting
                ? 'rgba(0,102,255,0.3)'
                : 'linear-gradient(135deg,#0066FF,#0052cc)',
              boxShadow: !isValid || isSubmitting ? 'none' : '0 4px 15px rgba(0,102,255,0.35)',
              cursor: !isValid || isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enregistrement…
              </>
            ) : (
              <>
                <Wallet size={16} />
                Enregistrer le paiement
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
