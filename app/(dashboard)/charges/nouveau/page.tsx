'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCharges } from '@/hooks/useCharges'
import { useBiens } from '@/hooks/useBiens'
import type { ChargeFormData } from '@/types'
import {
  ArrowLeft,
  Receipt,
  Home,
  Zap,
  Droplets,
  Wifi,
  Sparkles,
  Shield,
  Building,
  Trash2,
  Tv,
  Wrench,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'

// ── Options type de charge ─────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { id: 'electricite', label: 'Électricité',  icon: Zap,            color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'eau',         label: 'Eau',          icon: Droplets,       color: '#0EA5E9', bg: '#E0F2FE' },
  { id: 'wifi',        label: 'WiFi/Internet',icon: Wifi,           color: '#8B5CF6', bg: '#EDE9FE' },
  { id: 'menage',      label: 'Ménage',       icon: Sparkles,       color: '#EC4899', bg: '#FCE7F3' },
  { id: 'gardiennage', label: 'Gardiennage',  icon: Shield,         color: '#10B981', bg: '#D1FAE5' },
  { id: 'syndic',      label: 'Syndic',       icon: Building,       color: '#6366F1', bg: '#E0E7FF' },
  { id: 'ordures',     label: 'Ordures',      icon: Trash2,         color: '#78716C', bg: '#F5F5F4' },
  { id: 'tv',          label: 'TV/Câble',     icon: Tv,             color: '#EF4444', bg: '#FEE2E2' },
  { id: 'entretien',   label: 'Entretien',    icon: Wrench,         color: '#8B4513', bg: '#FFF5EB' },
  { id: 'autre',       label: 'Autre',        icon: MoreHorizontal, color: '#6B7280', bg: '#F3F4F6' },
] as const

