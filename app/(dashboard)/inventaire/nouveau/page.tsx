'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useInventaire } from '@/hooks/useInventaire'
import { useBiens } from '@/hooks/useBiens'
import type { InventaireArticleFormData } from '@/types'
import {
  Package,
  ArrowLeft,
  Save,
  Loader2,
  Sofa,
  Cpu,
  Bed,
  UtensilsCrossed,
  Palette,
  Wrench,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Home,
  Hash,
  FileText,
  CalendarDays,
  Banknote,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Config catégories ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'mobilier',       label: 'Mobilier',        icon: Sofa,           color: '#8B4513', bg: '#FFF5EB' },
  { value: 'electromenager', label: 'Électroménager',   icon: Cpu,            color: '#0EA5E9', bg: '#E0F2FE' },
  { value: 'literie',        label: 'Literie',          icon: Bed,            color: '#8B5CF6', bg: '#EDE9FE' },
  { value: 'cuisine',        label: 'Cuisine',          icon: UtensilsCrossed,color: '#F59E0B', bg: '#FEF3C7' },
  { value: 'decoration',     label: 'Décoration',       icon: Palette,        color: '#EC4899', bg: '#FCE7F3' },
  { value: 'equipement',     label: 'Équipement',       icon: Wrench,         color: '#10B981', bg: '#D1FAE5' },
  { value: 'autre',          label: 'Autre',            icon: MoreHorizontal, color: '#6B7280', bg: '#F3F4F6' },
]

