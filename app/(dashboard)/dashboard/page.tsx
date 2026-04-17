'use client'

import { useProfile } from '@/hooks/useProfile'
import { useBiens } from '@/hooks/useBiens'
import { useLocataires } from '@/hooks/useLocataires'
import { usePaiements } from '@/hooks/usePaiements'
import { useAlertes } from '@/hooks/useAlertes'
import {
  Building2,
  Users,
  Wallet,
  AlertTriangle,
  Home,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { profile } = useProfile()
  const { biens, stats: bienStats } = useBiens()
  const { locataires, stats: locataireStats } = useLocataires()
  const { paiements, stats: paiementStats } = usePaiements()
  const { alertes, stats: alerteStats } = useAlertes()

  const prenom = profile?.nom?.split(' ')[0] || 'Utilisateur'

  // ── Stats depuis les hooks ─────────────────────────────────────────────────
  const totalBiens      = bienStats.total
  const biensLoues      = bienStats.loues
  const tauxOccupation  = bienStats.taux_occupation
  const locatairesActifs = locataireStats?.actifs || 0
  const paiementsRetard  = paiementStats?.retards || 0
  const montantRetards   = paiementStats?.montantRetards || 0
  const alertesNonLues   = alerteStats?.nonLues || 0

  // Revenus du mois en cours
  const moisActuel   = new Date().toISOString().slice(0, 7)
  const paiementsMois = paiements?.filter((p) => p.mois === moisActuel) || []
  const revenusMois   = paiementsMois
    .filter((p) => p.statut === 'payé')
    .reduce((sum, p) => sum + p.montant, 0)

  const statsCards = [
    {
      title:    'Total Biens',
      value:    totalBiens,
      subtitle: `${tauxOccupation}% occupés`,
      detail:   biensLoues > 0 ? `${biensLoues} loué${biensLoues > 1 ? 's' : ''}` : null,
      icon:     Building2,
      color:    '#8B4513',
      bg:       '#FFF5EB',
      href:     '/biens',
    },
    {
      title:    'Locataires',
      value:    locatairesActifs,
      subtitle: 'actifs',
      detail:   `sur ${locataires?.length || 0} au total`,
      icon:     Users,
      color:    '#556B2F',
      bg:       '#F0F5E8',
      href:     '/locataires',
    },
    {
      title:    'Revenus du mois',
      value:    revenusMois > 0 ? `${(revenusMois / 1000).toFixed(0)}K` : '0',
      subtitle: 'FCFA encaissés',
      detail:   null,
      icon:     Wallet,
      color:    '#DAA520',
      bg:       '#FDF8E8',
      href:     '/paiements',
    },
    {
      title:    'Impayés',
      value:    paiementsRetard,
      subtitle: 'en retard',
      detail:   montantRetards > 0 ? `${(montantRetards / 1000).toFixed(0)}K FCFA` : null,
      icon:     AlertTriangle,
      color:    '#DC2626',
      bg:       '#FEF2F2',
      href:     '/alertes',
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Bienvenue ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#5D3A1A' }}>
            Bonjour, {prenom} 👋
          </h2>
          <p style={{ color: '#8B7355' }}>Bienvenue sur votre espace KeurGest</p>
        </div>

        {alertesNonLues > 0 && (
          <Link
            href="/alertes"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium w-fit transition-all hover:opacity-90"
            style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
          >
            <AlertTriangle className="w-4 h-4" />
            {alertesNonLues} alerte{alertesNonLues > 1 ? 's' : ''} en attente
          </Link>
        )}
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsCards.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="bg-white rounded-2xl p-4 lg:p-6 border transition-all hover:shadow-lg group"
            style={{ borderColor: '#F0E6D8' }}
          >
            <div className="mb-3 lg:mb-4">
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: stat.bg }}
              >
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: stat.color }} />
              </div>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: '#5D3A1A' }}>
              {stat.value}
            </h3>
            <p className="text-sm font-medium" style={{ color: '#8B7355' }}>{stat.title}</p>
            <p className="text-xs mt-1" style={{ color: '#A89580' }}>
              {stat.subtitle}
              {stat.detail && <span className="block">{stat.detail}</span>}
            </p>
          </Link>
        ))}
      </div>

      {/* ── Actions rapides ── */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 border" style={{ borderColor: '#F0E6D8' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: '#5D3A1A' }}>
          Actions rapides
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Home,        label: 'Nouveau bien',          href: '/biens/nouveau',        color: '#8B4513', bg: '#FFF5EB' },
            { icon: Users,       label: 'Nouveau locataire',     href: '/locataires/nouveau',   color: '#556B2F', bg: '#F0F5E8' },
            { icon: Wallet,      label: 'Enregistrer paiement',  href: '/paiements/nouveau',    color: '#DAA520', bg: '#FDF8E8' },
            { icon: Calendar,    label: 'Nouvelle réservation',  href: '/reservations/nouveau', color: '#8B4513', bg: '#FFF5EB' },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:shadow-md text-center"
              style={{ backgroundColor: action.bg }}
            >
              <action.icon className="w-6 h-6" style={{ color: action.color }} />
              <span className="text-xs sm:text-sm font-medium" style={{ color: '#5D3A1A' }}>
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Grille principale ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Derniers paiements */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 lg:p-6 border" style={{ borderColor: '#F0E6D8' }}>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg font-bold" style={{ color: '#5D3A1A' }}>Derniers paiements</h3>
            <Link href="/paiements" className="text-sm font-medium hover:underline" style={{ color: '#8B4513' }}>
              Voir tout →
            </Link>
          </div>

          <div className="space-y-3">
            {paiements?.slice(0, 5).map((paiement, i) => (
              <div
                key={paiement.id || i}
                className="flex items-center justify-between p-3 lg:p-4 rounded-xl"
                style={{ backgroundColor: '#FAF5F0' }}
              >
                <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    style={{ backgroundColor: '#CD853F' }}
                  >
                    {paiement.locataire?.nom?.charAt(0) || 'L'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: '#5D3A1A' }}>
                      {paiement.locataire?.nom || 'Locataire'}
                    </p>
                    <p className="text-xs truncate" style={{ color: '#8B7355' }}>
                      {paiement.bien?.nom || 'Bien'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-bold text-sm" style={{ color: '#5D3A1A' }}>
                    {paiement.montant?.toLocaleString()} F
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor:
                        paiement.statut === 'payé'   ? '#F0F5E8' :
                        paiement.statut === 'retard' ? '#FEF2F2' : '#FDF8E8',
                      color:
                        paiement.statut === 'payé'   ? '#556B2F' :
                        paiement.statut === 'retard' ? '#DC2626' : '#DAA520',
                    }}
                  >
                    {paiement.statut === 'payé'   ? '✓ Payé' :
                     paiement.statut === 'retard' ? 'Retard' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}

            {(!paiements || paiements.length === 0) && (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: '#8B7355' }} />
                <p style={{ color: '#8B7355' }}>Aucun paiement récent</p>
                <Link href="/paiements/nouveau" className="inline-block mt-3 text-sm font-medium" style={{ color: '#8B4513' }}>
                  + Enregistrer un paiement
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Alertes récentes */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 border" style={{ borderColor: '#F0E6D8' }}>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-lg font-bold" style={{ color: '#5D3A1A' }}>Alertes</h3>
            <Link href="/alertes" className="text-sm font-medium hover:underline" style={{ color: '#8B4513' }}>
              Voir tout →
            </Link>
          </div>

          <div className="space-y-3">
            {alertes?.filter((a) => !a.lue).slice(0, 4).map((alerte, i) => (
              <div
                key={alerte.id || i}
                className="p-3 lg:p-4 rounded-xl border-l-4"
                style={{
                  backgroundColor: '#FAF5F0',
                  borderLeftColor:
                    alerte.priorite === 'urgente' ? '#DC2626' :
                    alerte.priorite === 'haute'   ? '#F59E0B' : '#8B4513',
                }}
              >
                <p className="font-medium text-sm" style={{ color: '#5D3A1A' }}>
                  {alerte.titre}
                </p>
                {alerte.message && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: '#8B7355' }}>
                    {alerte.message}
                  </p>
                )}
              </div>
            ))}

            {(!alertes || alertes.filter((a) => !a.lue).length === 0) && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-medium" style={{ color: '#556B2F' }}>Tout est en ordre !</p>
                <p className="text-sm" style={{ color: '#8B7355' }}>Aucune alerte en attente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
