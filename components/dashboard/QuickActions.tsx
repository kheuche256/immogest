'use client'

const actions = [
  { href: '/biens',      emoji: '🏠', label: 'Ajouter un bien',          color: '#0066FF' },
  { href: '/locataires', emoji: '👤', label: 'Nouveau locataire',         color: '#00C48C' },
  { href: '/paiements',  emoji: '💰', label: 'Enregistrer un paiement',   color: '#FFB800' },
  { href: '/quittances', emoji: '📄', label: 'Générer une quittance',     color: '#9370DB' },
]

export default function QuickActions() {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-3"
      style={{
        background: 'rgba(17,24,39,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <h3 className="text-base font-bold text-white mb-1">Actions Rapides</h3>

      {actions.map((action) => (
        <a
          key={action.href}
          href={action.href}
          className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.background = `${action.color}12`
            el.style.borderColor = `${action.color}30`
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.background = 'rgba(255,255,255,0.03)'
            el.style.borderColor = 'rgba(255,255,255,0.06)'
          }}
        >
          <span
            className="text-xl w-9 h-9 flex items-center justify-center rounded-lg"
            style={{ background: `${action.color}15` }}
          >
            {action.emoji}
          </span>
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            {action.label}
          </span>
          <span className="ml-auto text-gray-600 group-hover:text-gray-400 transition-colors text-lg">
            →
          </span>
        </a>
      ))}
    </div>
  )
}
