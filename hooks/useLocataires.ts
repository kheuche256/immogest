'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Locataire, LocataireFormData } from '@/types'

// ─── Re-exports pour compatibilité directe ───────────────────────────────────
export type { Locataire, LocataireFormData }

// ─── État interne ─────────────────────────────────────────────────────────────
interface UseLocatairesState {
  locataires: Locataire[]
  isLoading: boolean
  error: Error | null
}

// ─── Hook principal ───────────────────────────────────────────────────────────
export function useLocataires() {
  const [state, setState] = useState<UseLocatairesState>({
    locataires: [],
    isLoading: true,
    error: null,
  })

  // Client Supabase stable (évite les re-renders)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  // ── Fetch tous les locataires du user ──────────────────────────────────────
  const fetchLocataires = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('locataires')
        .select('*, bien:biens(*), paiements(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      setState({ locataires: (data as Locataire[]) ?? [], isLoading: false, error: null })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }))
    }
  }, [supabase])

  useEffect(() => {
    fetchLocataires()
  }, [fetchLocataires])

  // ── Créer un locataire ─────────────────────────────────────────────────────
  const createLocataire = useCallback(
    async (formData: LocataireFormData): Promise<Locataire> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Non authentifié')

      // Normaliser : depot_garantie → caution
      const payload = normalizePayload(formData)

      const { data, error } = await supabase
        .from('locataires')
        .insert([{ ...payload, user_id: user.id }])
        .select('*, bien:biens(*)')
        .single()

      if (error) throw new Error(error.message)

      const nouveau = data as Locataire

      // Mise à jour optimiste
      setState((prev) => ({
        ...prev,
        locataires: [nouveau, ...prev.locataires],
      }))

      // Si un bien est assigné, le passer en statut 'loue'
      if (payload.bien_id) {
        await supabase
          .from('biens')
          .update({ statut: 'loue' })
          .eq('id', payload.bien_id)
      }

      return nouveau
    },
    [supabase]
  )

  // ── Modifier un locataire ──────────────────────────────────────────────────
  const updateLocataire = useCallback(
    async (id: string, formData: Partial<LocataireFormData>): Promise<Locataire> => {
      // Récupérer l'ancien bien_id depuis le cache local
      const ancien = state.locataires.find((l) => l.id === id)
      const ancienBienId = ancien?.bien_id ?? null

      const payload = normalizePayload(formData)

      const { data, error } = await supabase
        .from('locataires')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, bien:biens(*)')
        .single()

      if (error) throw new Error(error.message)

      const updated = data as Locataire

      // Mise à jour optimiste dans la liste
      setState((prev) => ({
        ...prev,
        locataires: prev.locataires.map((l) => (l.id === id ? updated : l)),
      }))

      // Gestion statut des biens
      const nouveauBienId = payload.bien_id ?? null

      if (ancienBienId && ancienBienId !== nouveauBienId) {
        // L'ancien bien redevient disponible
        await supabase
          .from('biens')
          .update({ statut: 'disponible' })
          .eq('id', ancienBienId)
      }

      if (nouveauBienId && nouveauBienId !== ancienBienId) {
        // Le nouveau bien passe à loué
        await supabase
          .from('biens')
          .update({ statut: 'loue' })
          .eq('id', nouveauBienId)
      }

      return updated
    },
    [supabase, state.locataires]
  )

  // ── Supprimer un locataire ────────────────────────────────────────────────
  const deleteLocataire = useCallback(
    async (id: string): Promise<void> => {
      // Récupérer bien_id depuis le cache avant suppression
      const locataire = state.locataires.find((l) => l.id === id)
      const bienId = locataire?.bien_id ?? null

      const { error } = await supabase.from('locataires').delete().eq('id', id)

      if (error) throw new Error(error.message)

      // Mise à jour optimiste
      setState((prev) => ({
        ...prev,
        locataires: prev.locataires.filter((l) => l.id !== id),
      }))

      // Remettre le bien disponible
      if (bienId) {
        await supabase
          .from('biens')
          .update({ statut: 'disponible' })
          .eq('id', bienId)
      }
    },
    [supabase, state.locataires]
  )

  // ── Récupérer un locataire par ID ─────────────────────────────────────────
  const getLocataire = useCallback(
    async (id: string): Promise<Locataire | null> => {
      // Cache local d'abord
      const cached = state.locataires.find((l) => l.id === id)
      if (cached) return cached

      const { data, error } = await supabase
        .from('locataires')
        .select('*, bien:biens(*), paiements(*)')
        .eq('id', id)
        .single()

      if (error) return null
      return data as Locataire
    },
    [supabase, state.locataires]
  )

  // ── Assigner / désassigner un bien ────────────────────────────────────────
  const assignBien = useCallback(
    async (locataireId: string, bienId: string): Promise<void> => {
      await updateLocataire(locataireId, { bien_id: bienId })
    },
    [updateLocataire]
  )

  const unassignBien = useCallback(
    async (locataireId: string): Promise<void> => {
      await updateLocataire(locataireId, { bien_id: null })
    },
    [updateLocataire]
  )

  // ── Changer le statut d'un locataire ─────────────────────────────────────
  const changerStatut = useCallback(
    async (id: string, statut: Locataire['statut']): Promise<void> => {
      await updateLocataire(id, { statut })
    },
    [updateLocataire]
  )

  // ── Filtrage côté client ──────────────────────────────────────────────────
  const filterLocataires = useCallback(
    (opts: {
      search?: string
      statut?: string
      bienId?: string
      avecBien?: boolean
    }) => {
      return state.locataires.filter((l) => {
        if (opts.search) {
          const q = opts.search.toLowerCase()
          const fullName = l.nom.toLowerCase()
          const match =
            fullName.includes(q) ||
            l.telephone.includes(q) ||
            (l.email ?? '').toLowerCase().includes(q) ||
            (l.profession ?? '').toLowerCase().includes(q)
          if (!match) return false
        }
        if (opts.statut && l.statut !== opts.statut) return false
        if (opts.bienId && l.bien_id !== opts.bienId) return false
        if (opts.avecBien !== undefined) {
          if (opts.avecBien && !l.bien_id) return false
          if (!opts.avecBien && l.bien_id) return false
        }
        return true
      })
    },
    [state.locataires]
  )

  // ── Contrats expirant bientôt (≤ 30 jours) ────────────────────────────────
  const contratsExpirantBientot = useCallback(
    (joursAvant = 30): Locataire[] => {
      const limite = new Date()
      limite.setDate(limite.getDate() + joursAvant)

      return state.locataires.filter((l) => {
        if (!l.date_fin_contrat) return false
        const fin = new Date(l.date_fin_contrat)
        const now = new Date()
        return fin > now && fin <= limite
      })
    },
    [state.locataires]
  )

  // ── Stats dérivées ────────────────────────────────────────────────────────
  const stats = {
    total:      state.locataires.length,
    actifs:     state.locataires.filter((l) => l.statut === 'actif').length,
    partis:     state.locataires.filter((l) => l.statut === 'parti' || l.statut === 'inactif').length,
    enAttente:  state.locataires.filter((l) => l.statut === 'en_attente').length,
    enRetard:   state.locataires.filter((l) => l.statut === 'en_retard').length,
    avecBien:   state.locataires.filter((l) => !!l.bien_id).length,
    sansBien:   state.locataires.filter((l) => !l.bien_id).length,
    revenusMensuels: state.locataires
      .filter((l) => l.statut === 'actif')
      .reduce((sum, l) => sum + (l.bien?.loyer_mensuel ?? 0), 0),
  }

  return {
    // État
    locataires: state.locataires,
    isLoading:  state.isLoading,
    error:      state.error,

    // CRUD
    createLocataire,
    updateLocataire,
    deleteLocataire,
    getLocataire,

    // Actions métier
    assignBien,
    unassignBien,
    changerStatut,

    // Utilitaires
    filterLocataires,
    contratsExpirantBientot,
    refetch: fetchLocataires,

    // Stats dérivées
    stats,
  }
}