const ETATS = [
  { value: 'neuf',        label: 'Neuf',        icon: CheckCircle,  color: '#22C55E', bg: '#F0FDF4', desc: 'Jamais utilisé' },
  { value: 'bon',         label: 'Bon état',    icon: CheckCircle,  color: '#556B2F', bg: '#F0F5E8', desc: 'Légères traces' },
  { value: 'use',         label: 'Usé',         icon: AlertTriangle,color: '#F59E0B', bg: '#FEF3C7', desc: 'Usure visible' },
  { value: 'a_remplacer', label: 'À remplacer', icon: AlertTriangle,color: '#DC2626', bg: '#FEF2F2', desc: 'Hors d\'usage' },
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
export default function NouvelItemInventairePage() {
  const router = useRouter()
  const { createItem } = useInventaire()
  const { biens } = useBiens()

  const biensMeubles = biens.filter(b => b.est_meuble)

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<InventaireArticleFormData>({
    bien_id:    '',
    categorie:  'mobilier',
    nom:        '',
    quantite:   1,
    etat:       'bon',
    valeur:     null,
    date_achat: null,
    notes:      '',
  })

  const set = <K extends keyof InventaireArticleFormData>(
    key: K,
    value: InventaireArticleFormData[K],
  ) => setForm(prev => ({ ...prev, [key]: value }))

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.bien_id)  { toast.error('Sélectionnez un bien');    return }
    if (!form.nom.trim()){ toast.error('Entrez un nom d\'article'); return }

    setSaving(true)
    const { error } = await createItem({
      ...form,
      nom:    form.nom.trim(),
      notes:  form.notes?.trim() || undefined,
      valeur: form.valeur || null,
    })
    setSaving(false)

    if (error) {
      toast.error('Erreur lors de la création')
    } else {
      toast.success('Article ajouté à l\'inventaire !')
      router.push('/inventaire')
    }
  }

  const catCfg = CATEGORIES.find(c => c.value === form.categorie)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link
          href="/inventaire"
          className="p-2 rounded-xl transition-all hover:bg-amber-50"
          style={{ color: '#8B7355' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#5D3A1A' }}>Nouvel article</h1>
          <p className="text-sm" style={{ color: '#8B7355' }}>Ajoutez un meuble ou équipement à l'inventaire</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── 1. Bien ── */}
        <SectionCard title="Bien concerné" icon={Home}>
          <div>
            <Label>Bien meublé *</Label>
            <select
              value={form.bien_id}
              onChange={e => set('bien_id', e.target.value)}
              className={inputClass}
              style={inputStyle}
              onFocus={e  => { e.target.style.borderColor = '#8B4513' }}
              onBlur={e   => { e.target.style.borderColor = '#F0E6D8' }}
            >
              <option value="">Sélectionner un bien meublé…</option>
              {biensMeubles.map(b => (
                <option key={b.id} value={b.id}>
                  {b.nom} — {b.ville}
                </option>
              ))}
            </select>
            {biensMeubles.length === 0 && (
              <p className="mt-2 text-xs" style={{ color: '#DC2626' }}>
                Aucun bien meublé trouvé. Activez la location meublée dans la fiche d'un bien.
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── 2. Catégorie ── */}
        <SectionCard title="Catégorie" icon={Package}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(cat => {
              const Icon    = cat.icon
              const active  = form.categorie === cat.value
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => set('categorie', cat.value)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center"
                  style={{
                    borderColor:     active ? cat.color : '#F0E6D8',
                    backgroundColor: active ? cat.bg    : '#FFFFFF',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: active ? `${cat.color}25` : '#F9F3EC' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: active ? cat.color : '#8B7355' }} />
                  </div>
                  <span
                    className="text-xs font-semibold leading-tight"
                    style={{ color: active ? cat.color : '#8B7355' }}
                  >
                    {cat.label}
                  </span>
                </button>
              )
            })}
          </div>
        </SectionCard>

        {/* ── 3. Article ── */}
        <SectionCard title="Détails de l'article" icon={Hash}>
          <div className="space-y-4">

            {/* Nom */}
            <div>
              <Label>Nom de l'article *</Label>
              <input
                type="text"
                value={form.nom}
                onChange={e => set('nom', e.target.value)}
                placeholder={
                  form.categorie === 'mobilier'       ? 'Ex: Canapé 3 places, Table basse…'    :
                  form.categorie === 'electromenager' ? 'Ex: Réfrigérateur, Climatiseur…'       :
                  form.categorie === 'literie'        ? 'Ex: Matelas 2 places, Couette…'        :
                  form.categorie === 'cuisine'        ? 'Ex: Assiettes, Casseroles…'            :
                  form.categorie === 'decoration'     ? 'Ex: Tableau mural, Tapis…'             :
                  form.categorie === 'equipement'     ? 'Ex: Fer à repasser, Aspirateur…'       :
                  'Nom de l\'article…'
                }
                className={inputClass}
                style={inputStyle}
                onFocus={e  => { e.target.style.borderColor = '#8B4513' }}
                onBlur={e   => { e.target.style.borderColor = '#F0E6D8' }}
              />
            </div>

            {/* Quantité */}
            <div>
              <Label>Quantité *</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set('quantite', Math.max(1, form.quantite - 1))}
                  className="w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all hover:bg-amber-50"
                  style={{ borderColor: '#F0E6D8', color: '#8B4513' }}
                >
                  −
                </button>
                <div
                  className="w-16 h-10 rounded-xl flex items-center justify-center font-bold text-lg border-2"
                  style={{ borderColor: catCfg?.color ?? '#8B4513', color: catCfg?.color ?? '#8B4513', backgroundColor: catCfg?.bg ?? '#FFF5EB' }}
                >
                  {form.quantite}
                </div>
                <button
                  type="button"
                  onClick={() => set('quantite', Math.min(999, form.quantite + 1))}
                  className="w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all hover:bg-amber-50"
                  style={{ borderColor: '#F0E6D8', color: '#8B4513' }}
                >
                  +
                </button>
                <span className="text-sm" style={{ color: '#8B7355' }}>unité{form.quantite > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 4. État ── */}
        <SectionCard title="État de l'article" icon={CheckCircle}>
          <div className="grid grid-cols-2 gap-2">
            {ETATS.map(etat => {
              const Icon   = etat.icon
              const active = form.etat === etat.value
              return (
                <button
                  key={etat.value}
                  type="button"
                  onClick={() => set('etat', etat.value)}
                  className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor:     active ? etat.color : '#F0E6D8',
                    backgroundColor: active ? etat.bg    : '#FFFFFF',
                  }}
                >
                  <Icon
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: active ? etat.color : '#C4A882' }}
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: active ? etat.color : '#5D3A1A' }}>
                      {etat.label}
                    </p>
                    <p className="text-xs" style={{ color: '#8B7355' }}>{etat.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </SectionCard>

        {/* ── 5. Valeur & Date ── */}
        <SectionCard title="Valeur & Achat" icon={Banknote}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Valeur */}
            <div>
              <Label>Valeur estimée (FCFA)</Label>
              <div className="relative">
                <input
                  type="number"
                  value={form.valeur ?? ''}
                  onChange={e => set('valeur', e.target.value ? Number(e.target.value) : null)}
                  placeholder="Ex: 150000"
                  min="0"
                  className={inputClass + ' pr-16'}
                  style={inputStyle}
                  onFocus={e  => { e.target.style.borderColor = '#8B4513' }}
                  onBlur={e   => { e.target.style.borderColor = '#F0E6D8' }}
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold"
                  style={{ color: '#C4A882' }}
                >
                  FCFA
                </span>
              </div>
              {form.valeur && form.quantite > 1 && (
                <p className="mt-1 text-xs" style={{ color: '#8B7355' }}>
                  Total estimé : {new Intl.NumberFormat('fr-FR').format(form.valeur * form.quantite)} FCFA
                </p>
              )}
            </div>

            {/* Date d'achat */}
            <div>
              <Label>Date d'achat</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C4A882' }} />
                <input
                  type="date"
                  value={form.date_achat ?? ''}
                  onChange={e => set('date_achat', e.target.value || null)}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                  onFocus={e  => { e.target.style.borderColor = '#8B4513' }}
                  onBlur={e   => { e.target.style.borderColor = '#F0E6D8' }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 6. Notes ── */}
        <SectionCard title="Notes" icon={FileText}>
          <textarea
            value={form.notes ?? ''}
            onChange={e => set('notes', e.target.value)}
            placeholder="Observations, numéro de série, garantie…"
            rows={3}
            className={inputClass + ' resize-none'}
            style={inputStyle}
            onFocus={e  => { e.target.style.borderColor = '#8B4513' }}
            onBlur={e   => { e.target.style.borderColor = '#F0E6D8' }}
          />
        </SectionCard>

        {/* ── Récap ── */}
        {form.nom && form.bien_id && (
          <div
            className="rounded-2xl border p-4"
            style={{ backgroundColor: '#FDF8F0', borderColor: '#F0E6D8' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: '#5D3A1A' }}>
              Récapitulatif
            </p>
            <p className="text-sm" style={{ color: '#8B7355' }}>
              <span className="font-medium" style={{ color: '#8B4513' }}>{form.quantite}×</span>{' '}
              {form.nom}{' '}
              · {CATEGORIES.find(c => c.value === form.categorie)?.label}{' '}
              · {ETATS.find(e => e.value === form.etat)?.label}
              {form.valeur ? ` · ${new Intl.NumberFormat('fr-FR').format(form.valeur)} FCFA` : ''}
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 pb-8">
          <Link
            href="/inventaire"
            className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold text-center transition-all hover:bg-amber-50"
            style={{ borderColor: '#F0E6D8', color: '#8B7355' }}
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving || !form.bien_id || !form.nom.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#8B4513' }}
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
              : <><Save className="w-4 h-4" /> Ajouter à l'inventaire</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
