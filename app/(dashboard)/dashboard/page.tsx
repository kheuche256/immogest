import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import StatsCards from '@/components/dashboard/StatsCards'
import RevenueChart from '@/components/dashboard/RevenueChart'
import RecentPayments from '@/components/dashboard/RecentPayments'
import AlertsList from '@/components/dashboard/AlertsList'
import TopProperties from '@/components/dashboard/TopProperties'
import QuickActions from '@/components/dashboard/QuickActions'
import OnboardingBanner from '@/components/dashboard/OnboardingBanner'
import { Alerte } from '@/types'

// ─── Types locaux ─────────────────────────────────────────────────────────────

interface DashboardStats {
  totalBiens: number
  biensLoues: number
  locatairesActifs: number
  totalLocataires: number
  revenusMois: number
  revenusMoisPrec: number
  paiementsRetard: number
  montantImpaye: number
}

interface MonthData {
  mois: string
  attendu: number
  encaisse: number
}

interface RecentPayment {
  id: string
  locataire_nom: string
  locataire_prenom: string
  bien_nom: string
  montant: number
  statut: 'paye' | 'en_attente' | 'en_retard' | 'partiel'
  date: string
}

interface TopPropertyItem {
  id: string
  nom: string
  type: string
  quartier?: string
  ville: string
  locataires_total: number
  locataires_actifs: number
  revenus_mensuels: number
}

// ─── Fetch depuis Supabase ─────────────────────────────────────────────────────

async function getDashboardData(userId: string) {
  const supabase = await createClient()

  const now = new Date()
  const currentMonth = format(now, 'yyyy-MM')
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonth = format(prevMonthDate, 'yyyy-MM')

  const [
    { data: biens },
    { data: locataires },
    { data: paiementsMois },
    { data: paiementsPrec },
    { data: paiementsRetard },
    { data: alertes },
    { data: paiementsRecents },
  ] = await Promise.all([
    supabase.from('biens').select('*').eq('user_id', userId),
    supabase.from('locataires').select('*').eq('user_id', userId),
    supabase.from('paiements').select('*').eq('user_id', userId).eq('mois', currentMonth),
    supabase.from('paiements').select('*').eq('user_id', userId).eq('mois', prevMonth),
    supabase
      .from('paiements')
      .select('*, locataires(nom,prenom), biens(nom)')
      .eq('user_id', userId)
      .eq('statut', 'en_retard'),
    supabase
      .from('alertes')
      .select('*, biens(nom), locataires(nom,prenom)')
      .eq('user_id', userId)
      .eq('lue', false)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('paiements')
      .select('*, locataires(nom,prenom), biens(nom)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats: DashboardStats = {
    totalBiens: biens?.length ?? 0,
    biensLoues: biens?.filter((b) => b.statut === 'loue').length ?? 0,
    locatairesActifs: locataires?.filter((l) => l.statut === 'actif').length ?? 0,
    totalLocataires: locataires?.length ?? 0,
    revenusMois:
      paiementsMois
        ?.filter((p) => p.statut === 'paye')
        .reduce((sum, p) => sum + (p.montant_paye ?? p.montant), 0) ?? 0,
    revenusMoisPrec:
      paiementsPrec
        ?.filter((p) => p.statut === 'paye')
        .reduce((sum, p) => sum + (p.montant_paye ?? p.montant), 0) ?? 0,
    paiementsRetard: paiementsRetard?.length ?? 0,
    montantImpaye:
      paiementsRetard?.reduce(
        (sum, p) => sum + (p.montant - (p.montant_paye ?? 0)),
        0
      ) ?? 0,
  }

  const recentPayments: RecentPayment[] = (paiementsRecents ?? []).map((p: any) => ({
    id: p.id,
    locataire_nom: p.locataires?.nom ?? '',
    locataire_prenom: p.locataires?.prenom ?? '',
    bien_nom: p.biens?.nom ?? '',
    montant: p.montant,
    statut: p.statut,
    date: p.date_paiement ?? p.date_echeance,
  }))

  const topBiens: TopPropertyItem[] = (biens ?? [])
    .map((b: any) => {
      const biensLocataires = locataires?.filter((l) => l.bien_id === b.id) ?? []
      return {
        id: b.id,
        nom: b.nom,
        type: b.type,
        quartier: b.quartier,
        ville: b.ville,
        locataires_total: biensLocataires.length,
        locataires_actifs: biensLocataires.filter((l) => l.statut === 'actif').length,
        revenus_mensuels: b.loyer_mensuel,
      }
    })
    .sort(
      (a: TopPropertyItem, b: TopPropertyItem) => b.revenus_mensuels - a.revenus_mensuels
    )

  return {
    stats,
    recentPayments,
    alertes: (alertes ?? []) as Alerte[],
    topBiens,
    chartData: [] as MonthData[],
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const displayName =
    user.user_metadata?.nom || user.email?.split('@')[0] || 'Utilisateur'

  const moisAnnee = format(new Date(), 'MMMM yyyy', { locale: fr })
  const moisAnneeCapitalized = moisAnnee.charAt(0).toUpperCase() + moisAnnee.slice(1)

  const { stats, recentPayments, alertes, topBiens, chartData } =
    await getDashboardData(user.id)

  return (
    <div className="space-y-6 pb-8">

      {/* ── Bannière onboarding (disparaît si entreprise déjà configurée) ── */}
      <OnboardingBanner />

      {/* ── Bannière de bienvenue ────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,102,255,0.12) 0%, rgba(0,212,170,0.06) 100%)',
          border: '1px solid rgba(0,102,255,0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Orbes décoratifs */}
        <div
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0066FF, transparent)' }}
        />
        <div
          className="absolute -bottom-8 right-32 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #00D4AA, transparent)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">👋</span>
            <h1 className="text-2xl font-bold text-white">
              Bienvenue,{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #0066FF, #00D4AA)',
                }}
              >
                {displayName}
              </span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Vue d&apos;ensemble de votre portefeuille immobilier &bull;{' '}
            {moisAnneeCapitalized}
          </p>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <StatsCards
        totalBiens={stats.totalBiens}
        biensLoues={stats.biensLoues}
        locatairesActifs={stats.locatairesActifs}
        totalLocataires={stats.totalLocataires}
        revenusMois={stats.revenusMois}
        revenusMoisPrec={stats.revenusMoisPrec}
        paiementsRetard={stats.paiementsRetard}
        montantImpaye={stats.montantImpaye}
      />

      {/* ── Graphique Revenus ────────────────────────────────────────────── */}
      <RevenueChart data={chartData} />

      {/* ── Grille inférieure ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Derniers paiements — span 2 col sur xl */}
        <div className="xl:col-span-2">
          <RecentPayments payments={recentPayments} />
        </div>

        {/* Alertes */}
        <div>
          <AlertsList alertes={alertes} />
        </div>

        {/* Top Biens — span 2 col sur xl */}
        <div className="xl:col-span-2">
          <TopProperties biens={topBiens} />
        </div>

        {/* Actions Rapides */}
        <QuickActions />

      </div>
    </div>
  )
}
