'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Building2, Users, Wallet, Bell, FileText, BarChart3,
  CheckCircle, ChevronDown, Menu, X, Star, ArrowRight,
  Shield, Zap, TrendingUp, MessageCircle, Mail, Phone, Palette,
} from 'lucide-react'

// ─── Intersection Observer hook ───────────────────────────────────────────────
function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ─── Composants réutilisables ─────────────────────────────────────────────────

function FadeSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useFadeIn()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      backgroundImage: 'linear-gradient(135deg,#0066FF,#00D4AA)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>
      {children}
    </span>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Fonctionnalités', href: '#fonctionnalites' },
    { label: 'Tarifs',          href: '#tarifs' },
    { label: 'FAQ',             href: '#faq' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,14,23,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg,#0066FF,#00D4AA)', boxShadow: '0 4px 12px rgba(0,102,255,0.35)' }}>
            🏠
          </div>
          <span className="text-lg font-bold" style={{
            backgroundImage: 'linear-gradient(135deg,#0066FF,#00D4AA)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>ImmoGest</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">{l.label}</a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">
            Se connecter
          </Link>
          <Link
            href="/register"
            className="text-sm font-bold text-white px-5 py-2 rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg,#0066FF,#00a876)', boxShadow: '0 4px 15px rgba(0,102,255,0.35)' }}
          >
            S'inscrire
          </Link>
        </div>

        {/* Mobile burger */}
        <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-5 pb-5 space-y-3"
          style={{ background: 'rgba(10,14,23,0.98)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="block text-sm text-gray-400 hover:text-white py-2 transition-colors">{l.label}</a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="flex-1 text-center text-sm text-gray-300 border border-white/10 rounded-xl py-2.5">
              Se connecter
            </Link>
            <Link href="/register" className="flex-1 text-center text-sm font-bold text-white rounded-xl py-2.5"
              style={{ background: 'linear-gradient(135deg,#0066FF,#00a876)' }}>
              S'inscrire
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{ background: 'linear-gradient(180deg,#060b14 0%,#0a1628 50%,#060b14 100%)' }}>

      {/* Orbes animés */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle,#0066FF,transparent)', top: '10%', left: '5%', filter: 'blur(80px)' }} />
        <div className="absolute w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#00D4AA,transparent)', top: '30%', right: '5%', filter: 'blur(80px)', animation: 'pulse 3s ease-in-out 1s infinite' }} />
        <div className="absolute w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#9370DB,transparent)', bottom: '10%', left: '30%', filter: 'blur(60px)', animation: 'pulse 4s ease-in-out 0.5s infinite' }} />
        {/* Grille */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{ background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.25)', color: '#60a5fa' }}>
          <Zap size={12} />
          Nouvelle version disponible — v2.0
        </div>

        {/* Titre */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Gérez vos biens immobiliers<br />
          <GradientText>en toute simplicité</GradientText>
        </h1>

        {/* Sous-titre */}
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          La solution complète pour les propriétaires et agences au Sénégal.
          Suivez vos loyers, gérez vos locataires, générez vos quittances — tout en un.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href="/register"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#0066FF,#00D4AA)', boxShadow: '0 8px 30px rgba(0,102,255,0.4)' }}
          >
            Commencer gratuitement
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Se connecter
          </Link>
        </div>

        {/* Dashboard preview */}
        <div className="relative mx-auto max-w-3xl">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(17,24,39,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Fausse topbar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <div className="flex-1 text-center text-xs text-gray-600">app.immogest.sn/dashboard</div>
            </div>
            {/* Stats simulées */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Biens', val: '12', color: '#0066FF', icon: '🏢' },
                { label: 'Locataires', val: '18', color: '#00C48C', icon: '👥' },
                { label: 'Revenus mois', val: '2.4M FCFA', color: '#FFB800', icon: '💰' },
                { label: 'Taux occup.', val: '94%', color: '#9370DB', icon: '📊' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3"
                  style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                  <div className="text-base font-bold text-white">{s.val}</div>
                </div>
              ))}
            </div>
            {/* Faux graphique */}
            <div className="px-6 pb-6">
              <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xs text-gray-500 mb-3">Évolution des revenus</div>
                <div className="flex items-end gap-2 h-20">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t transition-all"
                      style={{ height: `${h}%`, background: i % 2 === 0 ? 'rgba(0,102,255,0.6)' : 'rgba(0,196,140,0.7)' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow sous le dashboard */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-20 rounded-full opacity-30 blur-2xl"
            style={{ background: 'linear-gradient(90deg,#0066FF,#00D4AA)' }} />
        </div>
      </div>
    </section>
  )
}

// ─── Problèmes résolus ────────────────────────────────────────────────────────

function Problems() {
  const items = [
    { emoji: '📊', titre: 'Fini les tableaux Excel', desc: 'Centralisez toutes vos données dans une interface moderne et intuitive. Un seul outil pour tout gérer.' },
    { emoji: '💸', titre: 'Fini les oublis de paiement', desc: 'Recevez des alertes automatiques pour les loyers en retard. Ne laissez plus passer aucun impayé.' },
    { emoji: '📄', titre: 'Fini les quittances manuelles', desc: 'Générez vos quittances de loyer en un clic, professionnelles et prêtes à envoyer par WhatsApp.' },
  ]
  return (
    <section className="py-24 px-5" style={{ background: '#060b14' }}>
      <div className="max-w-5xl mx-auto">
        <FadeSection className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Vos problèmes, notre solution</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Stop à la gestion chronophage</h2>
        </FadeSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <FadeSection key={item.titre} delay={i * 100}>
              <div
                className="rounded-2xl p-6 h-full transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(17,24,39,0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.titre}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Fonctionnalités ──────────────────────────────────────────────────────────

function Features() {
  const features = [
    { icon: Building2, emoji: '🏢', titre: 'Gestion des biens', desc: 'Appartements, villas, immeubles… Gérez tout votre parc immobilier en un endroit.', color: '#0066FF' },
    { icon: Users, emoji: '👥', titre: 'Suivi locataires', desc: 'Contacts, contrats, historique complet de chaque locataire.', color: '#00C48C' },
    { icon: Wallet, emoji: '💰', titre: 'Suivi paiements', desc: 'Loyers, retards, modes de paiement — tout est tracé automatiquement.', color: '#FFB800' },
    { icon: Bell, emoji: '🔔', titre: 'Alertes intelligentes', desc: 'Retards, contrats expirants, maintenance — soyez toujours informé.', color: '#ef4444' },
    { icon: FileText, emoji: '📄', titre: 'Quittances PDF', desc: 'Générées automatiquement, professionnelles et personnalisées.', color: '#9370DB' },
    { icon: BarChart3, emoji: '📈', titre: 'Rapports détaillés', desc: "Analysez vos revenus, taux d'occupation et performances.", color: '#20C9C9' },
    { icon: Palette, emoji: '🎨', titre: 'Marque personnalisée', desc: 'Votre logo, vos couleurs, votre nom sur la sidebar et tous vos documents PDF.', color: '#FF6B35' },
  ]

  return (
    <section id="fonctionnalites" className="py-24 px-5" style={{ background: 'linear-gradient(180deg,#060b14,#0a1628)' }}>
      <div className="max-w-5xl mx-auto">
        <FadeSection className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">Fonctionnalités</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Une suite complète d'outils conçue spécifiquement pour le marché immobilier sénégalais.</p>
        </FadeSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FadeSection key={f.titre} delay={i * 80}>
              <div
                className="rounded-2xl p-5 h-full transition-all duration-200"
                style={{
                  background: 'rgba(17,24,39,0.7)',
                  border: `1px solid ${f.color}18`,
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${f.color}40` }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${f.color}18` }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${f.color}15` }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">{f.titre}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Tarifs ───────────────────────────────────────────────────────────────────

function Pricing() {
  const plans = [
    {
      name: 'Starter', badge: null, prix: '0', unite: 'FCFA/mois', tagline: 'Pour démarrer',
      color: '#6b7280',
      features: ['Jusqu\'à 3 biens', 'Jusqu\'à 5 locataires', 'Quittances illimitées', 'Tableau de bord', 'Support par email'],
      cta: 'Commencer', href: '/register',
    },
    {
      name: 'Pro', badge: 'POPULAIRE', prix: '15 000', unite: 'FCFA/mois', tagline: 'Pour les propriétaires',
      color: '#0066FF',
      features: ['Jusqu\'à 20 biens', 'Locataires illimités', 'Quittances illimitées', 'Alertes automatiques', 'Rapports avancés', 'Export Excel', 'Support prioritaire'],
      cta: 'Essayer Pro', href: '/register',
    },
    {
      name: 'Business', badge: null, prix: '30 000', unite: 'FCFA/mois', tagline: 'Pour les agences',
      color: '#9370DB',
      features: ['Biens illimités', 'Locataires illimités', 'Tout Pro inclus', 'Multi-utilisateurs', 'API access', 'Intégration comptable', 'Support dédié 24/7'],
      cta: 'Contacter', href: 'https://wa.me/221000000000',
    },
  ]

  return (
    <section id="tarifs" className="py-24 px-5" style={{ background: '#060b14' }}>
      <div className="max-w-5xl mx-auto">
        <FadeSection className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Tarifs</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Des prix adaptés à votre situation</h2>
          <p className="text-gray-400">Commencez gratuitement. Passez au niveau supérieur quand vous êtes prêt.</p>
        </FadeSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <FadeSection key={plan.name} delay={i * 100}>
              <div
                className="rounded-2xl p-6 flex flex-col h-full relative transition-all duration-300"
                style={{
                  background: plan.badge ? 'rgba(0,102,255,0.08)' : 'rgba(17,24,39,0.8)',
                  border: plan.badge ? '1px solid rgba(0,102,255,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  transform: plan.badge ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: plan.badge ? '0 20px 60px rgba(0,102,255,0.15)' : 'none',
                }}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#0066FF,#00D4AA)' }}>
                    {plan.badge}
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white mb-0.5">{plan.name}</h3>
                  <p className="text-xs text-gray-500">{plan.tagline}</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-white">{plan.prix}</span>
                  <span className="text-sm text-gray-400 ml-1">{plan.unite}</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <CheckCircle size={14} color={plan.color} className="shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className="block text-center py-3 rounded-xl text-sm font-bold transition-all"
                  style={plan.badge
                    ? { background: 'linear-gradient(135deg,#0066FF,#00D4AA)', color: '#fff', boxShadow: '0 4px 20px rgba(0,102,255,0.35)' }
                    : { background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Témoignages ──────────────────────────────────────────────────────────────

function Testimonials() {
  const temoignages = [
    { quote: 'ImmoGest m\'a fait gagner 5 heures par semaine. Plus besoin de gérer mes loyers sur papier !', nom: 'Abdou D.', role: 'Propriétaire, 8 appartements', color: '#0066FF' },
    { quote: 'Les alertes automatiques m\'ont permis de réduire mes impayés de 60%. Incroyable !', nom: 'Fatou S.', role: 'Agence immobilière, Dakar', color: '#00C48C' },
    { quote: 'Enfin une solution adaptée au marché sénégalais. Simple, efficace et en français.', nom: 'Mamadou N.', role: 'Investisseur immobilier', color: '#9370DB' },
  ]

  return (
    <section className="py-24 px-5" style={{ background: 'linear-gradient(180deg,#0a1628,#060b14)' }}>
      <div className="max-w-5xl mx-auto">
        <FadeSection className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">Témoignages</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Ils nous font confiance</h2>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} fill="#FFB800" color="#FFB800" />
            ))}
            <span className="text-sm text-gray-400 ml-2">4.9/5 sur 200+ avis</span>
          </div>
        </FadeSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {temoignages.map((t, i) => (
            <FadeSection key={t.nom} delay={i * 100}>
              <div
                className="rounded-2xl p-6 h-full flex flex-col"
                style={{
                  background: 'rgba(17,24,39,0.8)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={13} fill="#FFB800" color="#FFB800" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg,${t.color},${t.color}99)` }}
                  >
                    {t.nom.split(' ').map((w) => w[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.nom}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  const items = [
    { q: 'Est-ce que mes données sont sécurisées ?', a: 'Oui, nous utilisons un chiffrement de niveau bancaire (AES-256) et vos données sont hébergées sur des serveurs sécurisés avec sauvegardes quotidiennes.' },
    { q: 'Puis-je essayer gratuitement ?', a: 'Oui, le plan Starter est 100% gratuit sans limite de durée. Vous pouvez passer au plan Pro à tout moment sans perdre vos données.' },
    { q: 'Comment fonctionne le paiement ?', a: 'Nous acceptons Wave, Orange Money et les virements bancaires. Paiement mensuel sans engagement, annulable à tout moment.' },
    { q: 'Puis-je exporter mes données ?', a: 'Oui, vous pouvez exporter toutes vos données en format Excel (biens, locataires, paiements, rapports) à tout moment depuis votre tableau de bord.' },
    { q: 'Y a-t-il une application mobile ?', a: 'ImmoGest est une application web responsive qui fonctionne parfaitement sur mobile, tablette et ordinateur — aucune installation requise.' },
  ]

  return (
    <section id="faq" className="py-24 px-5" style={{ background: '#060b14' }}>
      <div className="max-w-2xl mx-auto">
        <FadeSection className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Questions fréquentes</h2>
        </FadeSection>
        <div className="space-y-3">
          {items.map((item, i) => (
            <FadeSection key={i} delay={i * 60}>
              <div
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: open === i ? 'rgba(0,102,255,0.07)' : 'rgba(17,24,39,0.7)',
                  border: open === i ? '1px solid rgba(0,102,255,0.25)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-white pr-4">{item.q}</span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-gray-400 transition-transform duration-200"
                    style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {open === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            </FadeSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Final ────────────────────────────────────────────────────────────────

function CTAFinal() {
  return (
    <section className="py-24 px-5 relative overflow-hidden">
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg,#0a1628,#060b14)' }} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,#0066FF,transparent)', top: '-20%', right: '-10%', filter: 'blur(80px)' }} />
        <div className="absolute w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#00D4AA,transparent)', bottom: '-10%', left: '-5%', filter: 'blur(60px)' }} />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <FadeSection>
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Prêt à simplifier votre<br /><GradientText>gestion immobilière ?</GradientText>
          </h2>
          <p className="text-gray-400 mb-8">
            Rejoignez plus de 500 propriétaires et agences qui font confiance à ImmoGest. Gratuit pour commencer.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#0066FF,#00D4AA)', boxShadow: '0 8px 30px rgba(0,102,255,0.4)' }}
          >
            Créer mon compte gratuitement
            <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-gray-600 mt-4">Aucune carte bancaire requise · Gratuit pour toujours en Starter</p>
        </FadeSection>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-5xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{ background: 'linear-gradient(135deg,#0066FF,#00D4AA)' }}>🏠</div>
              <span className="font-bold text-white">ImmoGest</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              La solution de gestion immobilière conçue pour le Sénégal.
            </p>
            {/* Réseaux sociaux */}
            <div className="flex gap-3">
              {[
                { icon: MessageCircle, label: 'WhatsApp', color: '#25d366', href: 'https://wa.me/221000000000' },
                { icon: Mail, label: 'Email', color: '#0066FF', href: 'mailto:contact@immogest.sn' },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                  <s.icon size={15} color={s.color} />
                </a>
              ))}
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Produit</h4>
            <ul className="space-y-2.5">
              {['Fonctionnalités', 'Tarifs', 'FAQ', 'Nouveautés'].map((l) => (
                <li key={l}><a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Légal</h4>
            <ul className="space-y-2.5">
              {["Conditions d'utilisation", 'Confidentialité', 'Cookies', 'Mentions légales'].map((l) => (
                <li key={l}><a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-xs text-gray-500">
                <Mail size={12} className="shrink-0" />contact@immogest.sn
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-500">
                <Phone size={12} className="shrink-0" />+221 77 000 00 00
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-500">
                <MessageCircle size={12} className="shrink-0" />WhatsApp disponible
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px mb-6" style={{ background: 'rgba(255,255,255,0.06)' }} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© 2026 ImmoGest. Tous droits réservés.</p>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Fait avec <span className="text-red-400">❤️</span> à Dakar, Sénégal
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ background: '#060b14', minHeight: '100vh', fontFamily: 'system-ui,sans-serif' }}>
      <Navbar />
      <Hero />
      <Problems />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTAFinal />
      <Footer />
    </div>
  )
}
