'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEtatsLieux } from '@/hooks/useEtatsLieux'
import { useBiens } from '@/hooks/useBiens'
import { useLocataires } from '@/hooks/useLocataires'
import type { EtatLieuxFormData, EtatGeneral, PropreteLieux } from '@/types'
import {
  ClipboardList,
  ArrowLeft,
  Save,
  Loader2,
  LogIn,
  LogOut,
  Home,
  User,
  CalendarDays,
  Zap,
  Droplets,
  Star,
  SparkleIcon,
  Sparkles,
  AlertTriangle,
  FileText,
  CheckCircle,
  PenLine,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Config ─────────────────────────────────────────────────────────────────────
const ETATS_GENERAL: { value: EtatGeneral; label: string; color: string; bg: string; desc: string }[] = [
  { value: 'excellent', label: 'Excellent', color: '#22C55E', bg: '#F0FDF4', desc: 'Comme neuf' },
  { value: 'bon',       label: 'Bon',       color: '#556B2F', bg: '#F0F5E8', desc: 'Légères marques' },
  { value: 'moyen',     label: 'Moyen',     color: '#F59E0B', bg: '#FEF3C7', desc: 'Usure visible' },
  { value: 'mauvais',   label: 'Mauvais',   color: '#DC2626', bg: '#FEF2F2', desc: 'Dégradé' },
]

const PROPRETES: { value: PropreteLieux; label: string; color: string; bg: string }[] = [
  { value: 'impeccable',  label: 'Impeccable',  color: '#22C55E', bg: '#F0FDF4' },
  { value: 'propre',      label: 'Propre',      color: '#556B2F', bg: '#F0F5E8' },
  { value: 'a_nettoyer',  label: 'À nettoyer',  color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'sale',        label: 'Sale',        color: '#DC2626', bg: '#FEF2F2' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
const inputClass = `
  w-full px-4 py-3 rounded-xl border-2 text-sm outline-none transition-all
  bg-white text-[#5D3A1A] placeholder-[#C4A882]
`
const inputStyle = { borderColor: '#F0E6D8' }

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold mb-2" style={{ color: '#5D3A1A' }}>
      {children}
    </label>
  )
}

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#F0E6D8' }}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF5EB' }}>
          <Icon className="w-4 h-4" style={{ color: '#8B4513' }} />
        </div>
        <h2 className="font-bold text-base" style={{ color: '#5D3A1A' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function NouvelEtatLieuxPage() {
  const router = useRouter()
  const { createEtatLieux } = useEtatsLieux()
  const { biens } = useBiens()
  const { locataires } = useLocataires()

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EtatLieuxFormData>({
    bien_id:             '',
    locataire_id:        null,
    reservation_id:      null,
    type:                'entree',
    date_etat:           new Date().toISOString().split('T')[0],
    releve_electricite:  null,
    releve_eau:          null,
    etat_general:        null,
    proprete:            null,
    observations:        '',
    anomalies:           '',
    signe_proprietaire:  false,
    signe_locataire:     false,
  })

  const set = <K extends keyof EtatLieuxFormData>(
    key: K,
    value: EtatLieuxFormData[K],
  ) => setForm(prev => ({ ...prev, [key]: value }))

  // Locataires du bien sélectionné
  const locatairesDuBien = locataires.filter(
    l => l.bien_id === form.bien_id && l.statut === 'actif',
  )

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.bien_id)   { toast.error('Sélectionnez un bien');    return }
    if (!form.date_etat) { toast.error('Choisissez une date');      return }

    setSaving(true)
    const { error } = await createEtatLieux({
      ...form,
      observations: form.observations?.trim() || undefined,
      anomalies:    form.anomalies?.trim()    || undefined,
    })
    setSaving(false)

    if (error) {
      toast.error("Erreur lors de la création")
    } else {
      toast.success("État des lieux créé !")
      router.push('/etats-lieux')
    }
  }

  const bienChoisi = biens.find(b => b.id === form.bien_id)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link
          href="/etats-lieux"
          className="p-2 rounded-xl transition-all hover:bg-amber-50"
          style={{ color: '#8B7355' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#5D3A1A' }}>Nouvel état des lieux</h1>
          <p className="text-sm" style={{ color: '#8B7355' }}>Documenter une entrée ou sortie</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── 1. Type & Date ── */}
        <SectionCard title="Type & Date" icon={CalendarDays}>
          <div className="space-y-4">

            {/* Type */}
            <div>
              <Label>Type d'état des lieux *</Label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'entree', label: "État d'entrée",  icon: LogIn,  color: '#22C55E', bg: '#F0FDF4', desc: 'Début de location' },
                  { value: 'sortie', label: "État de sortie", icon: LogOut, color: '#DC2626', bg: '#FEF2F2', desc: 'Fin de location'   },
                ] as const).map(t => {
                  const Icon   = t.icon
                  const active = form.type === t.value
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('type', t.value)}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
                      style={{
                        borderColor:     active ? t.color : '#F0E6D8',
                        backgroundColor: active ? t.bg    : '#FFFFFF',
                      }}
                    >
                      <Icon className="w-6 h-6 flex-shrink-0" style={{ color: active ? t.color : '#C4A882' }} />
                      <div>
                        <p className="text-sm font-bold" style={{ color: active ? t.color : '#5D3A1A' }}>
                          {t.label}
                        </p>
                        <p className="text-xs" style={{ color: '#8B7355' }}>{t.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date */}
            <div>
              <Label>Date de l'état des lieux *</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C4A882' }} />
                <input
                  type="date"
                  value={form.date_etat}
                  onChange={e => set('date_etat', e.target.value)}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#8B4513' }}
                  onBlur={e  => { e.target.style.borderColor = '#F0E6D8' }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Bien & Locataire ── */}
        <SectionCard title="Bien & Locataire" icon={Home}>
          <div className="space-y-4">

            {/* Bien */}
            <div>
              <Label>Bien *</Label>
              <select
                value={form.bien_id}
                onChange={e => { set('bien_id', e.target.value); set('locataire_id', null) }}
                className={inputClass}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#8B4513' }}
                onBlur={e  => { e.target.style.borderColor = '#F0E6D8' }}
              >
                <option value="">Sélectionner un bien…</option>
                {biens.map(b => (
                  <option key={b.id} value={b.id}>{b.nom} — {b.ville}</option>
                ))}
              </select>
            </div>

            {/* Locataire */}
            <div>
              <Label>Locataire</Label>
              <select
                value={form.locataire_id ?? ''}
                onChange={e => set('locataire_id', e.target.value || null)}
                className={inputClass}
                style={inputStyle}
                disabled={!form.bien_id}
                onFocus={e => { e.target.style.borderColor = '#8B4513' }}
                onBlur={e  => { e.target.style.borderColor = '#F0E6D8' }}
              >
                <option value="">Aucun locataire associé</option>
                {locatairesDuBien.map(l => (
                  <option key={l.id} value={l.id}>{l.nom}</option>
                ))}
              </select>
              {form.bien_id && locatairesDuBien.length === 0 && (
                <p className="mt-1 text-xs" style={{ color: '#8B7355' }}>
                  Aucun locataire actif pour ce bien.
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── 3. Relevés compteurs ── */}
        <SectionCard title="Relevés des compteurs" icon={Zap}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Électricité */}
            <div>
              <Label>Électricité (kWh)</Label>
              <div className="relative">
                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#DAA520' }} />
                <input
                  type="number"
                  value={form.releve_electricite ?? ''}
                  onChange={e => set('releve_electricite', e.target.value ? Number(e.target.value) : null)}
                  placeholder="Ex: 12450"
                  min="0"
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#8B4513' }}
                  onBlur={e  => { e.target.style.borderColor = '#F0E6D8' }}
                />
              </div>
            </div>

            {/* Eau */}
            <div>
              <Label>Eau (m³)</Label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#0EA5E9' }} />
                <input
                  type="number"
                  value={form.releve_eau ?? ''}
                  onChange={e => set('releve_eau', e.target.value ? Number(e.target.value) : null)}
                  placeholder="Ex: 234"
                  min="0"
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#8B4513' }}
                  onBlur={e  => { e.target.style.borderColor = '#F0E6D8' }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 4. État général & Propreté ── */}
        <SectionCard title="État général & Propreté" icon={Star}>
          <div className="space-y-5">

            {/* État général */}
            <div>
              <Label>État général du bien</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ETATS_GENERAL.map(eg => {
                  const active = form.etat_general === eg.value
                  return (
                    <button
                      key={eg.value}
                      type="button"
                      onClick={() => set('etat_general', active ? null : eg.value)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor:     active ? eg.color : '#F0E6D8',
                        backgroundColor: active ? eg.bg    : '#FFFFFF',
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: active ? eg.color : '#5D3A1A' }}>
                        {eg.label}
                      </span>
                      <span className="text-xs text-center" style={{ color: '#8B7355' }}>
                        {eg.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Propreté */}
            <div>
              <Label>Propreté</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROPRETES.map(p => {
                  const active = form.proprete === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => set('proprete', active ? null : p.value)}
                      className="py-2.5 px-3 rounded-xl border-2 transition-all text-sm font-semibold"
                      style={{
                        borderColor:     active ? p.color : '#F0E6D8',
                        backgroundColor: active ? p.bg    : '#FFFFFF',
                        color:           active ? p.color : '#8B7355',
                      }}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 5. Observations & Anomalies ── */}
        <SectionCard title="Observations & Anomalies" icon={FileText}>
          <div className="space-y-4">

            <div>
              <Label>Observations générales</Label>
              <textarea
                value={form.observations ?? ''}
                onChange={e => set('observations', e.target.value)}
                placeholder="Description de l'état général, remarques…"
                rows={3}
                className={inputClass + ' resize-none'}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#8B4513' }}
                onBlur={e  => { e.target.style.borderColor = '#F0E6D8' }}
              />
            </div>

            <div>
              <Label>Anomalies constatées</Label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-3 w-4 h-4" style={{ color: '#F59E0B' }} />
                <textarea
                  value={form.anomalies ?? ''}
                  onChange={e => set('anomalies', e.target.value)}
                  placeholder="Dommages, pannes, manques… (laisser vide si aucun)"
                  rows={3}
                  className={inputClass + ' pl-10 resize-none'}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#F59E0B' }}
                  onBlur={e  => { e.target.style.borderColor = '#F0E6D8' }}
                />
              </div>
              {form.anomalies && (
                <p className="mt-1 text-xs flex items-center gap-1" style={{ color: '#F59E0B' }}>
                  <AlertTriangle className="w-3 h-3" />
                  Des anomalies seront signalées dans le rapport
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── 6. Signatures ── */}
        <SectionCard title="Signatures" icon={PenLine}>
          <p className="text-xs mb-4" style={{ color: '#8B7355' }}>
            Cochez si la signature a déjà été obtenue (vous pourrez signer plus tard depuis la fiche détail).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { key: 'signe_proprietaire' as const, label: 'Propriétaire', desc: 'Vous' },
              { key: 'signe_locataire'    as const, label: 'Locataire',    desc: form.locataire_id
                  ? locataires.find(l => l.id === form.locataire_id)?.nom ?? 'Locataire'
                  : 'Locataire' },
            ]).map(sig => {
              const checked = form[sig.key] ?? false
              return (
                <button
                  key={sig.key}
                  type="button"
                  onClick={() => set(sig.key, !checked)}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor:     checked ? '#556B2F' : '#F0E6D8',
                    backgroundColor: checked ? '#F0F5E8' : '#FFFFFF',
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center border-2 flex-shrink-0 transition-all"
                    style={{
                      borderColor:     checked ? '#556B2F' : '#D1C4AE',
                      backgroundColor: checked ? '#556B2F' : '#FFFFFF',
                    }}
                  >
                    {checked && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: checked ? '#556B2F' : '#5D3A1A' }}>
                      {sig.label}
                    </p>
                    <p className="text-xs" style={{ color: '#8B7355' }}>{sig.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </SectionCard>

        {/* ── Récap ── */}
        {form.bien_id && (
          <div
            className="rounded-2xl border p-4"
            style={{ backgroundColor: '#FDF8F0', borderColor: '#F0E6D8' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: '#5D3A1A' }}>
              {form.type === 'entree' ? '📋 État d\'entrée' : '📋 État de sortie'} — {bienChoisi?.nom ?? '…'}
            </p>
            <p className="text-xs" style={{ color: '#8B7355' }}>
              Le{' '}{new Date(form.date_etat).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {form.etat_general && ` · ${ETATS_GENERAL.find(e => e.value === form.etat_general)?.label}`}
              {form.anomalies && ' · ⚠ Anomalies signalées'}
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 pb-8">
          <Link
            href="/etats-lieux"
            className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold text-center transition-all hover:bg-amber-50"
            style={{ borderColor: '#F0E6D8', color: '#8B7355' }}
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving || !form.bien_id}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#8B4513' }}
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
              : <><Save className="w-4 h-4" /> Créer l'état des lieux</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
