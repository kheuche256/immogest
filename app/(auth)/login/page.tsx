'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Phone } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">

      {/* Logo mobile uniquement */}
      <div className="lg:hidden text-center mb-8">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="KeurGest"
            width={180}
            height={50}
            className="h-14 w-auto mx-auto"
            priority
          />
        </Link>
      </div>

      {/* Card formulaire */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: '#F0E6D8' }}>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#5D3A1A' }}>
            Bon retour !
          </h1>
          <p style={{ color: '#8B7355' }}>Connectez-vous à votre espace KeurGest</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#5D3A1A' }}>
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8B7355' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all outline-none text-base"
                style={{ borderColor: '#E8DDD0', backgroundColor: '#FDFBF8', color: '#5D3A1A' }}
                onFocus={(e) => { e.target.style.borderColor = '#8B4513' }}
                onBlur={(e)  => { e.target.style.borderColor = '#E8DDD0' }}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#5D3A1A' }}>
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8B7355' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 transition-all outline-none text-base"
                style={{ borderColor: '#E8DDD0', backgroundColor: '#FDFBF8', color: '#5D3A1A' }}
                onFocus={(e) => { e.target.style.borderColor = '#8B4513' }}
                onBlur={(e)  => { e.target.style.borderColor = '#E8DDD0' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                style={{ color: '#8B7355' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded"
                style={{ accentColor: '#8B4513' }}
              />
              <span className="text-sm" style={{ color: '#8B7355' }}>Se souvenir de moi</span>
            </label>
            <a href="#" className="text-sm font-medium hover:underline" style={{ color: '#8B4513' }}>
              Mot de passe oublié ?
            </a>
          </div>

          {/* Erreur */}
          {error && (
            <div
              className="p-4 rounded-xl text-sm flex items-center gap-3"
              style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 text-base"
            style={{ backgroundColor: '#8B4513', boxShadow: '0 4px 15px rgba(139,69,19,0.3)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Se connecter <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: '#E8DDD0' }} />
          <span className="text-sm" style={{ color: '#8B7355' }}>ou</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#E8DDD0' }} />
        </div>

        {/* Bouton contact */}
        <a
          href="tel:+221771234567"
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 border-2 transition-all hover:bg-amber-50"
          style={{ borderColor: '#E8DDD0', color: '#5D3A1A' }}
        >
          <Phone className="w-5 h-5" />
          Besoin d&apos;aide ? Appelez-nous
        </a>

        {/* Lien inscription */}
        <p className="text-center mt-6" style={{ color: '#8B7355' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-semibold hover:underline" style={{ color: '#8B4513' }}>
            Créer un compte gratuit
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center mt-6 text-sm" style={{ color: '#8B7355' }}>
        © 2026 KeurGest — Dakar, Sénégal 🇸🇳
      </p>
    </div>
  )
}