// ── Styles partagés ───────────────────────────────────────────────────────────
const inputBase = 'w-full px-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-all'
const inputStyle: React.CSSProperties = {
  borderColor: '#F0E6D8', backgroundColor: '#FAFAFA', color: '#5D3A1A',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8125rem', fontWeight: 600,
  marginBottom: 6, color: '#5D3A1A',
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#8B4513'
  e.target.style.backgroundColor = '#FFFFFF'
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#F0E6D8'
  e.target.style.backgroundColor = '#FAFAFA'
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NouvelleChargePage() {
  const router = useRouter()
  const { createCharge } = useCharges()
  const { biens } = useBiens()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError,    setFormError]    = useState('')

  const [form, setForm] = useState<ChargeFormData>({
    bien_id:      '',
    type:         'electricite',
    nom:          'Électricité',    // pré-rempli selon le type
    montant:      0,
    periodicite:  'mensuel',
    inclus_loyer: false,
    notes:        '',
  })

  // Auto-remplir le nom quand on change le type
  const handleTypeChange = (type: string) => {
    const opt = TYPE_OPTIONS.find(o => o.id === type)
    setForm(prev => ({
      ...prev,
      type,
      nom: prev.nom === (TYPE_OPTIONS.find(o => o.id === prev.type)?.label ?? '') || !prev.nom
        ? (opt?.label ?? '')
        : prev.nom,
    }))
  }

  // ── Validation ───────────────────────────────────────────────────────────────
  function validate(): string {
    if (!form.bien_id)              return 'Veuillez sélectionner un bien'
    if (!form.nom.trim())           return 'Veuillez entrer un nom pour la charge'
    if (!form.montant || form.montant <= 0) return 'Le montant doit être supérieur à 0'
    return ''
  }

  // ── Soumission ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const err = validate()
    if (err) { setFormError(err); return }

    setIsSubmitting(true)
    const { error } = await createCharge({
      ...form,
      notes: form.notes?.trim() || undefined,
    })

    if (error) {
      setFormError(error)
      setIsSubmitting(false)
    } else {
      router.push('/charges')
    }
  }

  const selectedType = TYPE_OPTIONS.find(o => o.id === form.type)

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link
          href="/charges"
          className="p-2 rounded-xl transition-all hover:bg-amber-50 flex-shrink-0"
          style={{ backgroundColor: '#FAF5F0' }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#8B4513' }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#5D3A1A' }}>Nouvelle charge</h1>
          <p className="text-sm" style={{ color: '#8B7355' }}>Ajoutez une charge à un bien</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Bien concerné ── */}
        <div className="bg-white rounded-2xl border p-5 lg:p-6" style={{ borderColor: '#F0E6D8' }}>
          <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#5D3A1A' }}>
            <Home className="w-5 h-5" style={{ color: '#8B4513' }} />
            Bien concerné
          </h2>
          <select
            value={form.bien_id}
            onChange={e => setForm(prev => ({ ...prev, bien_id: e.target.value }))}
            className={inputBase}
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
            required
          >
            <option value="">Sélectionnez un bien…</option>
            {biens.map(b => (
              <option key={b.id} value={b.id}>
                {b.nom} — {b.ville || b.adresse}
              </option>
            ))}
          </select>
        </div>

        {/* ── Type de charge ── */}
        <div className="bg-white rounded-2xl border p-5 lg:p-6" style={{ borderColor: '#F0E6D8' }}>
          <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#5D3A1A' }}>
            <Receipt className="w-5 h-5" style={{ color: '#8B4513' }} />
            Type de charge
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TYPE_OPTIONS.map(opt => {
              const Icon      = opt.icon
              const isSelected = form.type === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleTypeChange(opt.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center"
                  style={{
                    borderColor:     isSelected ? opt.color : '#F0E6D8',
                    backgroundColor: isSelected ? opt.bg    : 'transparent',
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: opt.color }} />
                  <span
                    className="text-xs font-medium leading-tight"
                    style={{ color: isSelected ? opt.color : '#8B7355' }}
                  >
                    {opt.label}
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: opt.color }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Détails ── */}
        <div className="bg-white rounded-2xl border p-5 lg:p-6 space-y-4" style={{ borderColor: '#F0E6D8' }}>
          <h2 className="font-bold" style={{ color: '#5D3A1A' }}>Détails</h2>

          {/* Nom */}
          <div>
            <label style={labelStyle}>Nom de la charge *</label>
            <input
              type="text"
              value={form.nom}
              onChange={e => setForm(prev => ({ ...prev, nom: e.target.value }))}
              placeholder={`Ex: Facture ${selectedType?.label ?? ''}`}
              className={inputBase}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
              required
            />
          </div>

          {/* Montant + Périodicité */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Montant (FCFA) *</label>
              <input
                type="number"
                min={0}
                value={form.montant || ''}
                onChange={e => setForm(prev => ({ ...prev, montant: parseInt(e.target.value) || 0 }))}
                placeholder="15 000"
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Périodicité *</label>
              <select
                value={form.periodicite}
                onChange={e => setForm(prev => ({ ...prev, periodicite: e.target.value }))}
                className={inputBase}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="annuel">Annuel</option>
                <option value="ponctuel">Ponctuel</option>
              </select>
            </div>
          </div>

          {/* Inclus au loyer — toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-xl cursor-pointer"
            style={{ backgroundColor: '#FAF5F0' }}
            onClick={() => setForm(prev => ({ ...prev, inclus_loyer: !prev.inclus_loyer }))}
          >
            <div>
              <p className="font-medium text-sm" style={{ color: '#5D3A1A' }}>
                Inclus dans le loyer
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#8B7355' }}>
                Cette charge est prise en charge par le propriétaire
              </p>
            </div>
            <div
              className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
              style={{ backgroundColor: form.inclus_loyer ? '#556B2F' : '#D1D5DB' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                style={{ left: form.inclus_loyer ? '26px' : '2px' }}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes <span style={{ color: '#8B7355', fontWeight: 400 }}>(optionnel)</span></label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Informations complémentaires…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-all resize-none"
              style={{ ...inputStyle }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {/* ── Récap montant ── */}
        {form.montant > 0 && (
          <div
            className="rounded-2xl border p-4 flex items-center justify-between"
            style={{ backgroundColor: '#FFF5EB', borderColor: '#F0E6D8' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: '#5D3A1A' }}>
                {form.nom || 'Charge'}
              </p>
              <p className="text-xs" style={{ color: '#8B7355' }}>
                {form.periodicite === 'mensuel'     ? `${new Intl.NumberFormat('fr-FR').format(form.montant * 12)} F/an estimés` :
                 form.periodicite === 'trimestriel' ? `${new Intl.NumberFormat('fr-FR').format(form.montant * 4)} F/an estimés` :
                 form.periodicite === 'annuel'      ? 'Charge annuelle' : 'Charge ponctuelle'}
              </p>
            </div>
            <p className="text-xl font-bold" style={{ color: '#8B4513' }}>
              {new Intl.NumberFormat('fr-FR').format(form.montant)} F
            </p>
          </div>
        )}

        {/* ── Erreur ── */}
        {formError && (
          <div
            className="p-4 rounded-xl flex items-center gap-3 text-sm"
            style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {formError}
          </div>
        )}

        {/* ── Boutons ── */}
        <div className="flex gap-3 pb-6">
          <Link
            href="/charges"
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-center transition-all border-2"
            style={{ borderColor: '#F0E6D8', color: '#8B7355' }}
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#8B4513' }}
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Création…</>
            ) : (
              <><CheckCircle className="w-4 h-4" />Créer la charge</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
