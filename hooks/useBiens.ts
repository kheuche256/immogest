'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bien, BienFormData } from '@/types'

// ─── Re-export pour compatibilité directe ────────────────────────────────────
export type { Bien, BienFormData }

// ─── État interne ─────────────────────────────────────────────────────────────
interface UseBiensState {
  biens: Bien[]
  isLoading: boolean
  error: Error | null
}

// ─── Hook principal ───────────────────────────────────────────────────────────
export function useBiens() {
  const [state, setState] = useState<UseBiensState>({
    biens: [],
    isLoading: true,
    error: null,
  })

  // Utiliser un ref stable pour le client Supabase (évite re-renders)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  // ── Fetch tous les biens du user connecté ──────────────────────────────────
  const fetchBiens = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('biens')
        .select('*, locataires(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      setState({ biens: (data as Bien[]) ?? [], isLoading: false, error: null })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }))
    }
  }, [supabase])

  useEffect(() => {
    fetchBiens()
  }, [fetchBiens])

  // ── Créer un nouveau bien ──────────────────────────────────────────────────
  const createBien = useCallback(
    async (formData: BienFormData): Promise<Bien> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('biens')
        .insert([{ ...formData, user_id: user.id }])
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Mise à jour optimiste : ajouter le bien en tête de liste
      setState((prev) => ({
        ...prev,
        biens: [data as Bien, ...prev.biens],
      }))

      return data as Bien
    },
    [supabase]
  )

  // ── Modifier un bien existant ──────────────────────────────────────────────
  const updateBien = useCallback(
    async (id: string, formData: Partial<BienFormData>): Promise<Bien> => {
      const { data, error } = await supabase
        .from('biens')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Mise à jour optimiste : remplacer dans la liste
      setState((prev) => ({
        ...prev,
        biens: prev.biens.map((b) => (b.id === id ? (data as Bien) : b)),
      }))

      return data as Bien
    },
    [supabase]
  )

  // ── Supprimer un bien ──────────────────────────────────────────────────────
  const deleteBien = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase.from('biens').delete().eq('id', id)

      if (error) throw new Error(error.message)

      // Mise à jour optimiste : retirer de la liste
      setState((prev) => ({
        ...prev,
        biens: prev.biens.filter((b) => b.id !== id),
      }))
    },
    [supabase]
  )

  // ── Récupérer un bien par ID ───────────────────────────────────────────────
  const getBien = useCallback(
    async (id: string): Promise<Bien | null> => {
      // Chercher d'abord dans le cache local
      const cached = state.biens.find((b) => b.id === id)
      if (cached) return cached

      const { data, error } = await supabase
        .from('biens')
        .select('*, locataires(*)')
        .eq('id', id)
        .single()

      if (error) return null
      return data as Bien
    },
    [supabase, state.biens]
  )

  // ── Recherche / filtrage côté client ──────────────────────────────────────
  const filterBiens = useCallback(
    (opts: {
      search?: string
      type?: string
      statut?: string
      ville?: string
    }) => {
      return state.biens.filter((b) => {
        if (opts.search) {
          const q = opts.search.toLowerCase()
          const match =
            b.nom.toLowerCase().includes(q) ||
            b.adresse.toLowerCase().includes(q) ||
            b.ville.toLowerCase().includes(q) ||
            (b.quartier ?? '').toLowerCase().includes(q)
          if (!match) return false
        }
        if (opts.type && b.type !== opts.type) return false
        if (opts.statut && b.statut !== opts.statut) return false
        if (opts.ville && b.ville !== opts.ville) return false
        return true
      })
    },
    [state.biens]
  )

  // ── Statistiques dérivées ─────────────────────────────────────────────────
  const stats = {
    total: state.biens.length,
    loues: state.biens.filter((b) => b.statut === 'loue').length,
    disponibles: state.biens.filter((b) => b.statut === 'disponible').length,
    en_travaux: state.biens.filter(
      (b) => b.statut === 'en_travaux' || b.statut === 'maintenance'
    ).length,
    revenus_theoriques: state.biens
      .filter((b) => b.statut === 'loue')
      .reduce((sum, b) => sum + b.loyer_mensuel, 0),
    taux_occupation:
      state.biens.length > 0
        ? Math.round(
            (state.biens.filter((b) => b.statut === 'loue').length /
              state.biens.length) *
              100
          )
        : 0,
  }

  return {
    // État
    biens: state.biens,
    isLoading: state.isLoading,
    error: state.error,

    // CRUD
    createBien,
    updateBien,
    deleteBien,
    getBien,

    // Utilitaires
    filterBiens,
    refetch: fetchBiens,

    // Stats dérivées
    stats,
  }
}