// ─── Utilitaire interne ───────────────────────────────────────────────────────

// Colonnes exactes de la table locataires dans Supabase
const LOCATAIRE_DB_COLUMNS = new Set([
  'bien_id', 'nom', 'telephone', 'email', 'cni', 'profession',
  'date_entree', 'date_fin_contrat', 'depot_garantie', 'statut',
])

/**
 * Normalise le payload avant envoi en DB :
 * - Fusionne prenom + nom en un seul champ nom
 * - Filtre uniquement les colonnes qui existent dans Supabase
 * - Supprime les clés undefined
 */
function normalizePayload<T extends Partial<LocataireFormData>>(data: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  // Fusionner prenom + nom → nom (prenom est UI uniquement)
  const prenom = (data as Record<string, unknown>)['prenom']
  const nom    = (data as Record<string, unknown>)['nom']
  if (typeof nom === 'string') {
    const fullName = prenom
      ? `${String(prenom).trim()} ${String(nom).trim()}`.trim()
      : String(nom).trim()
    if (fullName) out['nom'] = fullName
  }

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    if (key === 'prenom' || key === 'nom') continue  // déjà géré ci-dessus
    if (!LOCATAIRE_DB_COLUMNS.has(key)) continue     // colonne absente → ignorée
    out[key] = value
  }

  return out
}
