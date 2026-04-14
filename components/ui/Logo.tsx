'use client'

import Image from 'next/image'
import { useProfile } from '@/hooks/useProfile'

// ─── Props ────────────────────────────────────────────────────────────────────

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

// ─── Dimensions par taille ────────────────────────────────────────────────────

const SIZE_MAP = {
  sm: { box: 32, px: 'w-8 h-8',  text: 'text-base',  sub: 'text-[9px]'  },
  md: { box: 40, px: 'w-10 h-10', text: 'text-lg',   sub: 'text-[10px]' },
  lg: { box: 64, px: 'w-16 h-16', text: 'text-2xl',  sub: 'text-xs'     },
}

// ─── Composant Logo ───────────────────────────────────────────────────────────

export function Logo({ size = 'md', showName = true, className = '' }: LogoProps) {
  const { profile, isLoading } = useProfile()
  const dim = SIZE_MAP[size]

  const couleur   = profile?.couleur_principale ?? '#0066FF'
  const nomAff    = profile?.entreprise || 'ImmoGest'
  const logoUrl   = profile?.logo_url

  return (
    <div className={`flex items-center gap-3 ${className}`}>

      {/* ── Icône / Logo ── */}
      {logoUrl ? (
        <div
          className={`${dim.px} rounded-xl overflow-hidden flex-shrink-0`}
          style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
        >
          <Image
            src={logoUrl}
            alt={`Logo ${nomAff}`}
            width={dim.box}
            height={dim.box}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div
          className={`${dim.px} rounded-xl flex items-center justify-center flex-shrink-0 text-white`}
          style={{
            background: isLoading
              ? 'rgba(255,255,255,0.06)'
              : `linear-gradient(135deg, ${couleur}, #00D4AA)`,
            boxShadow: isLoading ? 'none' : `0 4px 14px ${couleur}40`,
            fontSize: size === 'lg' ? '28px' : size === 'md' ? '20px' : '14px',
          }}
        >
          {isLoading ? '' : '🏠'}
        </div>
      )}

      {/* ── Nom + sous-titre ── */}
      {showName && (
        <div className="min-w-0">
          <p
            className={`${dim.text} font-bold leading-tight truncate`}
            style={{
              backgroundImage: `linear-gradient(135deg, ${couleur}, #00D4AA)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isLoading ? '…' : nomAff}
          </p>
          <p
            className={`${dim.sub} font-medium uppercase tracking-widest truncate`}
            style={{ color: 'rgba(156,163,175,0.7)' }}
          >
            Gestion Immobilière
          </p>
        </div>
      )}
    </div>
  )
}

export default Logo
