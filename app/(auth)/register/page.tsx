'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nom: form.nom,
          telephone: form.telephone,
        },
      },
    })

    if (authError) {
      setError(
        authError.message.includes('already registered')
          ? 'Cet email est déjà utilisé. Essayez de vous connecter.'
          : authError.message
      )
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 2000)
  }

  const inputBaseStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }

  const inputFocusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.border = '1px solid rgba(0, 102, 255, 0.6)'
      e.currentTarget.style.background = 'rgba(0, 102, 255, 0.05)'
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.1)'
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
      e.currentTarget.style.boxShadow = 'none'
    },
  }

  const passwordMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword

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
        {/* Success state */}
        {success ? (
          <div className="py-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle size={56} style={{ color: '#00D4AA' }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Compte créé avec succès !
            </h2>
            <p className="text-gray-400 text-sm">
              Redirection vers votre tableau de bord...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
              <p className="text-gray-400 text-sm mt-1">
                Rejoignez ImmoGest et gérez vos biens facilement.
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

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nom complet */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="Mamadou Diallo"
                  required
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-200"
                  style={inputBaseStyle}
                  {...inputFocusHandlers}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-200"
                  style={inputBaseStyle}
                  {...inputFocusHandlers}
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="77 123 45 67"
                  autoComplete="tel"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-200"
                  style={inputBaseStyle}
                  {...inputFocusHandlers}
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 caractères"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-200"
                    style={inputBaseStyle}
                    {...inputFocusHandlers}
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

              {/* Confirmer mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-200"
                    style={{
                      ...inputBaseStyle,
                      ...(form.confirmPassword.length > 0
                        ? {
                            border: passwordMatch
                              ? '1px solid rgba(0, 212, 170, 0.5)'
                              : '1px solid rgba(239, 68, 68, 0.4)',
                          }
                        : {}),
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(0, 102, 255, 0.6)'
                      e.currentTarget.style.background = 'rgba(0, 102, 255, 0.05)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.1)'
                    }}
                    onBlur={(e) => {
                      if (form.confirmPassword.length > 0) {
                        e.currentTarget.style.border = passwordMatch
                          ? '1px solid rgba(0, 212, 170, 0.5)'
                          : '1px solid rgba(239, 68, 68, 0.4)'
                      } else {
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                      }
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {form.confirmPassword.length > 0 && (
                      <span
                        className="text-xs mr-1"
                        style={{ color: passwordMatch ? '#00D4AA' : '#F87171' }}
                      >
                        {passwordMatch ? '✓' : '✗'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                    Création du compte...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Créer mon compte
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

            {/* Login link */}
            <p className="text-center text-sm text-gray-400">
              Déjà un compte ?{' '}
              <Link
                href="/login"
                className="font-semibold transition-colors"
                style={{ color: '#00D4AA' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0066FF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#00D4AA')}
              >
                Se connecter
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-600 mt-6">
        © 2025 ImmoGest · Tous droits réservés
      </p>
    </div>
  )
}
