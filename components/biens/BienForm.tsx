'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bien, BienFormData } from '@/types'

// ─── Types internes ───────────────────────────────────────────────────────────

type FormErrors = Partial<Record<keyof BienFormData, string>>

interface BienFormProps {
  initialData?: Bien
  onSubmit: (data: BienFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: 'appartement',      label: 'Appartement' },
  { value: 'villa',            label: 'Villa' },
  { value: 'maison',           label: 'Maison' },
  { value: 'studio',           label: 'Studio' },
  { value: 'immeuble',         label: 'Immeuble' },
  { value: 'local_commercial', label: 'Local commercial' },
  { value: 'bureau',           label: 'Bureau' },
  { value: 'terrain',          label: 'Terrain' },
]

const STATUT_OPTIONS = [
  { value: 'disponible',  label: 'Disponible' },
  { value: 'loue',        label: 'Loué' },
  { value: 'en_travaux',  label: 'En travaux' },
  { value: 'maintenance', label: 'Maintenance' },
]

const VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour', 'Autre']

// ─── Helpers UI ────────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9CA3AF' }}>
      {children}
      {required && <span className="ml-1" style={{ color: '#FF4444' }}>*</span>}
    </label>
  )
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#FF6B6B' }}>
      <span>⚠</span> {msg}
    </p>
  )
}

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  suffix?: string
  children: React.ReactNode
}

function Field({ label, required, error, suffix, children }: FieldProps) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="relative">
        {children}
        {suffix && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none"
            style={{ color: '#6B7280' }}
          >
            {suffix}
          </span>
        )}
      </div>
      <ErrorMsg msg={error} />
    </div>
  )
}

// ─── Styles base input / select ────────────────────────────────────────────────

function inputClass(hasError?: boolean) {
  return {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${hasError ? '#FF4444' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 12,
    padding: '10px 14px',
    color: '#F9FAFB',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  } as React.CSSProperties
}

function onFocusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = '#0066FF'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,102,255,0.15)'
}

function onBlurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, hasError?: boolean) {
  e.currentTarget.style.borderColor = hasError ? '#FF4444' : 'rgba(255,255,255,0.1)'
  e.currentTarget.style.boxShadow = 'none'
}

// ─── Validation ────────────────────────────────────────────────────────────────

function validate(data: BienFormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.nom || data.nom.trim().length < 3)
    errors.nom = 'Le nom doit contenir au moins 3 caractères'
  if (!data.type)
    errors.type = 'Veuillez sélectionner un type'
  if (!data.loyer_mensuel || data.loyer_mensuel < 1000)
    errors.loyer_mensuel = 'Le loyer doit être supérieur à 1 000 FCFA'
  return errors
}

// ─── Composant principal ───────────────────────────────────────────────────────

