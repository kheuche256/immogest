'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Pencil, ChevronRight, CheckCircle, X, AlertTriangle } from 'lucide-react'
import { useLocataires } from '@/hooks/useLocataires'
import { useBiens } from '@/hooks/useBiens'
import { Locataire, LocataireFormData } from '@/types'
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
      <button onClick={onClose} className="text-gray-500 hover:text-white ml-2"><X size={14} /></button>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl p-6"
          style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="h-4 w-40 rounded bg-white/5 mb-5" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-11 rounded-xl bg-white/5" />
            <div className="h-11 rounded-xl bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ModifierLocatairePage() {
  const router  = useRouter()
  const params  = useParams()
  const id      = params.id as string

  const { getLocataire, updateLocataire } = useLocataires()
  const { biens } = useBiens()
  const [locataire, setLocataire] = useState<Locataire | null>(null)
  const [fetching,  setFetching]  = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [notFound,  setNotFound]  = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getLocataire(id)
      if (!data) setNotFound(true)
      else setLocataire(data)
      setFetching(false)
    }
    if (id) load()
  }, [id, getLocataire])

  async function handleSubmit(data: LocataireFormData) {
    if (!locataire) return
    setSaving(true)
    try {
      await updateLocataire(locataire.id, data)
      setToast({ type: 'success', msg: '✅ Locataire modifié avec succès !' })
      setTimeout(() => router.push(`/locataires/${locataire.id}`), 1200)
    } catch (err: any) {
      setToast({ type: 'error', msg: err?.message ?? 'Erreur lors de la modification' })
      setSaving(false)
    }
  }

  const fullName = locataire?.prenom
    ? `${locataire.prenom} ${locataire.nom}`
    : locataire?.nom ?? ''

  if (notFound) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span className="text-5xl">👤</span>
      <p className="text-white font-bold text-lg">Locataire introuvable</p>
      <Link href="/locataires" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #0066FF, #00D4AA)' }}>
        Retour aux locataires
      </Link>
    </div>
  )

  return (
    <>
      {toast && <Toast type={toast.type} msg={toast.msg} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm flex-wrap">
          <Link href="/locataires" style={{ color: '#6B7280' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#4D9FFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>
            Locataires
          </Link>
          <ChevronRight size={14} style={{ color: '#4B5563' }} />
          {locataire && (
            <>
              <Link href={`/locataires/${id}`} style={{ color: '#6B7280' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#4D9FFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>
                {fullName}
              </Link>
              <ChevronRight size={14} style={{ color: '#4B5563' }} />
            </>
          )}
          <span style={{ color: '#D1D5DB' }}>Modifier</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,184,0,0.12)' }}>
            <Pencil size={20} style={{ color: '#FFB800' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {fetching ? 'Chargement…' : `Modifier — ${fullName}`}
            </h1>
            <p className="text-sm text-gray-500">Mettez à jour les informations du locataire</p>
          </div>
        </div>

        {fetching
          ? <FormSkeleton />
          : locataire
            ? <LocataireForm initialData={locataire} biens={biens} onSubmit={handleSubmit} isLoading={saving} />
            : null}
      </div>
    </>
  )
}
