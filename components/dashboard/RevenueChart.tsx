'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts'

interface MonthData {
  mois: string
  attendu: number
  encaisse: number
}

interface RevenueChartProps {
  data: MonthData[]
  loading?: boolean
}

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function generateDemoData(): MonthData[] {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const base = 850_000 + Math.random() * 300_000
    const variance = 0.85 + Math.random() * 0.2
    return {
      mois: MOIS_LABELS[d.getMonth()],
      attendu: Math.round(base),
      encaisse: Math.round(base * variance),
    }
  })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  const formatVal = (v: number) =>
    new Intl.NumberFormat('fr-FR').format(v) + ' FCFA'

  return (
    <div
      className="rounded-xl p-4 text-sm"
      style={{
        background: 'rgba(13,19,35,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-gray-300">{entry.name === 'attendu' ? 'Attendu' : 'Encaissé'} :</span>
          <span className="text-white font-semibold">{formatVal(entry.value)}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <span className="text-gray-400">Taux de collecte : </span>
          <span
            className="font-bold"
            style={{
              color: payload[1].value >= payload[0].value ? '#00D4AA' : '#FF4444',
            }}
          >
            {Math.round((payload[1].value / payload[0].value) * 100)}%
          </span>
        </div>
      )}
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="h-64 animate-pulse flex items-end gap-3 px-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-white/5"
          style={{ height: `${30 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  )
}

export default function RevenueChart({ data, loading = false }: RevenueChartProps) {
  const chartData = data.length > 0 ? data : generateDemoData()
  const isDemo = data.length === 0

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(17,24,39,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white">Évolution des Revenus</h3>
          <p className="text-xs text-gray-500 mt-0.5">12 derniers mois</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded-full" style={{ background: '#0066FF' }} />
            <span className="text-xs text-gray-400">Attendu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded-full" style={{ background: '#00D4AA' }} />
            <span className="text-xs text-gray-400">Encaissé</span>
          </div>
          {isDemo && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,184,0,0.1)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.2)' }}
            >
              Données démo
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <SkeletonChart />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAttendu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066FF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEncaisse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />

            <XAxis
              dataKey="mois"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
                return v
              }}
              width={48}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />

            <Area
              type="monotone"
              dataKey="attendu"
              stroke="#0066FF"
              strokeWidth={2}
              fill="url(#colorAttendu)"
              dot={false}
              activeDot={{ r: 5, fill: '#0066FF', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="encaisse"
              stroke="#00D4AA"
              strokeWidth={2}
              fill="url(#colorEncaisse)"
              dot={false}
              activeDot={{ r: 5, fill: '#00D4AA', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
