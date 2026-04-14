'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(
        authError.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : authError.message
      )
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <span className="text-4xl">🏠</span>
          <span
            className="text-3xl font-bold"
            style={{
              backgroundImage: 'linear-gradient(135deg, #0066FF, #00D4AA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ImmoGest
          </span>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Gestion immobilière simplifiée
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-8 border border-white/10 shadow-2xl"
        style={{
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Connexion</h1>
          <p className="text-gray-400 text-sm mt-1">
            Bienvenue ! Connectez-vous à votre compte.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-lg flex items-start gap-2 text-sm"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
            }}
          >
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid rgba(0, 102, 255, 0.6)'
                e.currentTarget.style.background = 'rgba(0, 102, 255, 0.05)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(0, 102, 255, 0.6)'
                  e.currentTarget.style.background = 'rgba(0, 102, 255, 0.05)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? 'rgba(0, 102, 255, 0.5)'
                : 'linear-gradient(135deg, #0066FF 0%, #00D4AA 100%)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(0, 102, 255, 0.35)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 102, 255, 0.5)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 102, 255, 0.35)'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Se connecter
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span className="text-xs text-gray-600">ou</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-400">
          Pas encore de compte ?{' '}
          <Link
            href="/register"
            className="font-semibold transition-colors"
            style={{ color: '#00D4AA' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0066FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#00D4AA')}
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-600 mt-6">
        © 2025 ImmoGest · Tous droits réservés
      </p>
    </div>
  )
}
