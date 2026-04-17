'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Charge, ChargeFormData, PeriodiciteCharge } from '@/types'

// ── Stats ──────────────────────────────────────────────────────────────────────
export interface ChargeStats {
  total: number
  montantMensuel: number   // somme des charges mensuelles
  montantAnnuel: number    // équivalent annuel de toutes les charges
  incluses: number
  nonIncluses: number
}

function montantAnnuel(montant: number, periodicite: string): number {
  switch (periodicite as PeriodiciteCharge) {
    case 'mensuel':      return montant * 12
    case 'trimestriel':  return montant * 4
    case 'annuel':       return montant
    default:             return 0       // ponctuel : non inclus dans l'annuel
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useCharges(bienId?: string) {
  const [charges,   setCharges]   = useState<Charge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  const fetchCharges = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      let query = supabase
        .from('charges')
        .select('*, bien:biens(id, nom, adresse, ville)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (bienId) query = query.eq('bien_id', bienId)

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setCharges((data as Charge[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }, [bienId])

  useEffect(() => { fetchCharges() }, [fetchCharges])

  // ── Stats calculées ──────────────────────────────────────────────────────────
  const stats: ChargeStats = {
    total:          charges.length,
    montantMensuel: charges
      .filter(c => c.periodicite === 'mensuel')
      .reduce((s, c) => s + c.montant, 0),
    montantAnnuel:  charges.reduce((s, c) => s + montantAnnuel(c.montant, c.periodicite), 0),
    incluses:       charges.filter(c => c.inclus_loyer).length,
    nonIncluses:    charges.filter(c => !c.inclus_loyer).length,
  }

  // ── CRUD — retournent { data, error } pour compatibilité avec les pages ──────
  const createCharge = async (formData: ChargeFormData) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('charges')
        .insert({ ...formData, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      setCharges(prev => [data as Charge, ...prev])
      return { data: data as Charge, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  const updateCharge = async (id: string, formData: Partial<ChargeFormData>) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('charges')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCharges(prev => prev.map(c => c.id === id ? data as Charge : c))
      return { data: data as Charge, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  const deleteCharge = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('charges').delete().eq('id', id)
      if (error) throw error
      setCharges(prev => prev.filter(c => c.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  return {
    charges,
    isLoading,
    error,
    stats,
    refetch: fetchCharges,
    createCharge,
    updateCharge,
    deleteCharge,
  }
}

export default useCharges
