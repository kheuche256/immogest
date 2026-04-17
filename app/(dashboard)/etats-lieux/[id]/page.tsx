'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEtatsLieux } from '@/hooks/useEtatsLieux'
import {
  ArrowLeft,
  LogIn,
  LogOut,
  Home,
  User,
  CalendarDays,
  Zap,
  Droplets,
  Star,
  AlertTriangle,
  FileText,
  PenLine,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Loader2,
  Check,
  X,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

// ── Config ─────────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  entree: { icon: LogIn,  color: '#22C55E', bg: '#F0FDF4', label: "État d'entrée" },
  sortie: { icon: LogOut, color: '#DC2626', bg: '#FEF2F2', label: "État de sortie" },
}

const ETAT_GENERAL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  excellent: { color: '#22C55E', bg: '#F0FDF4', label: 'Excellent' },
  bon:       { color: '#556B2F', bg: '#F0F5E8', label: 'Bon'       },
  moyen:     { color: '#F59E0B', bg: '#FEF3C7', label: 'Moyen'     },
  mauvais:   { color: '#DC2626', bg: '#FEF2F2', label: 'Mauvais'   },
}

const PROPRETE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  impeccable:  { color: '#22C55E', bg: '#F0FDF4', label: 'Impeccable'  },
  propre:      { color: '#556B2F', bg: '#F0F5E8', label: 'Propre'      },
  a_nettoyer:  { color: '#F59E0B', bg: '#FEF3C7', label: 'À nettoyer'  },
  sale:        { color: '#DC2626', bg: '#FEF2F2', label: 'Sale'         },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function InfoRow({ icon: Icon, label, value, iconColor }: {
  icon: React.ElementType; label: string; value: React.ReactNode; iconColor?: string
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0" style={{ borderColor: '#F9F3EC' }}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: iconColor ?? '#8B7355' }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: '#8B7355' }}>{label}</p>
        <div className="text-sm font-medium" style={{ color: '#5D3A1A' }}>{value}</div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DetailEtatLieuxPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const { etatsLieux, isLoading, signerEtatLieux, deleteEtatLieux } = useEtatsLieux()

  const [signing,    setSigning]    = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const etat = etatsLieux.find(e => e.id === id)

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B4513' }} />
      </div>
    )
  }

  if (!etat) {
    return (
      <div className="text-center py-24">
        <p className="text-lg font-bold mb-2" style={{ color: '#5D3A1A' }}>État des lieux introuvable</p>
        <Link href="/etats-lieux" className="text-sm underline" style={{ color: '#8B4513' }}>
          Retour à la liste
        </Link>
      </div>
    )
  }

  const cfg      = TYPE_CONFIG[etat.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.entree
  const TypeIcon = cfg.icon
  const signed   = etat.signe_proprietaire && etat.signe_locataire

  // ── Signer ─────────────────────────────────────────────────────────────────
  const handleSign = async (qui: 'proprietaire' | 'locataire') => {
    setSigning(qui)
    const { error } = await signerEtatLieux(etat.id, qui)
    setSigning(null)
    if (error) toast.error('Erreur lors de la signature')
    else       toast.success('Signature enregistrée !')
  }

  // ── Supprimer ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await deleteEtatLieux(etat.id)
    setDeleting(false)
    if (error) {
      toast.error('Erreur lors de la suppression')
    } else {
      toast.success('État des lieux supprimé')
      router.push('/etats-lieux')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Link
          href="/etats-lieux"
          className="p-2 rounded-xl transition-all hover:bg-amber-50 mt-1"
          style={{ color: '#8B7355' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              <TypeIcon className="w-3.5 h-3.5 inline mr-1" />
              {cfg.label}
            </span>
            {signed ? (
              <span className="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                style={{ backgroundColor: '#F0F5E8', color: '#556B2F' }}>
                <CheckCircle className="w-3 h-3" /> Signé
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
                <Clock className="w-3 h-3" /> En attente de signature
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold mt-1" style={{ color: '#5D3A1A' }}>
            {etat.bien?.nom ?? '—'}
          </h1>
          <p className="text-sm capitalize" style={{ color: '#8B7355' }}>
            {fmtDate(etat.date_etat)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/etats-lieux/${etat.id}/modifier`}
            className="p-2 rounded-xl transition-all hover:bg-amber-50"
            style={{ color: '#8B7355' }}
          >
            <Edit className="w-5 h-5" />
          </Link>
          {confirmDel ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-xl text-white transition-all"
                style={{ backgroundColor: '#DC2626' }}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                className="p-2 rounded-xl"
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              className="p-2 rounded-xl transition-all hover:bg-red-50"
              style={{ color: '#DC2626' }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Carte principale ── */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#F0E6D8' }}>

        {/* Bannière type */}
        <div className="px-5 py-4" style={{ backgroundColor: cfg.bg }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${cfg.color}20` }}>
              <TypeIcon className="w-5 h-5" style={{ color: cfg.color }} />
            </div>
            <div>
              <p className="font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
              <p className="text-xs" style={{ color: '#8B7355' }}>
                {etat.bien?.adresse ?? ''}{etat.bien?.ville ? `, ${etat.bien.ville}` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-0">
          <InfoRow icon={Home}        label="Bien"       value={etat.bien?.nom ?? '—'} />
          <InfoRow icon={User}        label="Locataire"  value={etat.locataire?.nom ?? '—'} />
          <InfoRow icon={CalendarDays} label="Date"      value={fmtDate(etat.date_etat)} />

          {/* État général */}
          {etat.etat_general && (() => {
            const c = ETAT_GENERAL_CONFIG[etat.etat_general!]
            return (
              <InfoRow icon={Star} label="État général" value={
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: c.bg, color: c.color }}>
                  {c.label}
                </span>
              } />
            )
          })()}

          {/* Propreté */}
          {etat.proprete && (() => {
            const c = PROPRETE_CONFIG[etat.proprete!]
            return (
              <InfoRow icon={Star} label="Propreté" value={
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: c.bg, color: c.color }}>
                  {c.label}
                </span>
              } />
            )
          })()}
        </div>
      </div>

      {/* ── Relevés compteurs ── */}
      {(etat.releve_electricite != null || etat.releve_eau != null) && (
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0E6D8' }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: '#5D3A1A' }}>Relevés des compteurs</h3>
          <div className="grid grid-cols-2 gap-4">
            {etat.releve_electricite != null && (
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#FFFBEB' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                  <Zap className="w-5 h-5" style={{ color: '#DAA520' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8B7355' }}>Électricité</p>
                  <p className="text-xl font-bold" style={{ color: '#5D3A1A' }}>
                    {etat.releve_electricite.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs" style={{ color: '#8B7355' }}>kWh</p>
                </div>
              </div>
            )}
            {etat.releve_eau != null && (
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#EFF6FF' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                  <Droplets className="w-5 h-5" style={{ color: '#0EA5E9' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#8B7355' }}>Eau</p>
                  <p className="text-xl font-bold" style={{ color: '#5D3A1A' }}>
                    {etat.releve_eau.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs" style={{ color: '#8B7355' }}>m³</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Observations ── */}
      {etat.observations && (
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0E6D8' }}>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4" style={{ color: '#8B4513' }} />
            <h3 className="font-bold text-sm" style={{ color: '#5D3A1A' }}>Observations</h3>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#5D3A1A' }}>
            {etat.observations}
          </p>
        </div>
      )}

      {/* ── Anomalies ── */}
      {etat.anomalies && (
        <div className="rounded-2xl border p-5" style={{ backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} />
            <h3 className="font-bold text-sm" style={{ color: '#92400E' }}>Anomalies constatées</h3>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#92400E' }}>
            {etat.anomalies}
          </p>
        </div>
      )}

      {/* ── Signatures ── */}
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0E6D8' }}>
        <div className="flex items-center gap-2 mb-4">
          <PenLine className="w-4 h-4" style={{ color: '#8B4513' }} />
          <h3 className="font-bold text-sm" style={{ color: '#5D3A1A' }}>Signatures</h3>
          {signed && etat.date_signature && (
            <span className="ml-auto text-xs" style={{ color: '#8B7355' }}>
              Signé le {new Date(etat.date_signature).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            { key: 'signe_proprietaire' as const, label: 'Propriétaire', qui: 'proprietaire' as const },
            { key: 'signe_locataire'    as const, label: etat.locataire?.nom ?? 'Locataire', qui: 'locataire' as const },
          ]).map(sig => {
            const hasSigned = etat[sig.key]
            const isSigningNow = signing === sig.qui

            return (
              <div
                key={sig.key}
                className="rounded-xl border-2 p-4"
                style={{
                  borderColor:     hasSigned ? '#556B2F' : '#F0E6D8',
                  backgroundColor: hasSigned ? '#F0F5E8' : '#FAFAFA',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {hasSigned
                      ? <CheckCircle className="w-5 h-5" style={{ color: '#556B2F' }} />
                      : <Clock       className="w-5 h-5" style={{ color: '#C4A882' }} />
                    }
                    <div>
                      <p className="text-sm font-semibold" style={{ color: hasSigned ? '#556B2F' : '#5D3A1A' }}>
                        {sig.label}
                      </p>
                      <p className="text-xs" style={{ color: '#8B7355' }}>
                        {hasSigned ? 'A signé' : 'En attente'}
                      </p>
                    </div>
                  </div>
                  {!hasSigned && (
                    <button
                      onClick={() => handleSign(sig.qui)}
                      disabled={!!signing}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                      style={{ backgroundColor: '#8B4513' }}
                    >
                      {isSigningNow
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <PenLine className="w-3 h-3" />
                      }
                      Signer
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex gap-3 pb-8">
        <Link
          href="/etats-lieux"
          className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold text-center transition-all hover:bg-amber-50"
          style={{ borderColor: '#F0E6D8', color: '#8B7355' }}
        >
          Retour à la liste
        </Link>
        <Link
          href={`/etats-lieux/${etat.id}/modifier`}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: '#8B4513' }}
        >
          <Edit className="w-4 h-4" />
          Modifier
        </Link>
      </div>
    </div>
  )
}
