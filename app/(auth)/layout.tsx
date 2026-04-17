'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">

      {/* ── Colonne gauche — Illustration ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #8B4513, #5D3A1A)' }}
      >
        {/* Pattern filigrane */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <Image
            src="/logo.png"
            alt="KeurGest"
            width={180}
            height={50}
            className="h-14 w-auto brightness-0 invert"
            priority
          />
        </Link>

        {/* Contenu central */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Gérez vos biens immobiliers
            <span style={{ color: '#DAA520' }}> en toute simplicité</span>
          </h1>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: '#E8D4C4' }}>
            Rejoignez des centaines de propriétaires et agences qui font confiance
            à KeurGest pour gérer leur patrimoine immobilier au Sénégal.
          </p>

          {/* Features list */}
          <div className="space-y-4">
            {[
              'Suivi des loyers en temps réel',
              'Alertes automatiques pour les impayés',
              'Quittances professionnelles en 1 clic',
              'Support Wave, Orange Money, Espèces',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#5D3A1A" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Témoignage */}
        <div
          className="relative z-10 p-6 rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
        >
          <p className="text-white mb-4 italic text-sm leading-relaxed">
            &ldquo;KeurGest m&apos;a fait gagner plus de 5 heures par semaine.
            Je recommande à tous les propriétaires !&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: '#DAA520', color: '#5D3A1A' }}
            >
              AD
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Abdoulaye Diallo</div>
              <div className="text-xs" style={{ color: '#E8D4C4' }}>Propriétaire, 12 appartements</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Colonne droite — Formulaire ── */}
      <div
        className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto"
        style={{ backgroundColor: '#FAF5F0' }}
      >
        {children}
      </div>
    </div>
  )
}
