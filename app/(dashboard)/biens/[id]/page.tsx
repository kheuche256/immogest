'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight, Pencil, Trash2, MapPin, Home, Users,
  Wallet, ArrowLeft, CalendarDays, Phone, Mail,
  AlertTriangle, CheckCircle, X, Building2, TrendingUp,
} from 'lucide-react'
import { useBiens } from '@/hooks/useBiens'
import { Bien } from '@/types'
import { formatMontant, formatDate } from '@/lib/utils'

// ─── Configs visuelles ────────────────────────────────────────────────────────

const typeLabel: Record<string, string> = {
  appartement: 'Appartement', villa: 'Villa', maison: 'Maison', studio: 'Studio',
  bureau: 'Bureau', commerce: 'Commerce', local_commercial: 'Local commercial',
  immeuble: 'Immeuble', terrain: 'Terrain',
}

const typeEmoji: Record<string, string> = {
  appartement: '🏢', villa: '🏡', maison: '🏠', studio: '🛋️',
  bureau: '🏣', commerce: '🏪', local_commercial: '🏪', immeuble: '🏬', terrain: '🌿',
}

const statutConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  disponible:  { label: 'Disponible',  bg: 'rgba(0,196,140,0.1)',   color: '#00C48C', border: 'rgba(0,196,140,0.3)' },
  loue:        { label: 'Loué',        bg: 'rgba(0,102,255,0.1)',   color: '#4D9FFF', border: 'rgba(0,102,255,0.3)' },
  en_travaux:  { label: 'En travaux',  bg: 'rgba(255,144,0,0.1)',   color: '#FF9000', border: 'rgba(255,144,0,0.3)' },
  maintenance: { label: 'Maintenance', bg: 'rgba(255,144,0,0.1)',   color: '#FF9000', border: 'rgba(255,144,0,0.3)' },
  vendu:       { label: 'Vendu',       bg: 'rgba(100,116,139,0.1)', color: '#94A3B8', border: 'rgba(100,116,139,0.3)' },
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${color ?? '#6B7280'}15` }}>
        <Icon size={15} style={{ color: color ?? '#6B7280' }} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(17,24,39,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: 24,
      }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-white mb-4">{children}</h3>
}

// ─── Modal suppression ────────────────────────────────────────────────────────

function DeleteModal({ nom, onConfirm, onCancel }: { nom: string; onConfirm: () => Promise<void>; onCancel: () => void }) {
  const [loading, setLoading] = useState(false)
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 animate-fadeInUp"
        style={{ background: 'rgba(13,18,35,0.98)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.25)' }}>
          <AlertTriangle size={28} style={{ color: '#FF4444' }} />
        </div>
        <h3 className="text-lg font-bold text-white text-center mb-2">Supprimer ce bien ?</h3>
        <p className="text-sm text-gray-400 text-center mb-1">Vous êtes sur le point de supprimer</p>
        <p className="text-sm font-bold text-center mb-3" style={{ color: '#FF6B6B' }}>« {nom} »</p>
        <p className="text-xs text-gray-500 text-center mb-6 px-4">
          Cette action est irréversible. Toutes les données associées seront supprimées.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-300 transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Annuler
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false) }}
            disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF4444, #FF6B6B)' }}
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            ) : 'Supprimer définitivement'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-48 rounded bg-white/5" />
      <div className="h-32 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-64 rounded-2xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
      <div className="h-48 rounded-2xl bg-white/5" />
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function BienDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { getBien, deleteBien } = useBiens()
  const [bien, setBien] = useState<Bien | null>(null)
  const [fetching, setFetching] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getBien(id)
      if (!data) setNotFound(true)
      else setBien(data)
      setFetching(false)
    }
    if (id) load()
  }, [id, getBien])

  function addToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleDelete() {
    if (!bien) return
    try {
      await deleteBien(bien.id)
      addToast('success', `« ${bien.nom} » supprimé avec succès`)
      setTimeout(() => router.push('/biens'), 1200)
    } catch {
      addToast('error', 'Erreur lors de la suppression')
    } finally {
      setShowDelete(false)
    }
  }

  if (fetching) return <PageSkeleton />

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span className="text-5xl">🏚️</span>
        <p className="text-white font-bold text-lg">Bien introuvable</p>
        <p className="text-gray-500 text-sm">Ce bien n'existe pas ou a été supprimé</p>
        <Link href="/biens" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}>
          Retour aux biens
        </Link>
      </div>
    )
  }

  if (!bien) return null

  const statut = statutConfig[bien.statut] ?? statutConfig.disponible
  const locatairesActifs = bien.locataires?.filter((l: any) => l.statut === 'actif') ?? []
  const locataire = locatairesActifs[0]
  const total = bien.loyer_mensuel + (bien.charges ?? 0)

  return (
    <>
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-fadeInUp"
          style={{
            background: toast.type === 'success' ? 'rgba(0,196,140,0.15)' : 'rgba(255,68,68,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(0,196,140,0.35)' : 'rgba(255,68,68,0.35)'}`,
            backdropFilter: 'blur(12px)',
            minWidth: 260,
          }}
        >
          {toast.type === 'success'
            ? <CheckCircle size={16} style={{ color: '#00C48C' }} />
            : <AlertTriangle size={16} style={{ color: '#FF4444' }} />
          }
          <span className="text-sm text-white">{toast.msg}</span>
        </div>
      )}

      {showDelete && (
        <DeleteModal nom={bien.nom} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
      )}

      <div className="space-y-6 pb-10 max-w-5xl mx-auto">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-sm flex-wrap">
          <Link href="/biens" style={{ color: '#6B7280' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#4D9FFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>
            Mes Biens
          </Link>
          <ChevronRight size={14} style={{ color: '#4B5563' }} />
          <span className="truncate max-w-[200px]" style={{ color: '#D1D5DB' }}>{bien.nom}</span>
        </nav>

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,102,255,0.1) 0%, rgba(0,212,170,0.05) 100%)',
            border: '1px solid rgba(0,102,255,0.15)',
          }}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none opacity-10"
            style={{ background: 'radial-gradient(circle, #0066FF, transparent)' }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Emoji type */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                {typeEmoji[bien.type] ?? '🏠'}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{bien.nom}</h1>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: statut.bg, color: statut.color, border: `1px solid ${statut.border}` }}
                  >
                    {statut.label}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  {typeLabel[bien.type] ?? bien.type}
                  {bien.quartier ? ` · ${bien.quartier}` : ''}
                  {bien.ville ? `, ${bien.ville}` : ''}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/biens/${bien.id}/modifier`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.03]"
                style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.2)' }}
              >
                <Pencil size={15} /> Modifier
              </Link>
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.03]"
                style={{ background: 'rgba(255,68,68,0.1)', color: '#FF4444', border: '1px solid rgba(255,68,68,0.2)' }}
              >
                <Trash2 size={15} /> Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* ── Grille principale ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Infos du bien — span 2 */}
          <Card className="lg:col-span-2">
            <SectionTitle>📋 Informations du bien</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Building2} label="Type" value={typeLabel[bien.type] ?? bien.type} color="#4D9FFF" />
              {bien.adresse && <InfoRow icon={MapPin} label="Adresse" value={bien.adresse} color="#00C48C" />}
              {bien.quartier && <InfoRow icon={MapPin} label="Quartier" value={bien.quartier} color="#00C48C" />}
              {bien.ville && <InfoRow icon={Home} label="Ville" value={bien.ville} color="#9370DB" />}
              {bien.nb_unites && bien.nb_unites > 1 && (
                <InfoRow icon={Building2} label="Unités" value={`${bien.nb_unites} unités`} color="#FF9000" />
              )}
              {bien.created_at && <InfoRow icon={CalendarDays} label="Ajouté le" value={formatDate(bien.created_at)} color="#6B7280" />}
            </div>

            {bien.description && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-gray-300 leading-relaxed">{bien.description}</p>
              </div>
            )}
          </Card>

          {/* Finances */}
          <Card>
            <SectionTitle>💰 Finances</SectionTitle>
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl"
                style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)' }}
              >
                <p className="text-xs text-gray-500 mb-1">Loyer mensuel</p>
                <p className="text-2xl font-bold" style={{ color: '#FFB800' }}>
                  {formatMontant(bien.loyer_mensuel)}
                </p>
              </div>

              {bien.charges && bien.charges > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Charges</span>
                  <span className="text-gray-300 font-medium">{formatMontant(bien.charges)}</span>
                </div>
              )}

              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-sm text-gray-400 font-medium">Total mensuel</span>
                <span className="text-base font-bold text-white">{formatMontant(total)}</span>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(0,102,255,0.06)', border: '1px solid rgba(0,102,255,0.12)' }}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} style={{ color: '#4D9FFF' }} />
                  <span className="text-xs text-gray-400">Revenu annuel</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#4D9FFF' }}>
                  {formatMontant(total * 12)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Locataire ───────────────────────────────────────────────────── */}
        <Card>
          <SectionTitle>👤 Locataire</SectionTitle>

          {locataire ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.5), rgba(0,212,170,0.3))' }}
                >
                  {locataire.prenom?.[0]}{locataire.nom?.[0]}
                </div>
                <div>
                  <p className="text-base font-bold text-white">
                    {locataire.prenom} {locataire.nom}
                  </p>
                  <p className="text-sm text-gray-400">{locataire.profession ?? 'Locataire actif'}</p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {locataire.telephone && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Phone size={12} />{locataire.telephone}
                      </span>
                    )}
                    {locataire.email && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Mail size={12} />{locataire.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(0,196,140,0.1)', color: '#00C48C', border: '1px solid rgba(0,196,140,0.25)' }}
                >
                  ● Actif
                </span>
                {locataire.date_entree && (
                  <p className="text-xs text-gray-500">
                    Depuis le {formatDate(locataire.date_entree)}
                  </p>
                )}
                <Link
                  href={`/locataires/${locataire.id}`}
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#4D9FFF' }}
                >
                  Voir le profil →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(100,116,139,0.1)' }}
                >
                  <Users size={20} style={{ color: '#64748B' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400">Bien vacant</p>
                  <p className="text-xs text-gray-600">Aucun locataire assigné à ce bien</p>
                </div>
              </div>
              <Link
                href="/locataires/nouveau"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-[1.02] transition-transform shrink-0"
                style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}
              >
                <Users size={15} /> Assigner un locataire
              </Link>
            </div>
          )}
        </Card>

        {/* ── Historique paiements ─────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>💳 Historique des paiements</SectionTitle>
            <Link
              href={`/paiements?bien=${bien.id}`}
              className="text-xs font-medium transition-colors"
              style={{ color: '#0066FF' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#00D4AA')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#0066FF')}
            >
              Voir tout →
            </Link>
          </div>

          {/* Si aucun paiement lié (pas encore rechargés) */}
          <div className="flex flex-col items-center py-8 gap-3">
            <span className="text-3xl">💳</span>
            <p className="text-sm text-gray-500 text-center">
              L'historique des paiements sera disponible depuis la section Paiements
            </p>
            <Link
              href="/paiements"
              className="text-xs font-medium px-4 py-2 rounded-lg transition-all"
              style={{ background: 'rgba(0,102,255,0.1)', color: '#4D9FFF', border: '1px solid rgba(0,102,255,0.2)' }}
            >
              Aller aux paiements
            </Link>
          </div>
        </Card>

        {/* ── Bouton retour ────────────────────────────────────────────────── */}
        <button
          onClick={() => router.push('/biens')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Retour à la liste des biens
        </button>

      </div>
    </>
  )
}