export default function BienForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel,
}: BienFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [form, setForm] = useState<BienFormData>({
    nom:            initialData?.nom            ?? '',
    type:           initialData?.type           ?? 'appartement',
    adresse:        initialData?.adresse        ?? '',
    quartier:       initialData?.quartier       ?? '',
    ville:          initialData?.ville          ?? 'Dakar',
    nb_unites:      initialData?.nb_unites      ?? 1,
    loyer_mensuel:  initialData?.loyer_mensuel  ?? 0,
    charges:        initialData?.charges        ?? 0,
    description:    initialData?.description    ?? '',
    statut:         initialData?.statut         ?? 'disponible',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof BienFormData, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)

  // Re-validate quand un champ change (uniquement si déjà touché)
  useEffect(() => {
    if (submitted) {
      setErrors(validate(form))
    }
  }, [form, submitted])

  function set<K extends keyof BienFormData>(key: K, value: BienFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (touched[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  function touch(key: keyof BienFormData) {
    setTouched((prev) => ({ ...prev, [key]: true }))
    const errs = validate(form)
    if (errs[key]) setErrors((prev) => ({ ...prev, [key]: errs[key] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    await onSubmit(form)
  }

  const isValid = Object.keys(validate(form)).length === 0

  // ── Styles section ────────────────────────────────────────────────────────
  const sectionStyle: React.CSSProperties = {
    background: 'rgba(17,24,39,0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '24px',
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* ── Section 1 : Informations générales ─────────────────────────── */}
      <div style={sectionStyle}>
        <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ background: 'rgba(0,102,255,0.2)', color: '#4D9FFF' }}>1</span>
          Informations générales
        </h2>

        <div className="space-y-4">
          {/* Nom — full width */}
          <Field label="Nom du bien" required error={errors.nom}>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => set('nom', e.target.value)}
              onBlur={() => touch('nom')}
              onFocus={onFocusStyle}
              placeholder="Ex : Résidence Mermoz, Villa Almadies…"
              style={{ ...inputClass(!!errors.nom), paddingRight: 14 }}
            />
          </Field>

          {/* Type | Nb unités */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Type de bien" required error={errors.type}>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                onBlur={() => touch('type')}
                onFocus={onFocusStyle}
                style={{
                  ...inputClass(!!errors.type),
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: 36,
                  cursor: 'pointer',
                }}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} style={{ background: '#0D1223' }}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Nombre d'unités" error={errors.nb_unites}>
              <input
                type="number"
                min={1}
                value={form.nb_unites ?? 1}
                onChange={(e) => set('nb_unites', parseInt(e.target.value) || 1)}
                onFocus={onFocusStyle}
                onBlur={(e) => onBlurStyle(e)}
                style={{ ...inputClass(), paddingRight: 14 }}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Section 2 : Localisation ────────────────────────────────────── */}
      <div style={sectionStyle}>
        <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ background: 'rgba(0,196,140,0.2)', color: '#00C48C' }}>2</span>
          Localisation
        </h2>

        <div className="space-y-4">
          {/* Adresse — full width */}
          <Field label="Adresse complète">
            <input
              type="text"
              value={form.adresse ?? ''}
              onChange={(e) => set('adresse', e.target.value)}
              onFocus={onFocusStyle}
              onBlur={(e) => onBlurStyle(e)}
              placeholder="Ex : Rue 10, Point E"
              style={{ ...inputClass(), paddingRight: 14 }}
            />
          </Field>

          {/* Quartier | Ville */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Quartier">
              <input
                type="text"
                value={form.quartier ?? ''}
                onChange={(e) => set('quartier', e.target.value)}
                onFocus={onFocusStyle}
                onBlur={(e) => onBlurStyle(e)}
                placeholder="Ex : Mermoz, Sacré-Cœur, Almadies…"
                style={{ ...inputClass(), paddingRight: 14 }}
              />
            </Field>

            <Field label="Ville">
              <select
                value={form.ville ?? 'Dakar'}
                onChange={(e) => set('ville', e.target.value)}
                onFocus={onFocusStyle}
                onBlur={(e) => onBlurStyle(e)}
                style={{
                  ...inputClass(),
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: 36,
                  cursor: 'pointer',
                }}
              >
                {VILLES.map((v) => (
                  <option key={v} value={v} style={{ background: '#0D1223' }}>{v}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </div>

      {/* ── Section 3 : Financier ────────────────────────────────────────── */}
      <div style={sectionStyle}>
        <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ background: 'rgba(255,184,0,0.2)', color: '#FFB800' }}>3</span>
          Informations financières
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Loyer mensuel */}
          <Field label="Loyer mensuel" required error={errors.loyer_mensuel} suffix="FCFA">
            <input
              type="number"
              min={0}
              value={form.loyer_mensuel || ''}
              onChange={(e) => set('loyer_mensuel', parseFloat(e.target.value) || 0)}
              onBlur={(e) => { touch('loyer_mensuel'); onBlurStyle(e, !!errors.loyer_mensuel) }}
              onFocus={onFocusStyle}
              placeholder="150 000"
              style={{ ...inputClass(!!errors.loyer_mensuel), paddingRight: 56 }}
            />
          </Field>

          {/* Charges */}
          <Field label="Charges mensuelles" suffix="FCFA">
            <input
              type="number"
              min={0}
              value={form.charges || ''}
              onChange={(e) => set('charges', parseFloat(e.target.value) || 0)}
              onFocus={onFocusStyle}
              onBlur={(e) => onBlurStyle(e)}
              placeholder="15 000"
              style={{ ...inputClass(), paddingRight: 56 }}
            />
          </Field>
        </div>

        {/* Total affiché */}
        {(form.loyer_mensuel || 0) + (form.charges || 0) > 0 && (
          <div
            className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)' }}
          >
            <span className="text-sm text-gray-400">Total mensuel (loyer + charges)</span>
            <span className="text-base font-bold" style={{ color: '#FFB800' }}>
              {new Intl.NumberFormat('fr-FR').format((form.loyer_mensuel || 0) + (form.charges || 0))} FCFA
            </span>
          </div>
        )}
      </div>

      {/* ── Section 4 : Statut & Description ─────────────────────────────── */}
      <div style={sectionStyle}>
        <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ background: 'rgba(147,112,219,0.2)', color: '#9370DB' }}>4</span>
          Statut & Description
        </h2>

        <div className="space-y-4">
          {/* Statut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Statut du bien">
              <select
                value={form.statut ?? 'disponible'}
                onChange={(e) => set('statut', e.target.value)}
                onFocus={onFocusStyle}
                onBlur={(e) => onBlurStyle(e)}
                style={{
                  ...inputClass(),
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: 36,
                  cursor: 'pointer',
                }}
              >
                {STATUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} style={{ background: '#0D1223' }}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

          </div>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              onFocus={onFocusStyle}
              onBlur={(e) => onBlurStyle(e)}
              rows={3}
              placeholder="Description du bien, équipements, caractéristiques particulières…"
              style={{
                ...inputClass(),
                resize: 'vertical',
                paddingRight: 14,
                minHeight: 88,
              }}
            />
          </Field>
        </div>
      </div>

      {/* ── Boutons ──────────────────────────────────────────────────────── */}
      <div
        className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2"
      >
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-gray-300 transition-all duration-200 disabled:opacity-50"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          Annuler
        </button>

        <button
          type="submit"
          disabled={isLoading || (submitted && !isValid)}
          className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)', boxShadow: '0 4px 16px rgba(0,102,255,0.3)' }}
        >
          {isLoading ? (
            <>
              <span
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
              />
              Enregistrement…
            </>
          ) : (
            <>
              {isEdit ? '💾' : '✨'}{' '}
              {submitLabel ?? (isEdit ? 'Enregistrer les modifications' : 'Ajouter le bien')}
            </>
          )}
        </button>
      </div>

    </form>
  )
}
