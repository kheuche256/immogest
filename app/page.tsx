'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  Building2,
  Users,
  Wallet,
  Bell,
  FileText,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Star,
  Shield,
  Menu,
  X,
  Play,
  TrendingUp,
  Clock,
  Award,
  MessageCircle
} from 'lucide-react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF5F0' }}>

      {/* ========== TOP BAR ========== */}
      <div style={{ backgroundColor: '#5D3A1A' }} className="hidden md:block">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6 text-sm" style={{ color: '#E8D4C4' }}>
            <a href="mailto:contact@keurgest.sn" className="flex items-center gap-2 hover:text-white transition">
              <Mail className="w-4 h-4" />
              contact@keurgest.sn
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dakar, Sénégal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/221771234567"
              target="_blank"
              className="flex items-center gap-2 text-sm font-medium text-white hover:text-green-300 transition"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp : +221 77 123 45 67
            </a>
          </div>
        </div>
      </div>

      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="KeurGest"
                width={180}
                height={50}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {[
                ['#fonctionnalites', 'Fonctionnalités'],
                ['#tarifs', 'Tarifs'],
                ['#temoignages', 'Témoignages'],
                ['#contact', 'Contact'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm font-medium transition hover:opacity-70"
                  style={{ color: '#5D3A1A' }}
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* CTA Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="tel:+221338001234"
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: '#8B4513' }}
              >
                <Phone className="w-4 h-4" />
                33 800 12 34
              </a>
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-lg transition hover:bg-amber-50"
                style={{ color: '#5D3A1A' }}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold px-6 py-2.5 rounded-lg text-white transition shadow-lg hover:opacity-90"
                style={{ backgroundColor: '#8B4513', boxShadow: '0 4px 14px rgba(139,69,19,0.35)' }}
              >
                Essai Gratuit
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen
                ? <X className="w-6 h-6" style={{ color: '#5D3A1A' }} />
                : <Menu className="w-6 h-6" style={{ color: '#5D3A1A' }} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t" style={{ borderColor: '#F0E6D8' }}>
              <nav className="flex flex-col gap-3">
                {[
                  ['#fonctionnalites', 'Fonctionnalités'],
                  ['#tarifs', 'Tarifs'],
                  ['#temoignages', 'Témoignages'],
                  ['#contact', 'Contact'],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="font-medium py-2 px-2 rounded-lg hover:bg-amber-50"
                    style={{ color: '#5D3A1A' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t" style={{ borderColor: '#F0E6D8' }}>
                  <Link href="/login" className="font-medium text-center py-2" style={{ color: '#5D3A1A' }}>
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="font-semibold text-center py-3 rounded-xl text-white"
                    style={{ backgroundColor: '#8B4513' }}
                  >
                    Essai Gratuit
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section
        className="relative py-20 lg:py-32 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #8B4513 0%, #5D3A1A 100%)' }}
      >
        {/* Pattern décoratif */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Texte */}
            <div className="text-center lg:text-left">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}
              >
                <Star className="w-4 h-4" style={{ color: '#DAA520', fill: '#DAA520' }} />
                Solution N°1 au Sénégal
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Gérez vos biens
                <br />
                <span style={{ color: '#DAA520' }}>en toute simplicité</span>
              </h1>

              <p className="text-lg lg:text-xl mb-8 leading-relaxed" style={{ color: '#E8D4C4' }}>
                La solution complète pour les propriétaires et agences immobilières au Sénégal.
                Suivez vos loyers, gérez vos locataires et générez vos quittances en quelques clics.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:opacity-90 shadow-xl"
                  style={{ backgroundColor: '#DAA520', color: '#5D3A1A', boxShadow: '0 8px 24px rgba(218,165,32,0.4)' }}
                >
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#fonctionnalites"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg text-white transition-all border-2 hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  <Play className="w-5 h-5" />
                  Voir les fonctionnalités
                </a>
              </div>
            </div>

            {/* Aperçu Dashboard */}
            <div className="hidden lg:block relative">
              <div
                className="relative bg-white rounded-2xl p-4 transform rotate-1"
                style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.35)' }}
              >
                {/* Barre de titre */}
                <div className="h-8 flex items-center gap-2 px-4 rounded-t-lg mb-3" style={{ backgroundColor: '#5D3A1A' }}>
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-3 text-xs text-white/60">KeurGest Dashboard</div>
                </div>

                <div className="rounded-lg overflow-hidden p-4" style={{ backgroundColor: '#FAF5F0' }}>
                  {/* Mini stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Biens', value: '12', color: '#8B4513', bg: '#FFF5EB' },
                      { label: 'Locataires', value: '28', color: '#556B2F', bg: '#F0F5E8' },
                      { label: 'Revenus', value: '2.4M', color: '#DAA520', bg: '#FDF8E8' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#8B7355' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Mini rows */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm mb-2">
                      <div className="w-9 h-9 rounded-lg flex-shrink-0" style={{ backgroundColor: '#FFF5EB' }} />
                      <div className="flex-1">
                        <div className="h-2.5 rounded w-3/4 mb-1.5" style={{ backgroundColor: '#E8DDD0' }} />
                        <div className="h-2 rounded w-1/2" style={{ backgroundColor: '#F0E6D8' }} />
                      </div>
                      <div className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#556B2F' }}>
                        Payé
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div
                className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 flex items-center gap-3"
                style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F5E8' }}>
                  <TrendingUp className="w-6 h-6" style={{ color: '#556B2F' }} />
                </div>
                <div>
                  <div className="text-xs" style={{ color: '#8B7355' }}>Revenus ce mois</div>
                  <div className="text-xl font-bold" style={{ color: '#556B2F' }}>+24 %</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BARRE DE STATS ========== */}
      <section className="py-10 bg-white border-b" style={{ borderColor: '#F0E6D8' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Propriétaires actifs', icon: Users },
              { value: '2 500+', label: 'Biens gérés', icon: Building2 },
              { value: '10 000+', label: 'Loyers traités', icon: Wallet },
              { value: '98 %', label: 'Satisfaction client', icon: Star },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF5EB' }}>
                  <s.icon className="w-6 h-6" style={{ color: '#8B4513' }} />
                </div>
                <div className="text-3xl font-bold" style={{ color: '#5D3A1A' }}>{s.value}</div>
                <div className="text-sm" style={{ color: '#8B7355' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== À PROPOS ========== */}
      <section className="py-20" style={{ backgroundColor: '#FAF5F0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Visuel */}
            <div className="relative">
              <div
                className="aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center shadow-xl"
                style={{ background: 'linear-gradient(135deg, #E8DDD0, #F0E6D8)' }}
              >
                <Building2 className="w-40 h-40" style={{ color: '#8B4513', opacity: 0.25 }} />
              </div>
              {/* Badge */}
              <div
                className="absolute -bottom-6 -right-4 text-white rounded-2xl px-7 py-5 shadow-xl"
                style={{ background: 'linear-gradient(135deg, #8B4513, #5D3A1A)' }}
              >
                <div className="text-4xl font-bold leading-none">5+</div>
                <div className="text-sm mt-1" style={{ color: '#E8D4C4' }}>années<br />d&apos;expertise</div>
              </div>
            </div>

            {/* Texte */}
            <div>
              <div
                className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
                style={{ backgroundColor: '#FFF5EB', color: '#8B4513' }}
              >
                À propos d&apos;KeurGest
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#5D3A1A' }}>
                Une solution pensée pour le marché sénégalais
              </h2>
              <p className="text-base lg:text-lg mb-5 leading-relaxed" style={{ color: '#6B5B4F' }}>
                KeurGest est né de la volonté de simplifier la gestion immobilière au Sénégal.
                Notre plateforme répond aux besoins spécifiques des propriétaires et agences locales :
                gestion des loyers en FCFA, quittances conformes, alertes automatiques.
              </p>
              <p className="text-base lg:text-lg mb-10 leading-relaxed" style={{ color: '#6B5B4F' }}>
                Nous accompagnons des centaines de propriétaires dans la gestion quotidienne
                de leur patrimoine, leur permettant de gagner du temps et de sécuriser leurs
                revenus locatifs.
              </p>

              <div className="grid grid-cols-2 gap-5">
                {[
                  { icon: Shield, label: 'Données sécurisées' },
                  { icon: Clock,  label: 'Gain de temps' },
                  { icon: Award,  label: 'Support local' },
                  { icon: TrendingUp, label: 'Revenus optimisés' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFF5EB' }}>
                      <item.icon className="w-5 h-5" style={{ color: '#8B4513' }} />
                    </div>
                    <span className="font-medium text-sm" style={{ color: '#5D3A1A' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FONCTIONNALITÉS ========== */}
      <section id="fonctionnalites" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              style={{ backgroundColor: '#FFF5EB', color: '#8B4513' }}
            >
              Fonctionnalités
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#5D3A1A' }}>
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8B7355' }}>
              Une plateforme complète pour gérer efficacement votre patrimoine immobilier
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: 'Gestion des biens',
                desc: "Centralisez tous vos biens : appartements, villas, immeubles, terrains. Suivez leur état et leur rentabilité en temps réel.",
                color: '#8B4513', bg: '#FFF5EB',
              },
              {
                icon: Users,
                title: 'Suivi des locataires',
                desc: "Gérez vos locataires, leurs contrats et leurs contacts. Accédez à l'historique complet de chaque location.",
                color: '#556B2F', bg: '#F0F5E8',
              },
              {
                icon: Wallet,
                title: 'Suivi des paiements',
                desc: 'Enregistrez les loyers perçus, détectez les retards automatiquement. Support Wave, Orange Money, espèces.',
                color: '#DAA520', bg: '#FDF8E8',
              },
              {
                icon: Bell,
                title: 'Alertes intelligentes',
                desc: "Recevez des notifications pour les loyers impayés, les contrats qui expirent et les échéances importantes.",
                color: '#DC2626', bg: '#FEF2F2',
              },
              {
                icon: FileText,
                title: 'Quittances PDF',
                desc: "Générez des quittances professionnelles avec votre logo, conformes aux normes sénégalaises, en un clic.",
                color: '#8B4513', bg: '#FFF5EB',
              },
              {
                icon: BarChart3,
                title: 'Rapports détaillés',
                desc: "Analysez vos revenus, votre taux d'occupation et exportez vos données en Excel pour votre comptabilité.",
                color: '#556B2F', bg: '#F0F5E8',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ borderColor: '#F0E6D8', backgroundColor: '#FFFFFF' }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: f.bg }}
                >
                  <f.icon className="w-7 h-7" style={{ color: f.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#5D3A1A' }}>{f.title}</h3>
                <p className="leading-relaxed text-sm" style={{ color: '#6B5B4F' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TARIFS ========== */}
      <section id="tarifs" className="py-20" style={{ backgroundColor: '#FAF5F0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              style={{ backgroundColor: '#FFF5EB', color: '#8B4513' }}
            >
              Tarifs
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#5D3A1A' }}>
              Des tarifs simples et transparents
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8B7355' }}>
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Starter */}
            <div className="bg-white p-8 rounded-2xl border-2 transition-all hover:shadow-xl" style={{ borderColor: '#E8DDD0' }}>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-1" style={{ color: '#5D3A1A' }}>Starter</h3>
                <p className="text-sm mb-5" style={{ color: '#8B7355' }}>Pour démarrer</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold" style={{ color: '#5D3A1A' }}>0</span>
                  <span className="text-lg mb-1" style={{ color: '#8B7355' }}>FCFA/mois</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {["Jusqu'à 3 biens", "Jusqu'à 5 locataires", 'Quittances PDF', 'Support email'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#556B2F' }} />
                    <span style={{ color: '#5D3A1A' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full py-3.5 text-center border-2 rounded-xl font-semibold text-sm transition hover:bg-amber-50"
                style={{ borderColor: '#8B4513', color: '#8B4513' }}
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Pro — mis en avant */}
            <div
              className="p-8 rounded-2xl shadow-2xl relative"
              style={{ background: 'linear-gradient(145deg, #8B4513, #5D3A1A)', transform: 'scale(1.05)' }}
            >
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-xs font-bold tracking-wider"
                style={{ backgroundColor: '#DAA520', color: '#5D3A1A' }}
              >
                POPULAIRE
              </div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                <p className="text-sm mb-5" style={{ color: '#E8D4C4' }}>Pour les propriétaires</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold text-white">15 000</span>
                  <span className="text-lg mb-1" style={{ color: '#E8D4C4' }}>FCFA/mois</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {["Jusqu'à 20 biens", 'Locataires illimités', 'Alertes automatiques', 'Rapports avancés', 'Export Excel', 'Support prioritaire'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#DAA520' }} />
                    <span className="text-white">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full py-3.5 text-center rounded-xl font-semibold text-sm transition hover:opacity-90"
                style={{ backgroundColor: '#FFFFFF', color: '#8B4513' }}
              >
                Essayer Pro gratuitement
              </Link>
            </div>

            {/* Business */}
            <div className="bg-white p-8 rounded-2xl border-2 transition-all hover:shadow-xl" style={{ borderColor: '#E8DDD0' }}>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-1" style={{ color: '#5D3A1A' }}>Business</h3>
                <p className="text-sm mb-5" style={{ color: '#8B7355' }}>Pour les agences</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold" style={{ color: '#5D3A1A' }}>30 000</span>
                  <span className="text-lg mb-1" style={{ color: '#8B7355' }}>FCFA/mois</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {['Biens illimités', 'Tout Pro inclus', 'Multi-utilisateurs', 'Personnalisation avancée', 'Accès API', 'Support dédié'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#556B2F' }} />
                    <span style={{ color: '#5D3A1A' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full py-3.5 text-center border-2 rounded-xl font-semibold text-sm transition hover:bg-amber-50"
                style={{ borderColor: '#8B4513', color: '#8B4513' }}
              >
                Contacter les ventes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TÉMOIGNAGES ========== */}
      <section id="temoignages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              style={{ backgroundColor: '#FFF5EB', color: '#8B4513' }}
            >
              Témoignages
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#5D3A1A' }}>
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Abdoulaye Diallo',
                role: 'Propriétaire, 12 appartements',
                text: "KeurGest m'a fait gagner plus de 5 heures par semaine. Plus besoin de noter les loyers sur papier, tout est centralisé et automatisé !",
                avatar: 'AD',
              },
              {
                name: 'Fatou Sow',
                role: 'Directrice, Agence ImmoPlus',
                text: "Les alertes automatiques m'ont permis de réduire mes impayés de 60 %. Un outil indispensable pour toute agence professionnelle.",
                avatar: 'FS',
              },
              {
                name: 'Mamadou Ndiaye',
                role: 'Investisseur immobilier, Dakar',
                text: "Enfin une solution adaptée au marché sénégalais ! L'interface est simple et les quittances sont parfaites.",
                avatar: 'MN',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl border-2 transition-all hover:shadow-lg"
                style={{ borderColor: '#F0E6D8' }}
              >
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5" style={{ color: '#DAA520', fill: '#DAA520' }} />
                  ))}
                </div>
                <p className="text-base mb-6 leading-relaxed" style={{ color: '#5D3A1A' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: '#8B4513' }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#5D3A1A' }}>{t.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#8B7355' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #8B4513 0%, #5D3A1A 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à simplifier votre gestion immobilière ?
          </h2>
          <p className="text-xl mb-10" style={{ color: '#E8D4C4' }}>
            Rejoignez des centaines de propriétaires qui font confiance à KeurGest
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:opacity-90 shadow-xl"
              style={{ backgroundColor: '#DAA520', color: '#5D3A1A', boxShadow: '0 8px 24px rgba(218,165,32,0.4)' }}
            >
              Créer mon compte gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+221771234567"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg text-white transition-all border-2 hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <Phone className="w-5 h-5" />
              Nous appeler
            </a>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer id="contact" style={{ backgroundColor: '#3D2914' }} className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Logo & description */}
            <div className="md:col-span-2">
              <Image
                src="/logo.png"
                alt="KeurGest"
                width={150}
                height={40}
                className="h-12 w-auto mb-6 brightness-0 invert"
              />
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#C4A882' }}>
                KeurGest est la solution de gestion immobilière conçue pour les propriétaires
                et agences au Sénégal. Simplifiez votre quotidien, sécurisez vos revenus.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/221771234567"
                  target="_blank"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition hover:opacity-80"
                  style={{ backgroundColor: '#25D366', color: 'white' }}
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="mailto:contact@keurgest.sn"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition hover:opacity-80"
                  style={{ backgroundColor: '#8B4513', color: 'white' }}
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Liens produit */}
            <div>
              <h4 className="font-semibold text-white mb-5 text-sm tracking-wide uppercase">Produit</h4>
              <ul className="space-y-3 text-sm" style={{ color: '#C4A882' }}>
                {[
                  ['#fonctionnalites', 'Fonctionnalités'],
                  ['#tarifs', 'Tarifs'],
                  ['/login', 'Connexion'],
                  ['/register', 'Inscription'],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="hover:text-white transition">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-5 text-sm tracking-wide uppercase">Contact</h4>
              <ul className="space-y-3 text-sm" style={{ color: '#C4A882' }}>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  +221 77 123 45 67
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  contact@keurgest.sn
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Dakar, Sénégal
                </li>
              </ul>
            </div>
          </div>

          <div
            className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
            style={{ borderColor: '#5D3A1A', color: '#C4A882' }}
          >
            <p>© 2026 KeurGest — Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Conditions d&apos;utilisation</a>
              <a href="#" className="hover:text-white transition">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
