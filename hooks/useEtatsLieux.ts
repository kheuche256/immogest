'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { EtatLieux, EtatLieuxFormData } from '@/types'

// ── Stats ──────────────────────────────────────────────────────────────────────
export interface EtatsLieuxStats {
  total: number
  entrees: number
  sorties: number
  signes: number
  enAttente: number
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useEtatsLieux(bienId?: string, reservationId?: string) {
  const [etatsLieux, setEtatsLieux] = useState<EtatLieux[]>([])
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  const fetchEtatsLieux = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      let query = supabase
        .from('etats_lieux')
        .select(`
          *,
          bien:biens(id, nom, adresse, ville),
          locataire:locataires(id, nom, telephone),
          reservation:reservations(id, date_debut, date_fin)
        `)
        .eq('user_id', user.id)
        .order('date_etat', { ascending: false })

      if (bienId)       query = query.eq('bien_id', bienId)
      if (reservationId) query = query.eq('reservation_id', reservationId)

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setEtatsLieux((data as EtatLieux[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }, [bienId, reservationId])

  useEffect(() => { fetchEtatsLieux() }, [fetchEtatsLieux])

  // ── Stats calculées ──────────────────────────────────────────────────────────
  const stats: EtatsLieuxStats = {
    total:     etatsLieux.length,
    entrees:   etatsLieux.filter(e => e.type === 'entree').length,
    sorties:   etatsLieux.filter(e => e.type === 'sortie').length,
    signes:    etatsLieux.filter(e => e.signe_proprietaire && e.signe_locataire).length,
    enAttente: etatsLieux.filter(e => !e.signe_proprietaire || !e.signe_locataire).length,
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const createEtatLieux = async (formData: EtatLieuxFormData) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('etats_lieux')
        .insert({
          ...formData,
          user_id:           user.id,
          signe_proprietaire: formData.signe_proprietaire ?? false,
          signe_locataire:    formData.signe_locataire    ?? false,
        })
        .select()
        .single()

      if (error) throw error
      await fetchEtatsLieux()
      return { data: data as EtatLieux, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  const updateEtatLieux = async (id: string, formData: Partial<EtatLieuxFormData>) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('etats_lieux')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setEtatsLieux(prev => prev.map(e => e.id === id ? data as EtatLieux : e))
      return { data: data as EtatLieux, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  const deleteEtatLieux = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('etats_lieux').delete().eq('id', id)
      if (error) throw error
      setEtatsLieux(prev => prev.filter(e => e.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  // ── Signature ────────────────────────────────────────────────────────────────
  const signerEtatLieux = async (id: string, qui: 'proprietaire' | 'locataire') => {
    const patch: Record<string, unknown> =
      qui === 'proprietaire'
        ? { signe_proprietaire: true }
        : { signe_locataire: true }

    // Si l'autre partie a déjà signé → date_signature
    const etat = etatsLieux.find(e => e.id === id)
    if (etat) {
      const autreSigne =
        qui === 'proprietaire' ? etat.signe_locataire : etat.signe_proprietaire
      if (autreSigne) patch.date_signature = new Date().toISOString()
    }

    return updateEtatLieux(id, patch as Partial<EtatLieuxFormData>)
  }

  return {
    etatsLieux,
    isLoading,
    error,
    stats,
    refetch: fetchEtatsLieux,
    createEtatLieux,
    updateEtatLieux,
    deleteEtatLieux,
    signerEtatLieux,
  }
}

export default useEtatsLieux
