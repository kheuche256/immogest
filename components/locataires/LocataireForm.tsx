'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Locataire, LocataireFormData, Bien } from '@/types'
import { formatMontant } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormErrors = Partial<Record<keyof LocataireFormData | 'date_fin_contrat', string>>

interface LocataireFormProps {
  initialData?: Locataire
  onSubmit: (data: LocataireFormData) => Promise<void>
  isLoading?: boolean
  biens: Bien[]
}

// ─── Helpers UI ────────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
      style={{ color: '#9CA3AF' }}>
      {children}
      {required && <span className="ml-1" style={{ color: '#FF4444' }}>*</span>}
    </label>
  )
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#FF6B6B' }}>⚠ {msg}</p>
}

function Field({ label, required, error, suffix, children }: {
  label: string; required?: boolean; error?: string; suffix?: string; children: React.ReactNode
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="relative">
        {children}
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none"
            style={{ color: '#6B7280' }}>
            {suffix}
          </span>
        )}
      </div>
      <ErrorMsg msg={error} />
    </div>
  )
}

function baseInput(hasError?: boolean): React.CSSProperties {
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
  }
}

function onFocus(e: React.FocusEvent<HTMLElement>) {
  (e.currentTarget as HTMLElement).style.borderColor = '#0066FF'
  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(0,102,255,0.15)'
}

function onBlur(e: React.FocusEvent<HTMLElement>, hasError?: boolean) {
  ;(e.currentTarget as HTMLElement).style.borderColor = hasError ? '#FF4444' : 'rgba(255,255,255,0.1)'
  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
}

const chevronBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center`

// ─── Validation ────────────────────────────────────────────────────────────────

function validate(data: LocataireFormData): FormErrors {
  const errors: FormErrors = {}

  const fullNom = [data.prenom, data.nom].filter(Boolean).join(' ')
  if (!data.nom || fullNom.trim().length < 3)
    errors.nom = 'Le nom complet doit contenir au moins 3 caractères'

  if (!data.telephone)
    errors.telephone = 'Le téléphone est obligatoire'
  else if (!/^(7[0-9])\s?\d{3}\s?\d{2}\s?\d{2}$/.test(data.telephone.replace(/\s/g, '')))
    errors.telephone = 'Format invalide (ex: 77 123 45 67)'

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Adresse email invalide'

  if (data.date_entree && data.date_fin_contrat) {
    if (new Date(data.date_fin_contrat) <= new Date(data.date_entree))
      errors.date_fin_contrat = 'La date de fin doit être postérieure à la date d\'entrée'
  }

  return errors
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ num, color, title, children }: {
  num: number; color: string; title: string; children: React.ReactNode
}) {
  return (
    <div style={{
      background: 'rgba(17,24,39,0.8)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      padding: 24,
    }}>
      <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
          style={{ background: `${color}25`, color }}>
          {num}
        </span>
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Composant principal ───────────────────────────────────────────────────────

export default function LocataireForm({ initialData, onSubmit, isLoading = false, biens }: LocataireFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  // Splitter nom/prenom depuis initialData.nom si prenom absent
  const initPrenom = initialData?.prenom ?? ''
  const initNom    = initialData?.nom ?? ''

  const [form, setForm] = useState<LocataireFormData>({
    nom:              initNom,
    prenom:           initPrenom,
    telephone:        initialData?.telephone        ?? '',
    email:            initialData?.email            ?? '',
    cni:              initialData?.cni              ?? '',
    profession:       initialData?.profession       ?? '',
    bien_id:          initialData?.bien_id          ?? null,
    date_entree:      initialData?.date_entree      ?? '',
    date_fin_contrat: initialData?.date_fin_contrat ?? '',
    depot_garantie:   initialData?.depot_garantie ?? 0,
    statut:           initialData?.statut         ?? 'actif',
  })

  const [errors, setErrors]   = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof LocataireFormData, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) setErrors(validate(form))
  }, [form, submitted])

  function set<K extends keyof LocataireFormData>(key: K, value: LocataireFormData[K]) {
    setForm((p) => ({ ...p, [key]: value }))
    if (touched[key]) {
      const errs = validate({ ...form, [key]: value })
      setErrors((p) => ({ ...p, [key]: errs[key] }))
    }
  }

  function touch(key: keyof LocataireFormData) {
    setTouched((p) => ({ ...p, [key]: true }))
    const errs = validate(form)
    if (errs[key as keyof FormErrors])
      setErrors((p) => ({ ...p, [key]: errs[key as keyof FormErrors] }))
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

  // Biens disponibles : inclure le bien actuel si modification
  const biensDisponibles = biens.filter(
    (b) => b.statut === 'disponible' || b.id === initialData?.bien_id
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* ── Section 1 : Identité ─────────────────────────────────────────── */}
      <Section num={1} color="#0066FF" title="Identité du locataire">
        <div className="space-y-4">
          {/* Nom complet full width */}
          <Field label="Nom complet" required error={errors.nom}>
            <input
              type="text"
              value={`${form.prenom ? form.prenom + ' ' : ''}${form.nom}`.trimStart()}
              onChange={(e) => {
                const parts = e.target.value.trim().split(/\s+/)
                if (parts.length >= 2) {
                  set('prenom', parts.slice(0, -1).join(' '))
                  set('nom', parts[parts.length - 1])
                } else {
                  set('prenom', '')
                  set('nom', e.target.value)
                }
              }}
              onBlur={() => touch('nom')}
              onFocus={onFocus}
              placeholder="Ex : Abdou Diallo"
              style={{ ...baseInput(!!errors.nom), paddingRight: 14 }}
            />
          </Field>

          {/* Téléphone | Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Téléphone" required error={errors.telephone}>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => set('telephone', e.target.value)}
                onBlur={() => touch('telephone')}
                onFocus={onFocus}
                placeholder="77 123 45 67"
                style={{ ...baseInput(!!errors.telephone), paddingRight: 14 }}
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => set('email', e.target.value)}
                onBlur={() => touch('email')}
                onFocus={onFocus}
                placeholder="email@exemple.com"
                style={{ ...baseInput(!!errors.email), paddingRight: 14 }}
              />
            </Field>
          </div>

          {/* CNI | Profession */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="N° CNI">
              <input
                type="text"
                value={form.cni ?? ''}
                onChange={(e) => set('cni', e.target.value)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e)}
                placeholder="Numéro de la CNI"
                style={{ ...baseInput(), paddingRight: 14 }}
              />
            </Field>

            <Field label="Profession">
              <input
                type="text"
                value={form.profession ?? ''}
                onChange={(e) => set('profession', e.target.value)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e)}
                placeholder="Ex : Ingénieur, Commerçant…"
                style={{ ...baseInput(), paddingRight: 14 }}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Section 2 : Logement ─────────────────────────────────────────── */}
      <Section num={2} color="#00C48C" title="Logement assigné">
        <Field label="Bien immobilier">
          <select
            value={form.bien_id ?? ''}
            onChange={(e) => set('bien_id', e.target.value || null)}
            onFocus={onFocus}
            onBlur={(e) => onBlur(e)}
            style={{
              ...baseInput(),
              appearance: 'none',
              background: `rgba(255,255,255,0.04) ${chevronBg}`,
              paddingRight: 36,
              cursor: 'pointer',
            }}
          >
            <option value="" style={{ background: '#0D1223' }}>— Aucun logement —</option>
            {biensDisponibles.map((b) => (
              <option key={b.id} value={b.id} style={{ background: '#0D1223' }}>
                {b.nom} — {formatMontant(b.loyer_mensuel)}
                {b.statut === 'loue' && b.id === initialData?.bien_id ? ' (actuel)' : ''}
              </option>
            ))}
          </select>
        </Field>

        {/* Aperçu du bien sélectionné */}
        {form.bien_id && (() => {
          const b = biens.find((x) => x.id === form.bien_id)
          if (!b) return null
          return (
            <div className="mt-3 p-3 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(0,196,140,0.06)', border: '1px solid rgba(0,196,140,0.15)' }}>
              <span className="text-xl">🏠</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{b.nom}</p>
                <p className="text-xs text-gray-400">{[b.quartier, b.ville].filter(Boolean).join(', ')}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold" style={{ color: '#00C48C' }}>{formatMontant(b.loyer_mensuel)}</p>
                <p className="text-xs text-gray-500">/mois</p>
              </div>
            </div>
          )
        })()}
      </Section>

      {/* ── Section 3 : Contrat ──────────────────────────────────────────── */}
      <Section num={3} color="#FFB800" title="Contrat & Finances">
        <div className="space-y-4">
          {/* Date entrée | Date fin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date d'entrée">
              <input
                type="date"
                value={form.date_entree ?? ''}
                onChange={(e) => set('date_entree', e.target.value)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e)}
                style={{
                  ...baseInput(),
                  paddingRight: 14,
                  colorScheme: 'dark',
                }}
              />
            </Field>

            <Field label="Date de fin de contrat" error={errors.date_fin_contrat}>
              <input
                type="date"
                value={form.date_fin_contrat ?? ''}
                onChange={(e) => set('date_fin_contrat', e.target.value)}
                onBlur={() => touch('date_fin_contrat')}
                onFocus={onFocus}
                style={{
                  ...baseInput(!!errors.date_fin_contrat),
                  paddingRight: 14,
                  colorScheme: 'dark',
                }}
              />
            </Field>
          </div>

          {/* Durée calculée */}
          {form.date_entree && form.date_fin_contrat && !errors.date_fin_contrat && (() => {
            const debut = new Date(form.date_entree)
            const fin   = new Date(form.date_fin_contrat!)
            const mois  = Math.round((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24 * 30))
            if (mois <= 0) return null
            return (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(255,184,0,0.06)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.15)' }}>
                📅 Durée du contrat : <strong>{mois} mois</strong>
                {mois >= 12 && <span> ({Math.floor(mois / 12)} an{Math.floor(mois / 12) > 1 ? 's' : ''})</span>}
              </div>
            )
          })()}

          {/* Dépôt garantie | Statut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Dépôt de garantie" suffix="FCFA">
              <input
                type="number"
                min={0}
                value={form.depot_garantie || ''}
                onChange={(e) => set('depot_garantie', parseFloat(e.target.value) || 0)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e)}
                placeholder="0"
                style={{ ...baseInput(), paddingRight: 56 }}
              />
            </Field>

            <Field label="Statut du locataire">
              <select
                value={form.statut ?? 'actif'}
                onChange={(e) => set('statut', e.target.value)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e)}
                style={{
                  ...baseInput(),
                  appearance: 'none',
                  background: `rgba(255,255,255,0.04) ${chevronBg}`,
                  paddingRight: 36,
                  cursor: 'pointer',
                }}
              >
                <option value="actif"      style={{ background: '#0D1223' }}>Actif</option>
                <option value="en_attente" style={{ background: '#0D1223' }}>En attente</option>
                <option value="en_retard"  style={{ background: '#0D1223' }}>En retard</option>
                <option value="parti"      style={{ background: '#0D1223' }}>Parti</option>
                <option value="inactif"    style={{ background: '#0D1223' }}>Inactif</option>
              </select>
            </Field>
          </div>

        </div>
      </Section>

      {/* ── Boutons ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.back()} disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-gray-300 transition-all duration-200 disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
          Annuler
        </button>

        <button type="submit" disabled={isLoading || (submitted && !isValid)}
          className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)', boxShadow: '0 4px 16px rgba(0,102,255,0.3)' }}>
          {isLoading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              Enregistrement…
            </>
          ) : (
            <>{isEdit ? '💾' : '✨'} {isEdit ? 'Enregistrer les modifications' : 'Ajouter le locataire'}</>
          )}
        </button>
      </div>

    </form>
  )
}
