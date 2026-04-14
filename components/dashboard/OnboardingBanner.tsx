'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'
import { useProfile } from '@/hooks/useProfile'

// Affiche une bannière incitative si l'entreprise n'est pas configurée.
// Se masque si le client a déjà renseigné son entreprise ou s'il a fermé la bannière.

export default function OnboardingBanner() {
  const { profile, isLoading } = useProfile()
  const [dismissed, setDismissed] = useState(false)

  // Ne rien afficher pendant le chargement ou si déjà configuré ou fermé
  if (isLoading || dismissed || profile?.entreprise) return null

  return (
    <div
      className="relative flex items-start sm:items-center justify-between gap-4 rounded-2xl px-5 py-4 mb-2 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.05) 100%)',
        border: '1px solid rgba(245,158,11,0.25)',
      }}
    >
      {/* Orbe décoratif */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
      />

      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icône */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)' }}
        >
          <Sparkles size={18} color="#F59E0B" />
        </div>

        {/* Texte */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-snug">
            Personnalisez votre espace
          </p>
          <p className="text-xs mt-0.5 hidden sm:block" style={{ color: 'rgba(156,163,175,0.85)' }}>
            Ajoutez votre logo, nom d&apos;entreprise et couleurs pour un branding professionnel sur tous vos documents.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href="/parametres"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
          }}
        >
          Configurer
          <ArrowRight size={13} />
        </Link>

        {/* Fermer */}
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg transition-all hover:bg-white/10"
          style={{ color: 'rgba(156,163,175,0.7)' }}
          title="Fermer"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
