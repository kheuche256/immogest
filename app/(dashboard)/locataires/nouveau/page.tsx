'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, ChevronRight, CheckCircle, X, AlertTriangle } from 'lucide-react'
import { useLocataires } from '@/hooks/useLocataires'
import { useBiens } from '@/hooks/useBiens'
import { LocataireFormData } from '@/types'
import LocataireForm from '@/components/locataires/LocataireForm'

function Toast({ type, msg, onClose }: { type: 'success' | 'error'; msg: string; onClose: () => void }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-fadeInUp"
      style={{
        background: type === 'success' ? 'rgba(0,196,140,0.15)' : 'rgba(255,68,68,0.15)',
        border: `1px solid ${type === 'success' ? 'rgba(0,196,140,0.35)' : 'rgba(255,68,68,0.35)'}`,
        backdropFilter: 'blur(12px)', minWidth: 280,
      }}>
      {type === 'success'
        ? <CheckCircle size={16} style={{ color: '#00C48C', flexShrink: 0 }} />
        : <AlertTriangle size={16} style={{ color: '#FF4444', flexShrink: 0 }} />}
      <span className="text-sm text-white flex-1">{msg}</span>
      <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors ml-2"><X size={14} /></button>
    </div>
  )
}

export default function NouveauLocatairePage() {
  const router = useRouter()
  const { createLocataire } = useLocataires()
  const { biens } = useBiens()
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  async function handleSubmit(data: LocataireFormData) {
    setIsLoading(true)
    try {
      await createLocataire(data)
      setToast({ type: 'success', msg: '👤 Locataire ajouté avec succès !' })
      setTimeout(() => router.push('/locataires'), 1200)
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.message ?? 'Erreur lors de la création' })
      setIsLoading(false)
    }
  }

  return (
    <>
      {toast && <Toast type={toast.type} msg={toast.msg} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/locataires" style={{ color: '#6B7280' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#4D9FFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>
            Locataires
          </Link>
          <ChevronRight size={14} style={{ color: '#4B5563' }} />
          <span style={{ color: '#D1D5DB' }}>Nouveau locataire</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(0,212,170,0.1))' }}>
            <Users size={22} style={{ color: '#10B981' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Ajouter un locataire</h1>
            <p className="text-sm text-gray-500">Renseignez les informations du nouveau locataire</p>
          </div>
        </div>

        <LocataireForm biens={biens} onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </>
  )
}
