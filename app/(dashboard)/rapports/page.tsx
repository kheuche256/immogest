'use client'

import { useState, useMemo } from 'react'
import {
  BarChart3, TrendingUp, Wallet, AlertTriangle, PieChart,
  ChevronDown, Download, X, MessageCircle,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { usePaiements } from '@/hooks/usePaiements'
import { useBiens } from '@/hooks/useBiens'
import { useLocataires } from '@/hooks/useLocataires'
import { exportRapportExcel, exportPaiementsExcel, exportBiensExcel, exportLocatairesExcel } from '@/lib/export'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Periode { debut: string; fin: string }

// ─── Utils ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

function fmtShort(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'k'
  return String(n)
}

function moisLabel(mois: string) {
  const [y, m] = mois.split('-')
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}

function joursRetard(mois: string) {
  const echeance = new Date(`${mois}-05`)
  const diff = (new Date().getTime() - echeance.getTime()) / 86400000
  return Math.max(0, Math.floor(diff))
}

function getModeLabel(mode: string | null) {
  const map: Record<string, string> = { especes: 'Espèces', wave: 'Wave', om: 'Orange Money', virement: 'Virement' }
  return mode ? (map[mode] ?? mode) : ''
}

// ─── Periodes rapides ─────────────────────────────────────────────────────────

function getPeriodes() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const prevM = now.getMonth() === 0 ? 12 : now.getMonth()
  const prevY = now.getMonth() === 0 ? y - 1 : y
  const prevMStr = String(prevM).padStart(2, '0')
  const trimStart = String(Math.floor(now.getMonth() / 3) * 3 + 1).padStart(2, '0')

  return {
    'Ce mois':       { debut: `${y}-${m}-01`,       fin: `${y}-${m}-31` },
    'Mois dernier':  { debut: `${prevY}-${prevMStr}-01`, fin: `${prevY}-${prevMStr}-31` },
    'Ce trimestre':  { debut: `${y}-${trimStart}-01`, fin: `${y}-${m}-31` },
    'Cette année':   { debut: `${y}-01-01`,           fin: `${y}-12-31` },
  }
}

// ─── Calculs ──────────────────────────────────────────────────────────────────

function calculerStats(paiements: any[], periode: Periode) {
  const p = paiements.filter((x) => {
    const d = new Date(x.mois + '-01')
    return d >= new Date(periode.debut) && d <= new Date(periode.fin)
  })
  const attendu   = p.reduce((s: number, x: any) => s + x.montant, 0)
  const encaisse  = p.filter((x: any) => x.statut === 'payé').reduce((s: number, x: any) => s + x.montant, 0)
  const impayes   = attendu - encaisse
  const taux      = attendu > 0 ? Math.round((encaisse / attendu) * 100) : 0
  return { attendu, encaisse, impayes, taux, paiementsPeriode: p }
}

function revenusParBien(paiements: any[], biens: any[]) {
  return biens
    .map((bien) => {
      const pb = paiements.filter((p: any) => p.bien_id === bien.id)
      const encaisse = pb.filter((p: any) => p.statut === 'payé').reduce((s: number, p: any) => s + p.montant, 0)
      const impaye   = pb.filter((p: any) => p.statut !== 'payé').reduce((s: number, p: any) => s + p.montant, 0)
      const total    = encaisse + impaye
      const taux     = total > 0 ? Math.round((encaisse / total) * 100) : 0
      return { bien, encaisse, impaye, total, taux }
    })
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
}

function buildChartData(paiements: any[], periode: Periode) {
  const moisSet = new Set<string>()
  paiements.forEach((p: any) => {
    const d = new Date(p.mois + '-01')
    if (d >= new Date(periode.debut) && d <= new Date(periode.fin)) moisSet.add(p.mois)
  })
  return Array.from(moisSet).sort().map((mois) => {
    const pm = paiements.filter((p: any) => p.mois === mois)
    return {
      name: moisLabel(mois),
      Attendu:   pm.reduce((s: number, p: any) => s + p.montant, 0),
      Encaissé:  pm.filter((p: any) => p.statut === 'payé').reduce((s: number, p: any) => s + p.montant, 0),
    }
  })
}

// ─── Composants utilitaires ───────────────────────────────────────────────────

