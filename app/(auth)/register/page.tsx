'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Building2 } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms]   = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email:    formData.email,
        password: formData.password,
        options:  {
          data: {
            nom:        formData.nom,
            telephone:  formData.telephone,
            entreprise: formData.entreprise,
          },
        },
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  // Input réutilisable avec styles cohérents
  const inputClass = "w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all outline-none text-sm"
  const inputStyle = { borderColor: '#E8DDD0', backgroundColor: '#FDFBF8', color: '#5D3A1A' }
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#8B4513' }
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#E8DDD0' }

  return (
    <div className="w-full max-w-md">

      {/* Logo mobile uniquement */}
      <div className="lg:hidden text-center mb-6">
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
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#5D3A1A' }}>
            Créez votre compte
          </h1>
          <p style={{ color: '#8B7355' }}>Commencez gratuitement en quelques minutes</p>
        </div>

        {/* Badge gratuit */}
        <div
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-full mb-6 mx-auto w-fit text-sm font-medium"
          style={{ backgroundColor: '#F0F5E8', color: '#556B2F' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Essai gratuit • Aucune carte requise
        </div>

        {/* Formulaire */}
        <form onSubmit={handleRegister} className="space-y-4">

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5D3A1A' }}>
              Nom complet *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8B7355' }} />
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Votre nom complet"
                required
                className={inputClass}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5D3A1A' }}>
              Adresse email *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8B7355' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vous@exemple.com"
                required
                className={inputClass}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>

          {/* Téléphone + Entreprise côte à côte */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#5D3A1A' }}>
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8B7355' }} />
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="77 123 45 67"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border-2 transition-all outline-none text-sm"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#5D3A1A' }}>
                Entreprise
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8B7355' }} />
                <input
                  type="text"
                  name="entreprise"
                  value={formData.entreprise}
                  onChange={handleChange}
                  placeholder="Optionnel"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border-2 transition-all outline-none text-sm"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5D3A1A' }}>
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8B7355' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 caractères"
                required
                className="w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all outline-none text-sm"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: '#8B7355' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#5D3A1A' }}>
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8B7355' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmez votre mot de passe"
                required
                className={inputClass}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>

          {/* Conditions d'utilisation */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded flex-shrink-0"
              style={{ accentColor: '#8B4513' }}
            />
            <span className="text-sm leading-relaxed" style={{ color: '#8B7355' }}>
              J&apos;accepte les{' '}
              <a href="#" className="font-medium underline" style={{ color: '#8B4513' }}>
                conditions d&apos;utilisation
              </a>
              {' '}et la{' '}
              <a href="#" className="font-medium underline" style={{ color: '#8B4513' }}>
                politique de confidentialité
              </a>
            </span>
          </label>

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
            className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#8B4513', boxShadow: '0 4px 15px rgba(139,69,19,0.3)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Créer mon compte gratuit <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        {/* Lien connexion */}
        <p className="text-center mt-6" style={{ color: '#8B7355' }}>
          Déjà un compte ?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: '#8B4513' }}>
            Se connecter
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
