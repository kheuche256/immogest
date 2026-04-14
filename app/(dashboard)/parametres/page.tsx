'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Settings, User, Lock, CreditCard, Sliders, Database,
  Save, Eye, EyeOff, Check, X, LogOut, Trash2, Download,
  AlertTriangle, ChevronRight, Shield, Zap, Building2,
  Monitor, Bell, MessageCircle, Calendar, DollarSign,
  TrendingUp, Users, Home, Loader2, RefreshCw, Star,
  Globe, Hash, Upload, Palette, ImageIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useBiens } from '@/hooks/useBiens'
import { useLocataires } from '@/hooks/useLocataires'
import { usePaiements } from '@/hooks/usePaiements'
import {
  exportBiensExcel, exportLocatairesExcel,
  exportPaiementsExcel, exportRapportExcel,
} from '@/lib/export'

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }
let _tid = 0

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-2xl pointer-events-auto"
          style={{
            background: t.type === 'success' ? 'rgba(0,196,140,0.97)'
              : t.type === 'error' ? 'rgba(239,68,68,0.97)'
              : 'rgba(59,130,246,0.97)',
            backdropFilter: 'blur(12px)',
            minWidth: '280px',
            animation: 'fadeInUp 0.2s ease',
          }}
        >
          <span className="flex-1">{t.message}</span>
          <button className="opacity-70 hover:opacity-100 transition-opacity" onClick={() => onRemove(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Modal générique ──────────────────────────────────────────────────────────

function Modal({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: 'rgb(17,24,39)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
          >
            <X size={16} color="rgba(255,255,255,0.6)" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-all"
      style={{
        background: value ? 'rgba(0,102,255,0.9)' : 'rgba(255,255,255,0.15)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform"
        style={{ transform: value ? 'translateX(26px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title, subtitle, icon: Icon, color = '#0066FF', children, noPadding,
}: {
  title: string; subtitle?: string; icon?: React.ElementType
  color?: string; children: React.ReactNode; noPadding?: boolean
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {(title || Icon) && (
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {Icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
              <Icon size={16} color={color} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className={noPadding ? '' : 'p-6 space-y-4'}>{children}</div>
    </div>
  )
}

// ─── Input stylisé ────────────────────────────────────────────────────────────

function Field({
  label, children, required,
}: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({
  value, onChange, placeholder, type = 'text', disabled, icon: Icon,
}: {
  value: string; onChange?: (v: string) => void
  placeholder?: string; type?: string; disabled?: boolean
  icon?: React.ElementType
}) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon size={14} color="rgba(255,255,255,0.25)" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl text-sm text-white outline-none transition-all py-2.5"
        style={{
          background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          paddingLeft: Icon ? '36px' : '14px',
          paddingRight: '14px',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          colorScheme: 'dark',
        }}
      />
    </div>
  )
}

// ─── Barre de progression ─────────────────────────────────────────────────────

function ProgressBar({ value, max, color = '#0066FF' }: { value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  const isHigh = pct >= 80
  const barColor = isHigh ? '#FF4D4F' : pct >= 60 ? '#FFB800' : color
  return (
    <div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: barColor }}>{value} utilisés</span>
        <span className="text-xs text-gray-600">{max === 999999 ? 'Illimité' : `${max} max`}</span>
      </div>
    </div>
  )
}

// ─── Plans ────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'starter' as const,
    label: 'Starter',
    prix: 0,
    prixLabel: 'Gratuit',
    color: '#6B7280',
    icon: Home,
    biens: 3,
    locataires: 10,
    features: ['3 biens', '10 locataires', 'Quittances PDF', 'Export Excel'],
  },
  {
    id: 'pro' as const,
    label: 'Pro',
    prix: 15000,
    prixLabel: '15 000 FCFA/mois',
    color: '#0066FF',
    icon: Star,
    biens: 15,
    locataires: 50,
    features: ['15 biens', '50 locataires', 'Rapports avancés', 'Alertes auto'],
  },
  {
    id: 'business' as const,
    label: 'Business',
    prix: 30000,
    prixLabel: '30 000 FCFA/mois',
    color: '#8B5CF6',
    icon: Zap,
    biens: 999999,
    locataires: 999999,
    features: ['Biens illimités', 'Locataires illimités', 'Multi-utilisateurs', 'Support prioritaire'],
  },
]

// ─── Force password ────────────────────────────────────────────────────────────

function getPasswordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const levels = [
    { label: 'Très faible', color: '#EF4444' },
    { label: 'Faible',      color: '#FF8C00' },
    { label: 'Moyen',       color: '#FFB800' },
    { label: 'Fort',        color: '#0066FF' },
    { label: 'Très fort',   color: '#00C48C' },
  ]
  return { score, ...levels[score] }
}

// ─── NAV items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'profil',       label: 'Profil',       icon: User,       color: '#0066FF' },
  { id: 'securite',     label: 'Sécurité',     icon: Lock,       color: '#00C48C' },
  { id: 'entreprise',   label: 'Entreprise',   icon: Building2,  color: '#FF6B35' },
  { id: 'abonnement',   label: 'Abonnement',   icon: CreditCard, color: '#FFB800' },
  { id: 'preferences',  label: 'Préférences',  icon: Sliders,    color: '#8B5CF6' },
  { id: 'donnees',      label: 'Données',      icon: Database,   color: '#6B7280' },
]

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function ParametresPage() {
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const { biens }      = useBiens()
  const { locataires } = useLocataires()
  const { paiements }  = usePaiements()

  // ── Navigation
  const [activeTab, setActiveTab] = useState<string>('profil')

  // ── Toast
  const [toasts, setToasts] = useState<Toast[]>([])
  function addToast(message: string, type: Toast['type'] = 'success') {
    const id = ++_tid
    setToasts((p) => [...p, { id, message, type }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500)
  }
  function removeToast(id: number) { setToasts((p) => p.filter((t) => t.id !== id)) }

  // ── Profil
  const [profile, setProfile] = useState({
    nom: '', prenom: '', email: '', telephone: '', entreprise: '', ville: '',
  })
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile]   = useState(false)

  // ── Sécurité
  const [newPwd, setNewPwd]         = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [savingPwd, setSavingPwd]   = useState(false)

  // ── Abonnement
  const [planActuel, setPlanActuel]         = useState<'starter'|'pro'|'business'>('starter')
  const [showPlanModal, setShowPlanModal]   = useState(false)
  const [planChoisi, setPlanChoisi]         = useState<typeof PLANS[0] | null>(null)
  const [changingPlan, setChangingPlan]     = useState(false)

  // ── Préférences
  const [jourEcheance, setJourEcheance]     = useState('5')
  const [notifEmail, setNotifEmail]         = useState(false)
  const [notifWhatsApp, setNotifWhatsApp]   = useState(false)
  const [savingPrefs, setSavingPrefs]       = useState(false)

  // ── Entreprise
  const [entrepriseNom, setEntrepriseNom]               = useState('')
  const [entrepriseAdresse, setEntrepriseAdresse]       = useState('')
  const [entrepriseNinea, setEntrepriseNinea]           = useState('')
  const [entrepriseRccm, setEntrepriseRccm]             = useState('')
  const [entrepriseSiteWeb, setEntrepriseSiteWeb]       = useState('')
  const [couleurPrincipale, setCouleurPrincipale]       = useState('#0066FF')
  const [logoUrl, setLogoUrl]                           = useState<string | null>(null)
  const [logoPreview, setLogoPreview]                   = useState<string | null>(null)
  const [logoFile, setLogoFile]                         = useState<File | null>(null)
  const [uploadingLogo, setUploadingLogo]               = useState(false)
  const [savingEntreprise, setSavingEntreprise]         = useState(false)

  // ── Données
  const [exporting, setExporting]           = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInput, setDeleteInput]       = useState('')
  const [deleting, setDeleting]             = useState(false)

  // ── Charger profil
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile({
          nom:        prof?.nom         ?? user.user_metadata?.nom         ?? '',
          prenom:     prof?.prenom      ?? user.user_metadata?.prenom      ?? '',
          email:      user.email        ?? '',
          telephone:  prof?.telephone   ?? user.user_metadata?.telephone   ?? '',
          entreprise: prof?.entreprise  ?? '',
          ville:      prof?.ville       ?? '',
        })

        if (prof?.plan) setPlanActuel(prof.plan)
        if (prof?.jour_echeance) setJourEcheance(String(prof.jour_echeance))
        if (prof?.notif_email !== undefined)    setNotifEmail(prof.notif_email)
        if (prof?.notif_whatsapp !== undefined) setNotifWhatsApp(prof.notif_whatsapp)

        // Entreprise
        if (prof?.entreprise)         setEntrepriseNom(prof.entreprise)
        if (prof?.adresse)            setEntrepriseAdresse(prof.adresse)
        if (prof?.ninea)              setEntrepriseNinea(prof.ninea)
        if (prof?.registre_commerce)  setEntrepriseRccm(prof.registre_commerce)
        if (prof?.site_web)           setEntrepriseSiteWeb(prof.site_web)
        if (prof?.couleur_principale) setCouleurPrincipale(prof.couleur_principale)
        if (prof?.logo_url)           setLogoUrl(prof.logo_url)
      } catch {
        // silencieux
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [supabase, router])

  // ── Initiales avatar
  const initiales = useMemo(() => {
    const p = profile.prenom?.[0] ?? ''
    const n = profile.nom?.[0]    ?? ''
    return (p + n).toUpperCase() || '??'
  }, [profile])

  // ── Sauvegarder profil
  async function handleSaveProfile() {
    setSavingProfile(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { error } = await supabase.from('profiles').upsert({
        id:         user.id,
        nom:        profile.nom,
        prenom:     profile.prenom,
        telephone:  profile.telephone,
        entreprise: profile.entreprise,
        ville:      profile.ville,
        updated_at: new Date().toISOString(),
      })

      if (error) throw new Error(error.message)
      addToast('✅ Profil enregistré avec succès')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Mot de passe
  const pwdStrength = getPasswordStrength(newPwd)
  const pwdValid = newPwd.length >= 6 && newPwd === confirmPwd

  async function handleChangePwd() {
    if (!pwdValid) return
    setSavingPwd(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) throw new Error(error.message)
      setNewPwd('')
      setConfirmPwd('')
      addToast('🔒 Mot de passe modifié avec succès')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setSavingPwd(false)
    }
  }

  async function handleSignOutAll() {
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/')
  }

  // ── Changer plan
  async function handleChangePlan() {
    if (!planChoisi) return
    setChangingPlan(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { error } = await supabase.from('profiles').upsert({
        id: user.id, plan: planChoisi.id, updated_at: new Date().toISOString(),
      })
      if (error) throw new Error(error.message)
      setPlanActuel(planChoisi.id)
      setShowPlanModal(false)
      addToast(`✅ Plan ${planChoisi.label} activé !`)
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setChangingPlan(false)
    }
  }

  // ── Sélection fichier logo (preview)
  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      addToast('Le logo doit faire moins de 2 MB', 'error')
      return
    }
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // ── Upload logo
  async function handleUploadLogo() {
    if (!logoFile) return
    setUploadingLogo(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const ext      = logoFile.name.split('.').pop() ?? 'png'
      const filePath = `${user.id}/logo.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('entreprises')
        .upload(filePath, logoFile, { upsert: true, contentType: logoFile.type })

      if (uploadError) {
        // Si le bucket n'existe pas encore, on garde la préview locale et on enregistre en base quand même
        if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
          addToast('⚠️ Storage non configuré — logo non sauvegardé (créer bucket "entreprises" dans Supabase)', 'info')
          setLogoFile(null)
          return
        }
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('entreprises')
        .getPublicUrl(filePath)

      await supabase.from('profiles').upsert({
        id: user.id, logo_url: publicUrl,
      })

      setLogoUrl(publicUrl)
      setLogoPreview(null)
      setLogoFile(null)
      addToast('✅ Logo uploadé avec succès')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erreur upload', 'error')
    } finally {
      setUploadingLogo(false)
    }
  }

  // ── Sauvegarder informations entreprise
  async function handleSaveEntreprise() {
    setSavingEntreprise(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { error } = await supabase.from('profiles').upsert({
        id:                  user.id,
        entreprise:          entrepriseNom          || null,
        adresse:             entrepriseAdresse      || null,
        ninea:               entrepriseNinea        || null,
        registre_commerce:   entrepriseRccm         || null,
        site_web:            entrepriseSiteWeb      || null,
        couleur_principale:  couleurPrincipale,
        updated_at:          new Date().toISOString(),
      })
      if (error) throw new Error(error.message)

      // Appliquer la couleur en temps réel
      document.documentElement.style.setProperty('--primary', couleurPrincipale)

      addToast('✅ Informations entreprise enregistrées')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setSavingEntreprise(false)
    }
  }

  // ── Sauvegarder préférences
  async function handleSavePrefs() {
    setSavingPrefs(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        jour_echeance:  parseInt(jourEcheance),
        notif_email:    notifEmail,
        notif_whatsapp: notifWhatsApp,
        updated_at:     new Date().toISOString(),
      })
      if (error) throw new Error(error.message)
      localStorage.setItem('immogest_prefs', JSON.stringify({ jourEcheance, notifEmail, notifWhatsApp }))
      addToast('✅ Préférences enregistrées')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erreur', 'error')
    } finally {
      setSavingPrefs(false)
    }
  }

  // ── Export tout
  async function handleExportAll() {
    setExporting(true)
    try {
      exportBiensExcel(biens)
      await new Promise(r => setTimeout(r, 400))
      exportLocatairesExcel(locataires)
      await new Promise(r => setTimeout(r, 400))
      exportPaiementsExcel(paiements)
      await new Promise(r => setTimeout(r, 400))
      exportRapportExcel({
        periode: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        biens, locataires, paiements,
        stats: {
          attendu:  paiements.reduce((s, p) => s + p.montant, 0),
          encaisse: paiements.filter(p => p.statut === 'payé').reduce((s, p) => s + p.montant, 0),
          impayes:  paiements.filter(p => p.statut !== 'payé').reduce((s, p) => s + p.montant, 0),
          taux:     paiements.length > 0
            ? Math.round(paiements.filter(p => p.statut === 'payé').length / paiements.length * 100)
            : 0,
        },
      })
      addToast('📥 4 fichiers Excel téléchargés')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erreur export', 'error')
    } finally {
      setExporting(false)
    }
  }

  // ── Supprimer compte
  async function handleDeleteAccount() {
    if (deleteInput !== 'SUPPRIMER') return
    setDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Supprimer données en cascade
      await supabase.from('paiements').delete().eq('user_id', user.id)
      await supabase.from('alertes').delete().eq('user_id', user.id)
      await supabase.from('locataires').delete().eq('user_id', user.id)
      await supabase.from('biens').delete().eq('user_id', user.id)
      await supabase.from('profiles').delete().eq('id', user.id)
      await supabase.auth.signOut()
      router.push('/')
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erreur', 'error')
      setDeleting(false)
    }
  }

  // ── Plan data
  const planData = PLANS.find(p => p.id === planActuel) ?? PLANS[0]

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-4 sm:p-6 animate-fadeIn">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(100,100,255,0.12)' }}
        >
          <Settings size={20} color="#8B8BFF" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Paramètres</h1>
          <p className="text-xs text-gray-500">Gérez votre compte et vos préférences</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Sidebar ── */}
        <aside className="lg:w-56 shrink-0">
          {/* Avatar */}
          <div
            className="rounded-2xl p-5 text-center mb-4"
            style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {loadingProfile ? (
              <div className="w-16 h-16 rounded-full mx-auto mb-3 animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
            ) : (
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#0066FF,#8B5CF6)' }}
              >
                {initiales}
              </div>
            )}
            <p className="text-sm font-semibold text-white truncate">
              {profile.prenom ? `${profile.prenom} ${profile.nom}` : profile.nom || '—'}
            </p>
            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
            <div className="mt-2">
              <span
                className="inline-block text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: `${planData.color}20`,
                  color: planData.color,
                  border: `1px solid ${planData.color}40`,
                }}
              >
                {planData.label}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {NAV_ITEMS.map((item, idx) => {
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all group"
                  style={{
                    background: active ? `${item.color}12` : 'transparent',
                    borderBottom: idx < NAV_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    borderLeft: active ? `2px solid ${item.color}` : '2px solid transparent',
                  }}
                >
                  <item.icon
                    size={15}
                    color={active ? item.color : 'rgba(255,255,255,0.35)'}
                    className="shrink-0 transition-all"
                  />
                  <span
                    className="text-sm font-medium transition-all"
                    style={{ color: active ? item.color : 'rgba(255,255,255,0.55)' }}
                  >
                    {item.label}
                  </span>
                  {active && <ChevronRight size={12} color={item.color} className="ml-auto" />}
                </button>
              )
            })}

            {/* Déconnexion */}
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              className="w-full flex items-center gap-3 px-4 py-3 transition-all"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <LogOut size={15} color="rgba(239,68,68,0.6)" className="shrink-0" />
              <span className="text-sm font-medium" style={{ color: 'rgba(239,68,68,0.7)' }}>
                Déconnexion
              </span>
            </button>
          </nav>
        </aside>

        {/* ── Contenu principal ── */}
        <main className="flex-1 min-w-0 space-y-5">

          {/* ══ SECTION PROFIL ══════════════════════════════════════════════ */}
          {activeTab === 'profil' && (
            <div className="space-y-4 animate-fadeIn">
              <SectionCard title="Informations personnelles" icon={User} color="#0066FF"
                subtitle="Votre identité sur ImmoGest">
                {loadingProfile ? (
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Prénom">
                        <Input value={profile.prenom} onChange={(v) => setProfile(p => ({ ...p, prenom: v }))} placeholder="Jean" />
                      </Field>
                      <Field label="Nom">
                        <Input value={profile.nom} onChange={(v) => setProfile(p => ({ ...p, nom: v }))} placeholder="Dupont" />
                      </Field>
                    </div>
                    <Field label="Adresse email">
                      <Input value={profile.email} disabled icon={Monitor} />
                      <p className="mt-1 text-xs text-gray-600">L'email ne peut pas être modifié directement.</p>
                    </Field>
                    <Field label="Téléphone">
                      <Input value={profile.telephone} onChange={(v) => setProfile(p => ({ ...p, telephone: v }))} placeholder="+221 77 000 00 00" />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Entreprise / Agence">
                        <Input value={profile.entreprise} onChange={(v) => setProfile(p => ({ ...p, entreprise: v }))} placeholder="Mon Agence Immo" />
                      </Field>
                      <Field label="Ville">
                        <Input value={profile.ville} onChange={(v) => setProfile(p => ({ ...p, ville: v }))} placeholder="Dakar" />
                      </Field>
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{
                        background: savingProfile ? 'rgba(0,102,255,0.4)' : 'linear-gradient(135deg,#0066FF,#0052cc)',
                        boxShadow: savingProfile ? 'none' : '0 4px 12px rgba(0,102,255,0.3)',
                      }}
                    >
                      {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {savingProfile ? 'Enregistrement…' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ══ SECTION SÉCURITÉ ════════════════════════════════════════════ */}
          {activeTab === 'securite' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Mot de passe */}
              <SectionCard title="Changer le mot de passe" icon={Lock} color="#00C48C"
                subtitle="Choisissez un mot de passe sécurisé">
                <div className="space-y-4">
                  <Field label="Nouveau mot de passe" required>
                    <div className="relative">
                      <input
                        type={showNewPwd ? 'text' : 'password'}
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="Min. 6 caractères"
                        className="w-full rounded-xl text-sm text-white outline-none transition-all py-2.5 pl-3 pr-10"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showNewPwd ? <EyeOff size={15} color="rgba(255,255,255,0.3)" /> : <Eye size={15} color="rgba(255,255,255,0.3)" />}
                      </button>
                    </div>
                    {/* Jauge de force */}
                    {newPwd && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[0,1,2,3].map(i => (
                            <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{
                              background: i < pwdStrength.score ? pwdStrength.color : 'rgba(255,255,255,0.08)',
                            }} />
                          ))}
                        </div>
                        <p className="text-xs" style={{ color: pwdStrength.color }}>{pwdStrength.label}</p>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirmer le mot de passe" required>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        className="w-full rounded-xl text-sm text-white outline-none transition-all py-2.5 pl-3 pr-10"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPwd ? <EyeOff size={15} color="rgba(255,255,255,0.3)" /> : <Eye size={15} color="rgba(255,255,255,0.3)" />}
                      </button>
                    </div>
                    {confirmPwd && newPwd !== confirmPwd && (
                      <p className="mt-1 text-xs text-red-400">Les mots de passe ne correspondent pas</p>
                    )}
                    {confirmPwd && newPwd === confirmPwd && (
                      <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                        <Check size={11} /> Mots de passe identiques
                      </p>
                    )}
                  </Field>

                  <button
                    onClick={handleChangePwd}
                    disabled={!pwdValid || savingPwd}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                    style={{
                      background: !pwdValid || savingPwd ? 'rgba(0,196,140,0.3)' : 'linear-gradient(135deg,#00C48C,#00a87a)',
                      boxShadow: !pwdValid || savingPwd ? 'none' : '0 4px 12px rgba(0,196,140,0.3)',
                      cursor: !pwdValid || savingPwd ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {savingPwd ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                    {savingPwd ? 'Modification…' : 'Modifier le mot de passe'}
                  </button>
                </div>
              </SectionCard>

              {/* Sessions actives */}
              <SectionCard title="Sessions actives" icon={Shield} color="#00C48C"
                subtitle="Appareils connectés à votre compte">
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(0,196,140,0.06)', border: '1px solid rgba(0,196,140,0.12)' }}
                  >
                    <Monitor size={18} color="#00C48C" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">Session courante</p>
                      <p className="text-xs text-gray-500">Navigateur web · Dakar, Sénégal</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Actif
                    </span>
                  </div>
                  <button
                    onClick={handleSignOutAll}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#EF4444',
                    }}
                  >
                    <LogOut size={14} />
                    Déconnecter toutes les sessions
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══ SECTION ENTREPRISE ══════════════════════════════════════════ */}
          {activeTab === 'entreprise' && (
            <div className="space-y-4 animate-fadeIn">

              {/* ── Logo ── */}
              <SectionCard title="Logo entreprise" icon={ImageIcon} color="#FF6B35"
                subtitle="Votre logo apparaîtra dans la sidebar et sur les quittances PDF">
                <div className="space-y-4">
                  {/* Aperçu logo actuel */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {(logoPreview || logoUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoPreview ?? logoUrl ?? ''}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon size={28} color="rgba(255,255,255,0.2)" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {logoPreview ? (
                        <p className="text-xs text-green-400 mb-2">✅ Nouveau logo prêt à être uploadé</p>
                      ) : logoUrl ? (
                        <p className="text-xs text-gray-400 mb-2">Logo actuel chargé depuis Supabase Storage</p>
                      ) : (
                        <p className="text-xs text-gray-500 mb-2">Aucun logo configuré. Formats acceptés : PNG, JPG, SVG. Max 2 MB.</p>
                      )}
                      <label
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all"
                        style={{
                          background: 'rgba(255,107,53,0.12)',
                          border: '1px solid rgba(255,107,53,0.25)',
                          color: '#FF6B35',
                        }}
                      >
                        <Upload size={13} />
                        Choisir un logo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Bouton upload */}
                  {logoFile && (
                    <button
                      onClick={handleUploadLogo}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{
                        background: uploadingLogo ? 'rgba(255,107,53,0.3)' : 'linear-gradient(135deg,#FF6B35,#e55a27)',
                        boxShadow: uploadingLogo ? 'none' : '0 4px 12px rgba(255,107,53,0.3)',
                      }}
                    >
                      {uploadingLogo ? <><Loader2 size={14} className="animate-spin" /> Upload en cours…</> : <><Upload size={14} /> Uploader le logo</>}
                    </button>
                  )}

                  {/* Note bucket */}
                  <div
                    className="rounded-xl p-3 text-xs"
                    style={{ background: 'rgba(255,184,0,0.07)', border: '1px solid rgba(255,184,0,0.15)', color: '#FFB800' }}
                  >
                    💡 Pour activer l&apos;upload, créez le bucket &quot;entreprises&quot; (public) dans Supabase Storage et ajoutez les policies d&apos;accès.
                  </div>
                </div>
              </SectionCard>

              {/* ── Informations entreprise ── */}
              <SectionCard title="Informations entreprise" icon={Building2} color="#FF6B35"
                subtitle="Ces informations apparaissent sur vos quittances PDF">
                <div className="space-y-4">
                  <Field label="Nom entreprise / Agence">
                    <Input
                      value={entrepriseNom}
                      onChange={setEntrepriseNom}
                      placeholder="Ex: Agence Immobilière Diallo & Fils"
                      icon={Building2}
                    />
                  </Field>

                  <Field label="Adresse complète">
                    <textarea
                      value={entrepriseAdresse}
                      onChange={(e) => setEntrepriseAdresse(e.target.value)}
                      placeholder="Ex: 45 Rue Carnot, Plateau, Dakar, Sénégal"
                      rows={2}
                      className="w-full rounded-xl text-sm text-white outline-none resize-none px-3 py-2.5"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="NINEA">
                      <Input
                        value={entrepriseNinea}
                        onChange={setEntrepriseNinea}
                        placeholder="Ex: 001234567X2"
                        icon={Hash}
                      />
                    </Field>
                    <Field label="Registre de commerce (RCCM)">
                      <Input
                        value={entrepriseRccm}
                        onChange={setEntrepriseRccm}
                        placeholder="Ex: SN-DKR-2020-A-1234"
                        icon={Hash}
                      />
                    </Field>
                  </div>

                  <Field label="Site web">
                    <Input
                      value={entrepriseSiteWeb}
                      onChange={setEntrepriseSiteWeb}
                      placeholder="https://www.monagence.sn"
                      icon={Globe}
                    />
                  </Field>

                  <button
                    onClick={handleSaveEntreprise}
                    disabled={savingEntreprise}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                    style={{
                      background: savingEntreprise ? 'rgba(255,107,53,0.3)' : 'linear-gradient(135deg,#FF6B35,#e55a27)',
                      boxShadow: savingEntreprise ? 'none' : '0 4px 12px rgba(255,107,53,0.3)',
                    }}
                  >
                    {savingEntreprise ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</> : <><Save size={14} /> Enregistrer</>}
                  </button>
                </div>
              </SectionCard>

              {/* ── Personnalisation couleur ── */}
              <SectionCard title="Personnalisation" icon={Palette} color="#FF6B35"
                subtitle="Couleur principale de votre espace ImmoGest">
                <div className="space-y-4">
                  {/* Palette prédéfinie */}
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Couleurs suggérées</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { hex: '#0066FF', label: 'Bleu' },
                        { hex: '#10B981', label: 'Vert' },
                        { hex: '#8B5CF6', label: 'Violet' },
                        { hex: '#F59E0B', label: 'Ambre' },
                        { hex: '#EF4444', label: 'Rouge' },
                        { hex: '#EC4899', label: 'Rose' },
                        { hex: '#06B6D4', label: 'Cyan' },
                        { hex: '#FF6B35', label: 'Orange' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setCouleurPrincipale(c.hex)}
                          title={c.label}
                          className="relative w-9 h-9 rounded-xl transition-all hover:scale-110"
                          style={{
                            background: c.hex,
                            boxShadow: couleurPrincipale === c.hex ? `0 0 0 3px rgba(255,255,255,0.8), 0 0 0 5px ${c.hex}` : 'none',
                            transform: couleurPrincipale === c.hex ? 'scale(1.15)' : 'scale(1)',
                          }}
                        >
                          {couleurPrincipale === c.hex && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Check size={14} color="#fff" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sélecteur couleur libre */}
                  <div className="flex items-center gap-3">
                    <Field label="Couleur personnalisée">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={couleurPrincipale}
                          onChange={(e) => setCouleurPrincipale(e.target.value)}
                          className="w-12 h-10 rounded-xl cursor-pointer border-none outline-none"
                          style={{ background: 'transparent', padding: '2px' }}
                        />
                        <Input
                          value={couleurPrincipale}
                          onChange={(v) => {
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setCouleurPrincipale(v)
                          }}
                          placeholder="#0066FF"
                        />
                      </div>
                    </Field>
                  </div>

                  {/* Aperçu */}
                  <div
                    className="rounded-xl p-4"
                    style={{ background: `${couleurPrincipale}12`, border: `1px solid ${couleurPrincipale}30` }}
                  >
                    <p className="text-xs font-semibold mb-2" style={{ color: couleurPrincipale }}>Aperçu en temps réel</p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${couleurPrincipale}25` }}
                      >
                        <Building2 size={16} color={couleurPrincipale} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{entrepriseNom || 'Votre Entreprise'}</p>
                        <p className="text-xs" style={{ color: couleurPrincipale }}>Gestion Immobilière</p>
                      </div>
                      <div
                        className="ml-auto px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ background: `linear-gradient(135deg,${couleurPrincipale},${couleurPrincipale}cc)` }}
                      >
                        Pro
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveEntreprise}
                    disabled={savingEntreprise}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                    style={{
                      background: savingEntreprise ? 'rgba(255,107,53,0.3)' : 'linear-gradient(135deg,#FF6B35,#e55a27)',
                      boxShadow: savingEntreprise ? 'none' : '0 4px 12px rgba(255,107,53,0.3)',
                    }}
                  >
                    {savingEntreprise ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</> : <><Palette size={14} /> Appliquer la couleur</>}
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══ SECTION ABONNEMENT ═════════════════════════════════════════ */}
          {activeTab === 'abonnement' && (
            <div className="space-y-4 animate-fadeIn">

              {/* Plan actuel */}
              <SectionCard title="Plan actuel" icon={CreditCard} color="#FFB800"
                subtitle="Votre abonnement et utilisation">
                <div>
                  {/* Badge plan */}
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl mb-5"
                    style={{ background: `${planData.color}10`, border: `1px solid ${planData.color}25` }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${planData.color}20` }}>
                      <planData.icon size={20} color={planData.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">Plan {planData.label}</span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${planData.color}20`, color: planData.color }}
                        >
                          Actif
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">{planData.prixLabel}</p>
                    </div>
                  </div>

                  {/* Utilisation */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Home size={14} color="rgba(255,255,255,0.4)" />
                        <span className="text-sm text-gray-400">Biens immobiliers</span>
                      </div>
                      <ProgressBar value={biens.length} max={planData.biens} color="#FFB800" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={14} color="rgba(255,255,255,0.4)" />
                        <span className="text-sm text-gray-400">Locataires</span>
                      </div>
                      <ProgressBar value={locataires.length} max={planData.locataires} color="#FFB800" />
                    </div>
                  </div>

                  {/* Fonctionnalités incluses */}
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs text-gray-500 mb-2">Inclus dans votre plan :</p>
                    <div className="flex flex-wrap gap-2">
                      {planData.features.map((f) => (
                        <span key={f} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}>
                          <Check size={10} color="#00C48C" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Changer de plan */}
              <SectionCard title="Changer de plan" icon={TrendingUp} color="#FFB800"
                subtitle="Passez à un plan supérieur pour plus de fonctionnalités">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PLANS.map((plan) => {
                    const isCurrent = plan.id === planActuel
                    return (
                      <div
                        key={plan.id}
                        className="rounded-2xl p-4 relative"
                        style={{
                          background: isCurrent ? `${plan.color}08` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isCurrent ? plan.color + '40' : 'rgba(255,255,255,0.08)'}`,
                          opacity: isCurrent ? 0.8 : 1,
                        }}
                      >
                        {isCurrent && (
                          <div
                            className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${plan.color}20`, color: plan.color }}
                          >
                            Actuel
                          </div>
                        )}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${plan.color}18` }}>
                          <plan.icon size={16} color={plan.color} />
                        </div>
                        <p className="text-sm font-bold text-white mb-1">{plan.label}</p>
                        <p className="text-xs mb-3" style={{ color: plan.color }}>
                          {plan.prix === 0 ? 'Gratuit' : `${plan.prix.toLocaleString('fr-FR')} FCFA/mois`}
                        </p>
                        <ul className="space-y-1 mb-4">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Check size={10} color={plan.color} /> {f}
                            </li>
                          ))}
                        </ul>
                        {!isCurrent && (
                          <button
                            onClick={() => { setPlanChoisi(plan); setShowPlanModal(true) }}
                            className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all"
                            style={{
                              background: `linear-gradient(135deg,${plan.color},${plan.color}cc)`,
                              boxShadow: `0 4px 10px ${plan.color}30`,
                            }}
                          >
                            Passer à {plan.label}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══ SECTION PRÉFÉRENCES ═════════════════════════════════════════ */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 animate-fadeIn">
              <SectionCard title="Préférences générales" icon={Sliders} color="#8B5CF6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Jour d'échéance par défaut">
                      <div className="relative">
                        <Calendar size={14} color="rgba(255,255,255,0.25)" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={jourEcheance}
                          onChange={(e) => setJourEcheance(e.target.value)}
                          className="w-full appearance-none rounded-xl text-sm text-white outline-none py-2.5 pl-9 pr-8"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                        >
                          {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>
                              {d === 5 ? `${d} (défaut)` : d.toString()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">Les loyers seront attendus le {jourEcheance} de chaque mois.</p>
                    </Field>

                    <Field label="Devise">
                      <div className="relative">
                        <DollarSign size={14} color="rgba(255,255,255,0.25)" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          disabled
                          className="w-full appearance-none rounded-xl text-sm text-white outline-none py-2.5 pl-9 pr-8 opacity-50 cursor-not-allowed"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                        >
                          <option>FCFA — Franc CFA</option>
                        </select>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">Multi-devises disponible en version Pro+.</p>
                    </Field>
                  </div>

                  <button
                    onClick={handleSavePrefs}
                    disabled={savingPrefs}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                    style={{
                      background: savingPrefs ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg,#8B5CF6,#7c3aed)',
                      boxShadow: savingPrefs ? 'none' : '0 4px 12px rgba(139,92,246,0.3)',
                    }}
                  >
                    {savingPrefs ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {savingPrefs ? 'Enregistrement…' : 'Sauvegarder les préférences'}
                  </button>
                </div>
              </SectionCard>

              {/* Notifications */}
              <SectionCard title="Notifications" icon={Bell} color="#8B5CF6"
                subtitle="Choisissez comment être alerté">
                <div className="space-y-1" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  {[
                    {
                      key: 'email', icon: Monitor, label: 'Alertes par email',
                      desc: 'Recevez les alertes et rappels par email',
                      value: notifEmail, onChange: setNotifEmail, soon: true,
                    },
                    {
                      key: 'whatsapp', icon: MessageCircle, label: 'Rappels WhatsApp',
                      desc: 'Recevez les relances directement sur WhatsApp',
                      value: notifWhatsApp, onChange: setNotifWhatsApp, soon: true,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.12)' }}>
                        <item.icon size={16} color="#8B5CF6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          {item.soon && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: 'rgba(255,184,0,0.12)', color: '#FFB800' }}>
                              Bientôt
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                      </div>
                      <Toggle value={item.value} onChange={item.onChange} disabled={item.soon} />
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* ══ SECTION DONNÉES ═════════════════════════════════════════════ */}
          {activeTab === 'donnees' && (
            <div className="space-y-4 animate-fadeIn">

              {/* Export */}
              <SectionCard title="Exporter mes données" icon={Download} color="#6B7280"
                subtitle="Sauvegardez toutes vos données au format Excel">
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Téléchargez l'intégralité de vos données (biens, locataires, paiements, rapport) en fichiers Excel.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { label: '🏠 Biens',        action: () => exportBiensExcel(biens),           color: '#FFB800' },
                      { label: '👥 Locataires',    action: () => exportLocatairesExcel(locataires), color: '#0066FF' },
                      { label: '💰 Paiements',     action: () => exportPaiementsExcel(paiements),   color: '#00C48C' },
                      { label: '📊 Rapport complet', action: () => exportRapportExcel({
                          periode: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
                          biens, locataires, paiements,
                          stats: {
                            attendu: paiements.reduce((s,p) => s+p.montant, 0),
                            encaisse: paiements.filter(p=>p.statut==='payé').reduce((s,p)=>s+p.montant,0),
                            impayes: paiements.filter(p=>p.statut!=='payé').reduce((s,p)=>s+p.montant,0),
                            taux: paiements.length > 0
                              ? Math.round(paiements.filter(p=>p.statut==='payé').length/paiements.length*100)
                              : 0,
                          },
                        }), color: '#8B5CF6',
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all text-left"
                        style={{
                          background: `${item.color}10`,
                          border: `1px solid ${item.color}20`,
                        }}
                      >
                        <Download size={14} color={item.color} />
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                    <button
                      onClick={handleExportAll}
                      disabled={exporting}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{
                        background: exporting ? 'rgba(107,114,128,0.4)' : 'linear-gradient(135deg,#4B5563,#374151)',
                        boxShadow: exporting ? 'none' : '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      {exporting
                        ? <><Loader2 size={14} className="animate-spin" /> Export en cours…</>
                        : <><Download size={14} /> 📥 Tout exporter (4 fichiers)</>}
                    </button>
                  </div>
                </div>
              </SectionCard>

              {/* Synchronisation */}
              <SectionCard title="Synchronisation" icon={RefreshCw} color="#0066FF">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <div>
                    <p className="text-sm text-white font-medium">Données synchronisées</p>
                    <p className="text-xs text-gray-500">Dernière synchronisation : il y a quelques instants</p>
                  </div>
                </div>
              </SectionCard>

              {/* Zone dangereuse */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <div
                  className="flex items-center gap-3 px-6 py-4"
                  style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <AlertTriangle size={16} color="#EF4444" />
                  <h3 className="text-sm font-bold text-red-400">Zone dangereuse</h3>
                </div>
                <div className="p-6" style={{ background: 'rgba(17,24,39,0.9)' }}>
                  <p className="text-sm text-gray-400 mb-4">
                    La suppression de votre compte est <strong className="text-red-400">irréversible</strong>.
                    Toutes vos données (biens, locataires, paiements, alertes) seront définitivement supprimées.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#EF4444',
                    }}
                  >
                    <Trash2 size={14} />
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ══ MODAL : Changer de plan ══════════════════════════════════════════ */}
      <Modal
        open={showPlanModal}
        onClose={() => { setShowPlanModal(false); setPlanChoisi(null) }}
        title={planChoisi ? `Passer au plan ${planChoisi.label}` : 'Changer de plan'}
      >
        {planChoisi && (
          <div className="space-y-4">
            <div
              className="rounded-xl p-4"
              style={{ background: `${planChoisi.color}10`, border: `1px solid ${planChoisi.color}25` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${planChoisi.color}20` }}>
                  <planChoisi.icon size={20} color={planChoisi.color} />
                </div>
                <div>
                  <p className="font-bold text-white">Plan {planChoisi.label}</p>
                  <p className="text-sm" style={{ color: planChoisi.color }}>{planChoisi.prixLabel}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {planChoisi.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check size={12} color={planChoisi.color} /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {planChoisi.prix > 0 && (
              <div
                className="flex items-start gap-2 rounded-xl p-3 text-xs"
                style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.15)', color: '#FFB800' }}
              >
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                Mode démo — aucun paiement réel ne sera effectué.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowPlanModal(false); setPlanChoisi(null) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Annuler
              </button>
              <button
                onClick={handleChangePlan}
                disabled={changingPlan}
                className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: `linear-gradient(135deg,${planChoisi.color},${planChoisi.color}cc)`,
                  boxShadow: `0 4px 12px ${planChoisi.color}30`,
                }}
              >
                {changingPlan ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {changingPlan ? 'Activation…' : `Activer ${planChoisi.label}`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ MODAL : Supprimer le compte ══════════════════════════════════════ */}
      <Modal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteInput('') }}
        title="Supprimer mon compte"
      >
        <div className="space-y-4">
          <div
            className="flex items-start gap-3 rounded-xl p-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertTriangle size={16} color="#EF4444" className="shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">
              Cette action est <strong>irréversible</strong>. Toutes vos données (biens, locataires, paiements) seront supprimées définitivement.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Tapez <strong className="text-red-400">SUPPRIMER</strong> pour confirmer
            </label>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full rounded-xl text-sm text-white outline-none py-2.5 px-3"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${deleteInput === 'SUPPRIMER' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
              }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowDeleteModal(false); setDeleteInput('') }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteInput !== 'SUPPRIMER' || deleting}
              className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background: deleteInput !== 'SUPPRIMER' || deleting
                  ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.85)',
                cursor: deleteInput !== 'SUPPRIMER' || deleting ? 'not-allowed' : 'pointer',
              }}
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {deleting ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