function StatCard({
  label, value, sous, color, icon: Icon, progress,
}: {
  label: string; value: string; sous?: string; color: string; icon: React.ElementType; progress?: number
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: 'rgba(17,24,39,0.8)',
        border: `1px solid ${color}20`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <p className="text-xl font-bold text-white leading-tight">{value}</p>
      {sous && <p className="text-xs text-gray-500">{sous}</p>}
      {progress !== undefined && (
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, progress)}%`,
              background: progress >= 80 ? '#00C48C' : progress >= 50 ? '#FFB800' : '#ef4444',
            }}
          />
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">{children}</h2>
  )
}

// Tooltip recharts custom
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-sm shadow-xl"
      style={{ background: 'rgba(17,24,39,0.97)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name} : {fmtShort(p.value)} FCFA
        </p>
      ))}
    </div>
  )
}

// Skeleton
function SkeletonBlock({ h = 'h-32' }: { h?: string }) {
  return (
    <div
      className={`rounded-2xl ${h} animate-pulse`}
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.04)' }}
    />
  )
}


// ─── Page principale ──────────────────────────────────────────────────────────

export default function RapportsPage() {
  const { paiements, isLoading: loadingP }   = usePaiements()
  const { biens, isLoading: loadingB }       = useBiens()
  const { locataires }                        = useLocataires()
  const isLoading = loadingP || loadingB

  const periodes = getPeriodes()
  const [periodeKey, setPeriodeKey]       = useState<string>('Ce mois')
  const [dateDebut, setDateDebut]         = useState('')
  const [dateFin, setDateFin]             = useState('')
  const [filtreBien, setFiltreBien]       = useState('tous')
  const [modePerso, setModePerso]         = useState(false)

  // Période effective
  const periode: Periode = useMemo(() => {
    if (modePerso && dateDebut && dateFin) return { debut: dateDebut, fin: dateFin }
    return periodes[periodeKey as keyof typeof periodes] ?? periodes['Ce mois']
  }, [modePerso, dateDebut, dateFin, periodeKey])

  // Paiements filtrés par bien
  const paiementsFiltres = useMemo(() =>
    filtreBien === 'tous'
      ? paiements
      : paiements.filter((p) => p.bien_id === filtreBien),
    [paiements, filtreBien]
  )

  // Biens filtrés
  const biensFiltres = useMemo(() =>
    filtreBien === 'tous' ? biens : biens.filter((b) => b.id === filtreBien),
    [biens, filtreBien]
  )

  // Stats
  const stats = useMemo(() => calculerStats(paiementsFiltres, periode), [paiementsFiltres, periode])

  // Chart data
  const chartData = useMemo(() => buildChartData(paiementsFiltres, periode), [paiementsFiltres, periode])

  // Revenus par bien
  const revenus = useMemo(() => revenusParBien(stats.paiementsPeriode, biensFiltres), [stats.paiementsPeriode, biensFiltres])

  // Impayés détaillés
  const impayesDetails = useMemo(() =>
    stats.paiementsPeriode
      .filter((p: any) => p.statut !== 'payé')
      .sort((a: any, b: any) => b.montant - a.montant),
    [stats.paiementsPeriode]
  )

  // Label période pour export
  const periodeLabel = modePerso ? `${dateDebut}_${dateFin}` : periodeKey.replace(/\s/g, '_')

  // ─── Render
  return (
    <div className="p-6 space-y-8 animate-fadeIn">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(147,112,219,0.15)' }}>
            <BarChart3 size={22} color="#9370DB" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Rapports & Analyses</h1>
            <p className="text-sm text-gray-500">Suivez la performance de votre portefeuille immobilier</p>
          </div>
        </div>

        {/* Boutons export */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportRapportExcel({
              periode: periodeLabel,
              biens: biensFiltres,
              locataires,
              paiements: stats.paiementsPeriode,
              stats: { attendu: stats.attendu, encaisse: stats.encaisse, impayes: stats.impayes, taux: stats.taux },
            })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg,#9370DB,#7c3aed)',
              boxShadow: '0 4px 15px rgba(147,112,219,0.3)',
            }}
          >
            <Download size={15} />
            Rapport complet
          </button>
          <button
            onClick={() => exportPaiementsExcel(stats.paiementsPeriode)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(0,196,140,0.1)', border: '1px solid rgba(0,196,140,0.2)', color: '#00C48C' }}
          >
            <Download size={14} />
            Paiements
          </button>
          <button
            onClick={() => exportBiensExcel(biensFiltres)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.2)', color: '#60a5fa' }}
          >
            <Download size={14} />
            Biens
          </button>
          <button
            onClick={() => exportLocatairesExcel(locataires)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', color: '#FFB800' }}
          >
            <Download size={14} />
            Locataires
          </button>
        </div>
      </div>

      {/* ── Filtres période ── */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-4"
        style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Boutons rapides */}
          {Object.keys(periodes).map((k) => (
            <button
              key={k}
              onClick={() => { setPeriodeKey(k); setModePerso(false) }}
              className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: !modePerso && periodeKey === k ? 'rgba(147,112,219,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${!modePerso && periodeKey === k ? 'rgba(147,112,219,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: !modePerso && periodeKey === k ? '#b39ddb' : '#9ca3af',
              }}
            >
              {k}
            </button>
          ))}

          {/* Toggle personnalisé */}
          <button
            onClick={() => setModePerso(!modePerso)}
            className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: modePerso ? 'rgba(147,112,219,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${modePerso ? 'rgba(147,112,219,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: modePerso ? '#b39ddb' : '#9ca3af',
            }}
          >
            Personnalisé
          </button>

          {/* Filtre bien */}
          <div className="relative ml-auto">
            <select
              value={filtreBien}
              onChange={(e) => setFiltreBien(e.target.value)}
              className="appearance-none pl-4 pr-9 py-1.5 rounded-xl text-sm text-white outline-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <option value="tous">Tous les biens</option>
              {biens.map((b) => <option key={b.id} value={b.id}>{b.nom}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Dates personnalisées */}
        {modePerso && (
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Du</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Au</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Section 1 : Résumé financier ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} h="h-36" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Revenus Attendus"
            value={fmt(stats.attendu)}
            sous={`${stats.paiementsPeriode.length} paiement${stats.paiementsPeriode.length !== 1 ? 's' : ''}`}
            color="#0066FF"
            icon={TrendingUp}
          />
          <StatCard
            label="Encaissé"
            value={fmt(stats.encaisse)}
            sous={`${stats.taux}% du total attendu`}
            color="#00C48C"
            icon={Wallet}
            progress={stats.taux}
          />
          <StatCard
            label="Impayés"
            value={fmt(stats.impayes)}
            sous={`${impayesDetails.length} paiement${impayesDetails.length !== 1 ? 's' : ''} concerné${impayesDetails.length !== 1 ? 's' : ''}`}
            color="#ef4444"
            icon={AlertTriangle}
          />
          <StatCard
            label="Taux de Recouvrement"
            value={`${stats.taux}%`}
            sous={stats.taux >= 80 ? '✅ Excellent' : stats.taux >= 50 ? '⚠️ Moyen' : '🔴 Faible'}
            color={stats.taux >= 80 ? '#00C48C' : stats.taux >= 50 ? '#FFB800' : '#ef4444'}
            icon={PieChart}
            progress={stats.taux}
          />
        </div>
      )}

      {/* ── Section 2 : Graphique évolution ── */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <SectionTitle>📈 Évolution des revenus</SectionTitle>

        {isLoading ? (
          <SkeletonBlock h="h-64" />
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Aucune donnée pour cette période</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtShort(v)}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#9ca3af', fontSize: '12px', paddingTop: '16px' }}
              />
              <Bar dataKey="Attendu"  fill="#0066FF" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
              <Bar dataKey="Encaissé" fill="#00C48C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Section 3 : Revenus par bien ── */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <SectionTitle>🏠 Revenus par bien</SectionTitle>

        {isLoading ? (
          <SkeletonBlock h="h-48" />
        ) : revenus.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Aucune donnée pour cette période</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Bien', 'Loyer mensuel', 'Encaissé', 'Impayé', 'Taux', 'Progression'].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {revenus.map(({ bien, encaisse, impaye, total, taux }) => (
                  <tr
                    key={bien.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                  >
                    <td className="px-3 py-3 text-sm font-medium text-white">{bien.nom}</td>
                    <td className="px-3 py-3 text-sm text-gray-300">{fmt(bien.loyer_mensuel ?? 0)}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-emerald-400">{fmt(encaisse)}</td>
                    <td className="px-3 py-3 text-sm font-medium" style={{ color: impaye > 0 ? '#f87171' : '#6b7280' }}>
                      {impaye > 0 ? fmt(impaye) : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="text-sm font-bold"
                        style={{ color: taux >= 80 ? '#00C48C' : taux >= 50 ? '#FFB800' : '#ef4444' }}
                      >
                        {taux}%
                      </span>
                    </td>
                    <td className="px-3 py-3 w-32">
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, taux)}%`,
                            background: taux >= 80 ? '#00C48C' : taux >= 50 ? '#FFB800' : '#ef4444',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Ligne total */}
                <tr style={{ borderTop: '2px solid rgba(255,255,255,0.08)' }}>
                  <td className="px-3 py-3 text-sm font-bold text-white">TOTAL</td>
                  <td className="px-3 py-3 text-sm font-bold text-white">
                    {fmt(biensFiltres.reduce((s, b) => s + (b.loyer_mensuel ?? 0), 0))}
                  </td>
                  <td className="px-3 py-3 text-sm font-bold text-emerald-400">
                    {fmt(revenus.reduce((s, r) => s + r.encaisse, 0))}
                  </td>
                  <td className="px-3 py-3 text-sm font-bold" style={{ color: '#f87171' }}>
                    {fmt(revenus.reduce((s, r) => s + r.impaye, 0))}
                  </td>
                  <td className="px-3 py-3 text-sm font-bold text-white">{stats.taux}%</td>
                  <td className="px-3 py-3">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, stats.taux)}%`,
                          background: stats.taux >= 80 ? '#00C48C' : stats.taux >= 50 ? '#FFB800' : '#ef4444',
                        }}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section 4 : Impayés à recouvrer ── */}
      {!isLoading && impayesDetails.length > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(17,24,39,0.8)',
            border: '1px solid rgba(239,68,68,0.15)',
          }}
        >
          <SectionTitle>
            <AlertTriangle size={16} color="#ef4444" />
            <span>Impayés à recouvrer</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
            >
              {impayesDetails.length}
            </span>
          </SectionTitle>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Locataire', 'Bien', 'Mois', 'Montant', 'Retard', 'Action'].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {impayesDetails.map((p: any) => {
                  const nom = p.locataire
                    ? `${p.locataire.prenom ?? ''} ${p.locataire.nom}`.trim()
                    : 'Locataire'
                  const initiales = nom.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
                  const colors = ['#0066FF', '#00C48C', '#FFB800', '#FF6B6B', '#9370DB']
                  const avatarColor = colors[(p.locataire?.nom?.charCodeAt(0) ?? 0) % colors.length]
                  const jours = joursRetard(p.mois)
                  const moisLabel2 = moisLabel(p.mois)
                  const tel = p.locataire?.telephone
                  const waLink = tel
                    ? `https://wa.me/221${tel.replace(/\s/g, '')}?text=${encodeURIComponent(`Bonjour ${nom}, votre loyer de ${p.montant.toLocaleString()} FCFA pour ${moisLabel2} est en attente. Merci de régulariser.`)}`
                    : null

                  return (
                    <tr
                      key={p.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(239,68,68,0.04)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: `linear-gradient(135deg,${avatarColor},${avatarColor}bb)` }}
                          >
                            {initiales}
                          </div>
                          <span className="text-sm font-medium text-white">{nom}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-400">{p.bien?.nom ?? '—'}</td>
                      <td className="px-3 py-3 text-sm text-gray-300 capitalize">{moisLabel2}</td>
                      <td className="px-3 py-3 text-sm font-semibold text-red-400">{fmt(p.montant)}</td>
                      <td className="px-3 py-3">
                        {jours > 0 ? (
                          <span
                            className="text-xs px-2 py-1 rounded-full font-semibold animate-pulse"
                            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
                          >
                            {jours}j
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background: 'rgba(37,211,102,0.12)',
                              border: '1px solid rgba(37,211,102,0.2)',
                              color: '#25d366',
                            }}
                          >
                            <MessageCircle size={12} />
                            Relancer
                          </a>
                        ) : (
                          <span className="text-xs text-gray-600">Pas de tél.</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty state global ── */}
      {!isLoading && stats.paiementsPeriode.length === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: 'rgba(147,112,219,0.1)' }}>
            📊
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Aucune donnée pour cette période</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Changez la période ou ajoutez des paiements pour voir apparaître les analyses financières.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
