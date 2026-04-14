'use client'

import { Check, Trash2, AlertTriangle, FileWarning, Wrench, ExternalLink } from 'lucide-react'
import { Alerte } from '@/hooks/useAlertes'
import { useRouter } from 'next/navigation'

interface AlerteCardProps {
  alerte: Alerte
  onMarquerLue: (id: string) => void
  onDelete: (id: string) => void
}

// ─── Config par priorité ──────────────────────────────────────────────────────
const PRIORITE_CONFIG = {
  urgente: { color: '#ef4444', label: 'Urgente', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  haute:   { color: '#f97316', label: 'Haute',   bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.25)' },
  normale: { color: '#0066FF', label: 'Normale', bg: 'rgba(0,102,255,0.08)', border: 'rgba(0,102,255,0.2)' },
  basse:   { color: '#6b7280', label: 'Basse',   bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)' },
}

// ─── Config par type ──────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  retard_paiement: { label: 'Retard de paiement', emoji: '💸', Icon: AlertTriangle },
  contrat_expire:  { label: 'Contrat expirant',   emoji: '📋', Icon: FileWarning },
  maintenance:     { label: 'Maintenance',         emoji: '🔧', Icon: Wrench },
}

// ─── Formatage date relative ──────────────────────────────────────────────────
function formatDateRelative(date: string): string {
  const now = new Date()
  const alerteDate = new Date(date)
  const diffMs = now.getTime() - alerteDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHeures = Math.floor(diffMs / 3600000)
  const diffJours = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHeures < 24) return `Il y a ${diffHeures}h`
  if (diffJours === 1) return 'Hier'
  if (diffJours < 7) return `Il y a ${diffJours} jours`
  return alerteDate.toLocaleDateString('fr-FR')
}

// ─── Composant ────────────────────────────────────────────────────────────────
export default function AlerteCard({ alerte, onMarquerLue, onDelete }: AlerteCardProps) {
  const router = useRouter()
  const pConfig = PRIORITE_CONFIG[alerte.priorite] ?? PRIORITE_CONFIG.normale
  const tConfig = TYPE_CONFIG[alerte.type] ?? TYPE_CONFIG.maintenance
  const { Icon } = tConfig

  return (
    <div
      className="relative flex gap-4 rounded-2xl p-4 transition-all duration-200"
      style={{
        background: alerte.lue
          ? 'rgba(17,24,39,0.5)'
          : pConfig.bg,
        border: `1px solid ${alerte.lue ? 'rgba(255,255,255,0.05)' : pConfig.border}`,
        opacity: alerte.lue ? 0.65 : 1,
      }}
    >
      {/* Barre gauche colorée */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
        style={{ background: alerte.lue ? 'rgba(255,255,255,0.1)' : pConfig.color }}
      />

      {/* Icône type */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-2"
        style={{ background: alerte.lue ? 'rgba(255,255,255,0.05)' : `${pConfig.color}18` }}
      >
        <Icon size={18} color={alerte.lue ? '#6b7280' : pConfig.color} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-semibold ${alerte.lue ? 'text-gray-400' : 'text-white'}`}>
              {alerte.titre}
            </h4>
            {/* Badge priorité */}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: alerte.lue ? 'rgba(255,255,255,0.05)' : `${pConfig.color}18`,
                color: alerte.lue ? '#6b7280' : pConfig.color,
                border: `1px solid ${alerte.lue ? 'rgba(255,255,255,0.07)' : `${pConfig.color}30`}`,
              }}
            >
              {pConfig.label}
            </span>
            {/* Badge non lue */}
            {!alerte.lue && (
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: pConfig.color }} />
            )}
          </div>
          {/* Date */}
          <span className="text-xs text-gray-600 whitespace-nowrap shrink-0">
            {formatDateRelative(alerte.created_at)}
          </span>
        </div>

        {/* Message */}
        {alerte.message && (
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{alerte.message}</p>
        )}

        {/* Liens */}
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280' }}
          >
            {tConfig.emoji} {tConfig.label}
          </span>

          {alerte.locataire && (
            <button
              onClick={() => router.push(`/locataires/${alerte.locataire_id}`)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink size={11} />
              {alerte.locataire.prenom} {alerte.locataire.nom}
            </button>
          )}

          {alerte.bien && (
            <button
              onClick={() => router.push(`/biens/${alerte.bien_id}`)}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ExternalLink size={11} />
              {alerte.bien.nom}
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-start gap-1 shrink-0">
        {!alerte.lue && (
          <button
            onClick={() => onMarquerLue(alerte.id)}
            title="Marquer comme lu"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(0,196,140,0.1)', color: '#00C48C', border: '1px solid rgba(0,196,140,0.2)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,196,140,0.25)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,196,140,0.1)' }}
          >
            <Check size={13} />
          </button>
        )}
        <button
          onClick={() => onDelete(alerte.id)}
          title="Supprimer"
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
