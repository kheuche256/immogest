'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight, Pencil, Trash2, Phone, Mail, CreditCard,
  Briefcase, MapPin, Home, CalendarDays, Wallet,
  MessageCircle, FileText, ArrowLeft, AlertTriangle,
  CheckCircle, X, Clock, RefreshCw, Shield,
} from 'lucide-react'
import { useLocataires } from '@/hooks/useLocataires'
import { useBiens } from '@/hooks/useBiens'
import { Locataire, Bien } from '@/types'
import { formatMontant, formatDate } from '@/lib/utils'

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
]
function getAvatarColor(nom: string) { return AVATAR_COLORS[nom.charCodeAt(0) % AVATAR_COLORS.length] }
function getInitiales(prenom: string, nom: string) { return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase() }

// ─── Statut configs ────────────────────────────────────────────────────────────

const statutConfig = {
  actif:      { label: 'Actif',      bg: 'rgba(0,196,140,0.1)',   color: '#00C48C', border: 'rgba(0,196,140,0.3)' },
  inactif:    { label: 'Inactif',    bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: 'rgba(100,116,139,0.3)' },
  parti:      { label: 'Parti',      bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: 'rgba(100,116,139,0.3)' },
  en_attente: { label: 'En attente', bg: 'rgba(255,184,0,0.1)',   color: '#FFB800', border: 'rgba(255,184,0,0.3)' },
  en_retard:  { label: 'En retard',  bg: 'rgba(255,68,68,0.1)',   color: '#FF4444', border: 'rgba(255,68,68,0.3)' },
} as const

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{
      background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-white">{children}</h3>
      {action}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, href, color = '#6B7280' }: {
  icon: React.ElementType; label: string; value: string; href?: string; color?: string
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${color}15` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm font-semibold mt-0.5" style={{ color: href ? color : '#F9FAFB' }}>{value}</p>
      </div>
    </div>
  )
  if (href) return <a href={href} className="hover:opacity-80 transition-opacity">{content}</a>
  return content
}

// ─── Modal suppression ────────────────────────────────────────────────────────

function DeleteModal({ nom, onConfirm, onCancel }: {
  nom: string; onConfirm: () => Promise<void>; onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-fadeInUp"
        style={{ background: 'rgba(13,18,35,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.25)' }}>
          <AlertTriangle size={28} style={{ color: '#FF4444' }} />
        </div>
        <h3 className="text-lg font-bold text-white text-center mb-2">Supprimer {nom} ?</h3>
        <p className="text-xs text-gray-500 text-center mb-6 px-4">
          Cette action est irréversible. L'historique des paiements sera supprimé et le logement redeviendra disponible.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-300 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Annuler
          </button>
          <button onClick={async () => { setLoading(true); await onConfirm(); setLoading(false) }}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF4444, #FF6B6B)' }}>
            {loading
              ? <span className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal assignation bien ───────────────────────────────────────────────────

function AssignBienModal({ biens, onAssign, onCancel }: {
  biens: Bien[]; onAssign: (bienId: string) => Promise<void>; onCancel: () => void
}) {
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const disponibles = biens.filter((b) => b.statut === 'disponible')

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-fadeInUp"
        style={{ background: 'rgba(13,18,35,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-2">Assigner un logement</h3>
        <p className="text-sm text-gray-500 mb-5">Choisissez un bien disponible pour ce locataire</p>

        {disponibles.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">Aucun bien disponible pour l'instant</p>
            <Link href="/biens/nouveau" className="text-xs mt-2 inline-block" style={{ color: '#4D9FFF' }}>
              + Ajouter un bien
            </Link>
          </div>
        ) : (
          <div className="space-y-2 mb-5 max-h-56 overflow-y-auto">
            {disponibles.map((b) => (
              <button key={b.id} onClick={() => setSelected(b.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                style={{
                  background: selected === b.id ? 'rgba(0,102,255,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selected === b.id ? 'rgba(0,102,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                <span className="text-xl">🏠</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{b.nom}</p>
                  <p className="text-xs text-gray-400">{[b.quartier, b.ville].filter(Boolean).join(', ')}</p>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: '#FFB800' }}>
                  {formatMontant(b.loyer_mensuel)}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-300"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Annuler
          </button>
          <button
            onClick={async () => { if (!selected) return; setLoading(true); await onAssign(selected); setLoading(false) }}
            disabled={!selected || loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}>
            {loading
              ? <span className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              : 'Assigner'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
      <div className="h-4 w-48 rounded bg-white/5" />
      <div className="h-40 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="h-52 rounded-2xl bg-white/5" />
        <div className="lg:col-span-2 h-52 rounded-2xl bg-white/5" />
      </div>
      <div className="h-52 rounded-2xl bg-white/5" />
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function LocataireDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id     = params.id as string

  const { getLocataire, deleteLocataire, assignBien } = useLocataires()
  const { biens } = useBiens()

  const [locataire,   setLocataire]   = useState<Locataire | null>(null)
  const [fetching,    setFetching]    = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [showDelete,  setShowDelete]  = useState(false)
  const [showAssign,  setShowAssign]  = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getLocataire(id)
      if (!data) setNotFound(true)
      else setLocataire(data)
      setFetching(false)
    }
    if (id) load()
  }, [id, getLocataire])

  function addToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleDelete() {
    if (!locataire) return
    try {
      await deleteLocataire(locataire.id)
      addToast('success', 'Locataire supprimé avec succès')
      setTimeout(() => router.push('/locataires'), 1200)
    } catch { addToast('error', 'Erreur lors de la suppression') }
    setShowDelete(false)
  }

  async function handleAssign(bienId: string) {
    if (!locataire) return
    try {
      await assignBien(locataire.id, bienId)
      const data = await getLocataire(id)
      if (data) setLocataire(data)
      addToast('success', 'Logement assigné avec succès !')
    } catch { addToast('error', 'Erreur lors de l\'assignation') }
    setShowAssign(false)
  }

  if (fetching) return <PageSkeleton />

  if (notFound) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span className="text-5xl">👤</span>
      <p className="text-white font-bold text-lg">Locataire introuvable</p>
      <Link href="/locataires" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}>
        Retour aux locataires
      </Link>
    </div>
  )

  if (!locataire) return null

  const fullName    = locataire.prenom ? `${locataire.prenom} ${locataire.nom}` : locataire.nom
  const avatarColor = getAvatarColor(locataire.nom)
  const initiales   = getInitiales(locataire.prenom ?? '', locataire.nom)
  const cfg         = statutConfig[locataire.statut as keyof typeof statutConfig] ?? statutConfig.inactif
  const bien        = locataire.bien as Bien | undefined
  const tel         = locataire.telephone.replace(/\s/g, '')
  const waLink      = `https://wa.me/221${tel}?text=${encodeURIComponent(`Bonjour ${locataire.prenom ?? locataire.nom}, c'est ImmoGest.`)}`
  const paiements   = locataire.paiements ?? []

  // Jours restants contrat
  const dateFinRef  = locataire.date_fin_contrat
  const joursRestants = dateFinRef
    ? Math.ceil((new Date(dateFinRef).getTime() - Date.now()) / 86_400_000)
    : null

  return (
    <>
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-fadeInUp"
          style={{
            background: toast.type === 'success' ? 'rgba(0,196,140,0.15)' : 'rgba(255,68,68,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(0,196,140,0.35)' : 'rgba(255,68,68,0.35)'}`,
            backdropFilter: 'blur(12px)', minWidth: 260,
          }}>
          {toast.type === 'success'
            ? <CheckCircle size={16} style={{ color: '#00C48C' }} />
            : <AlertTriangle size={16} style={{ color: '#FF4444' }} />}
          <span className="text-sm text-white">{toast.msg}</span>
        </div>
      )}

      {showDelete && <DeleteModal nom={fullName} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
      {showAssign && <AssignBienModal biens={biens} onAssign={handleAssign} onCancel={() => setShowAssign(false)} />}

      <div className="space-y-5 pb-10 max-w-5xl mx-auto">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-sm flex-wrap">
          <Link href="/locataires" style={{ color: '#6B7280' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#4D9FFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>
            Locataires
          </Link>
          <ChevronRight size={14} style={{ color: '#4B5563' }} />
          <span className="truncate max-w-[200px]" style={{ color: '#D1D5DB' }}>{fullName}</span>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${avatarColor}14 0%, rgba(0,212,170,0.05) 100%)`,
            border: `1px solid ${avatarColor}25`,
          }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none opacity-10"
            style={{ background: `radial-gradient(circle, ${avatarColor}, transparent)` }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* Avatar + Infos */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
                style={{ background: `${avatarColor}CC`, boxShadow: `0 8px 24px ${avatarColor}40` }}>
                {initiales}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{fullName}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    {cfg.label}
                  </span>
                  {locataire.statut === 'en_retard' ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(255,68,68,0.1)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.25)' }}>
                      ⚠ En retard
                    </span>
                  ) : locataire.statut === 'actif' && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(0,196,140,0.1)', color: '#00C48C', border: '1px solid rgba(0,196,140,0.25)' }}>
                      ✓ À jour
                    </span>
                  )}
                  {locataire.profession && (
                    <span className="text-xs text-gray-400">{locataire.profession}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <Link href={`/locataires/${locataire.id}/modifier`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:scale-[1.03] transition-all"
                style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.2)' }}>
                <Pencil size={15} /> Modifier
              </Link>
              <a href={waLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:scale-[1.03] transition-all"
                style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366', border: '1px solid rgba(37,211,102,0.2)' }}>
                <MessageCircle size={15} /> WhatsApp
              </a>
              <button onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:scale-[1.03] transition-all"
                style={{ background: 'rgba(255,68,68,0.1)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.2)' }}>
                <Trash2 size={15} /> Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* ── Grille Contact + Logement ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Contact */}
          <Card>
            <SectionTitle>📞 Contact</SectionTitle>
            <div className="space-y-4">
              <InfoRow icon={Phone} label="Téléphone" value={locataire.telephone}
                href={`tel:${locataire.telephone}`} color="#10B981" />
              {locataire.email && (
                <InfoRow icon={Mail} label="Email" value={locataire.email}
                  href={`mailto:${locataire.email}`} color="#4D9FFF" />
              )}
              {locataire.cni && (
                <InfoRow icon={CreditCard} label="CNI" value={locataire.cni} color="#9370DB" />
              )}
              {locataire.profession && (
                <InfoRow icon={Briefcase} label="Profession" value={locataire.profession} color="#FFB800" />
              )}
            </div>
          </Card>

          {/* Logement */}
          <Card className="lg:col-span-2">
            <SectionTitle action={bien ? (
              <Link href={`/biens/${bien.id}`} className="text-xs font-medium transition-colors"
                style={{ color: '#0066FF' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#00D4AA')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#0066FF')}>
                Voir le bien →
              </Link>
            ) : undefined}>🏠 Logement</SectionTitle>

            {bien ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.12)' }}>
                  <span className="text-2xl">🏠</span>
                  <div>
                    <p className="text-base font-bold text-white">{(bien as any).nom}</p>
                    <p className="text-xs text-gray-400">{[(bien as any).quartier, (bien as any).ville].filter(Boolean).join(', ')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.12)' }}>
                    <p className="text-xs text-gray-500 mb-1">Loyer</p>
                    <p className="text-base font-bold" style={{ color: '#FFB800' }}>{formatMontant((bien as any).loyer_mensuel)}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs text-gray-500 mb-1">Total (+ charges)</p>
                    <p className="text-base font-bold text-white">
                      {formatMontant((bien as any).loyer_mensuel + ((bien as any).charges ?? 0))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  {locataire.date_entree && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <CalendarDays size={14} style={{ color: '#6B7280' }} />
                      <div>
                        <p className="text-xs text-gray-600">Entrée</p>
                        <p className="font-medium text-gray-300">{formatDate(locataire.date_entree)}</p>
                      </div>
                    </div>
                  )}
                  {dateFinRef && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: joursRestants !== null && joursRestants <= 30 ? '#FF9000' : '#6B7280' }} />
                      <div>
                        <p className="text-xs text-gray-600">Fin contrat</p>
                        <p className="font-medium" style={{ color: joursRestants !== null && joursRestants <= 0 ? '#FF4444' : joursRestants !== null && joursRestants <= 30 ? '#FF9000' : '#D1D5DB' }}>
                          {formatDate(dateFinRef)}
                          {joursRestants !== null && (
                            <span className="ml-1 text-xs">
                              ({joursRestants > 0 ? `${joursRestants}j restants` : 'Expiré'})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  {locataire.depot_garantie > 0 && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Shield size={14} style={{ color: '#9370DB' }} />
                      <div>
                        <p className="text-xs text-gray-600">Dépôt garantie</p>
                        <p className="font-medium text-gray-300">
                          {formatMontant(locataire.depot_garantie)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 gap-3 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(100,116,139,0.1)' }}>
                  <Home size={20} style={{ color: '#64748B' }} />
                </div>
                <p className="text-sm font-semibold text-gray-400">Aucun logement assigné</p>
                <p className="text-xs text-gray-600">Ce locataire n'est associé à aucun bien</p>
                <button onClick={() => setShowAssign(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-[1.02] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}>
                  <Home size={15} /> Assigner un logement
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* ── Historique paiements ─────────────────────────────────────────── */}
        <Card>
          <SectionTitle action={
            <Link href={`/paiements/nouveau?locataire=${locataire.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:scale-[1.02] transition-transform"
              style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}>
              + Enregistrer un paiement
            </Link>
          }>💳 Historique des paiements</SectionTitle>

          {paiements.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <span className="text-3xl">💳</span>
              <p className="text-sm text-gray-500">Aucun paiement enregistré pour ce locataire</p>
              <Link href={`/paiements/nouveau?locataire=${locataire.id}`}
                className="text-xs font-medium px-4 py-2 rounded-lg"
                style={{ background: 'rgba(0,102,255,0.1)', color: '#4D9FFF', border: '1px solid rgba(0,102,255,0.2)' }}>
                Enregistrer le premier paiement
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Mois', 'Montant', 'Date paiement', 'Statut'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: '#6B7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paiements.slice(0, 6).map((p: any) => {
                    const pStatutMap: Record<string, { label: string; color: string; bg: string }> = {
                      paye:       { label: 'Payé',       color: '#00C48C', bg: 'rgba(0,196,140,0.1)' },
                      en_attente: { label: 'En attente', color: '#FFB800', bg: 'rgba(255,184,0,0.1)' },
                      en_retard:  { label: 'Retard',     color: '#FF4444', bg: 'rgba(255,68,68,0.1)' },
                      partiel:    { label: 'Partiel',    color: '#9370DB', bg: 'rgba(147,112,219,0.1)' },
                      annule:     { label: 'Annulé',     color: '#94A3B8', bg: 'rgba(100,116,139,0.1)' },
                    }
                    const sCfg = pStatutMap[p.statut] ?? { label: p.statut, color: '#94A3B8', bg: 'rgba(100,116,139,0.1)' }
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="px-3 py-3 text-sm text-gray-300 font-medium">{p.mois}</td>
                        <td className="px-3 py-3 text-sm font-bold text-white">{formatMontant(p.montant)}</td>
                        <td className="px-3 py-3 text-sm text-gray-400">
                          {p.date_paiement ? formatDate(p.date_paiement) : '—'}
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: sCfg.bg, color: sCfg.color }}>
                            {sCfg.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ── Actions rapides ──────────────────────────────────────────────── */}
        <Card>
          <SectionTitle>⚡ Actions rapides</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: FileText, label: 'Générer quittance', color: '#9370DB',
                onClick: () => router.push(`/quittances/nouveau?locataire=${locataire.id}`),
              },
              {
                icon: MessageCircle, label: 'Rappel WhatsApp', color: '#25D366',
                onClick: () => window.open(
                  `https://wa.me/221${tel}?text=${encodeURIComponent(`Bonjour ${locataire.prenom ?? locataire.nom}, votre loyer du mois est dû. Merci de régulariser au plus vite. — ImmoGest`)}`,
                  '_blank'
                ),
              },
              {
                icon: RefreshCw, label: 'Renouveler contrat', color: '#4D9FFF',
                onClick: () => router.push(`/locataires/${locataire.id}/modifier`),
              },
            ].map(({ icon: Icon, label, color, onClick }) => (
              <button key={label} onClick={onClick}
                className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] text-left"
                style={{ background: `${color}0D`, border: `1px solid ${color}20` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${color}40`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${color}20`)}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}15` }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <span className="text-sm font-semibold" style={{ color }}>{label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* ── Bouton retour ────────────────────────────────────────────────── */}
        <button onClick={() => router.push('/locataires')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Retour à la liste des locataires
        </button>

      </div>
    </>
  )
}
