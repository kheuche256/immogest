'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Reservation, ReservationFormData, StatutReservation } from '@/types'

// ── Types internes ─────────────────────────────────────────────────────────────
export interface ReservationStats {
  total: number
  en_attente: number
  confirmees: number
  en_cours: number
  terminees: number
  annulees: number
  revenusMois: number
  revenusTotal: number
}

export interface DisponibiliteResult {
  disponible: boolean
  conflits: Reservation[]
}

// ── Hook principal : liste des réservations ────────────────────────────────────
export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReservations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select(`
          *,
          bien:biens(id, nom, adresse, ville, tarif_nuit, est_meuble),
          locataire:locataires(id, nom, telephone, email)
        `)
        .eq('user_id', user.id)
        .order('date_debut', { ascending: false })

      if (fetchError) throw fetchError
      setReservations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  // ── Stats calculées ──────────────────────────────────────────────────────────
  const stats: ReservationStats = (() => {
    const moisActuel = new Date().toISOString().slice(0, 7)
    return {
      total:      reservations.length,
      en_attente: reservations.filter(r => r.statut === 'en_attente').length,
      confirmees: reservations.filter(r => r.statut === 'confirmee').length,
      en_cours:   reservations.filter(r => r.statut === 'en_cours').length,
      terminees:  reservations.filter(r => r.statut === 'terminee').length,
      annulees:   reservations.filter(r => r.statut === 'annulee').length,
      revenusMois: reservations
        .filter(r =>
          (r.statut === 'terminee' || r.statut === 'en_cours') &&
          r.date_debut.startsWith(moisActuel)
        )
        .reduce((sum, r) => sum + r.montant_total, 0),
      revenusTotal: reservations
        .filter(r => r.statut === 'terminee' || r.statut === 'en_cours')
        .reduce((sum, r) => sum + r.montant_total, 0),
    }
  })()

  // ── Vérifier disponibilité ───────────────────────────────────────────────────
  const verifierDisponibilite = useCallback(async (
    bienId: string,
    dateDebut: string,
    dateFin: string,
    excludeId?: string
  ): Promise<DisponibiliteResult> => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { disponible: false, conflits: [] }

      let query = supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .eq('bien_id', bienId)
        .not('statut', 'in', '("annulee")')
        .or(`date_debut.lte.${dateFin},date_fin.gte.${dateDebut}`)

      if (excludeId) query = query.neq('id', excludeId)

      const { data } = await query

      // Vérifier chevauchement exact
      const conflits = (data || []).filter(r => {
        const rdebut = r.date_debut
        const rfin   = r.date_fin
        return dateDebut < rfin && dateFin > rdebut
      })

      return { disponible: conflits.length === 0, conflits }
    } catch {
      return { disponible: false, conflits: [] }
    }
  }, [])

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const creerReservation = useCallback(async (formData: ReservationFormData): Promise<Reservation> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    // Calcul nb_nuits et montants
    const debut = new Date(formData.date_debut)
    const fin   = new Date(formData.date_fin)
    const nbNuits = Math.max(1, Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)))
    const montantTotal  = nbNuits * formData.tarif_nuitee
    const acompte       = formData.acompte || 0
    const montantRestant = montantTotal - acompte

    const payload = {
      user_id:          user.id,
      bien_id:          formData.bien_id,
      locataire_id:     formData.locataire_id || null,
      client_nom:       formData.client_nom,
      client_telephone: formData.client_telephone,
      client_email:     formData.client_email || null,
      date_debut:       formData.date_debut,
      date_fin:         formData.date_fin,
      tarif_nuitee:     formData.tarif_nuitee,
      nb_nuits:         nbNuits,
      montant_total:    montantTotal,
      acompte:          acompte,
      montant_restant:  montantRestant,
      statut:           formData.statut || 'en_attente',
      notes:            formData.notes || null,
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert(payload)
      .select(`
        *,
        bien:biens(id, nom, adresse, ville, tarif_nuit, est_meuble),
        locataire:locataires(id, nom, telephone, email)
      `)
      .single()

    if (error) throw error
    setReservations(prev => [data, ...prev])
    return data
  }, [])

  const mettreAJourStatut = useCallback(async (
    id: string,
    statut: StatutReservation
  ): Promise<void> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reservations')
      .update({ statut, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...data } : r))
  }, [])

  const supprimerReservation = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient()
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)

    if (error) throw error
    setReservations(prev => prev.filter(r => r.id !== id))
  }, [])

  const mettreAJour = useCallback(async (
    id: string,
    formData: Partial<ReservationFormData>
  ): Promise<Reservation> => {
    const supabase = createClient()

    let updates: Record<string, unknown> = {
      ...formData,
      updated_at: new Date().toISOString(),
    }

    // Recalcul si dates ou tarif modifiés
    if (formData.date_debut || formData.date_fin || formData.tarif_nuitee) {
      const existing = reservations.find(r => r.id === id)
      if (existing) {
        const debut = new Date(formData.date_debut || existing.date_debut)
        const fin   = new Date(formData.date_fin   || existing.date_fin)
        const tarif = formData.tarif_nuitee ?? existing.tarif_nuitee
        const acomp = formData.acompte ?? existing.acompte
        const nbNuits = Math.max(1, Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)))
        const montantTotal   = nbNuits * tarif
        const montantRestant = montantTotal - acomp
        updates = { ...updates, nb_nuits: nbNuits, montant_total: montantTotal, montant_restant: montantRestant }
      }
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        bien:biens(id, nom, adresse, ville, tarif_nuit, est_meuble),
        locataire:locataires(id, nom, telephone, email)
      `)
      .single()

    if (error) throw error
    setReservations(prev => prev.map(r => r.id === id ? data : r))
    return data
  }, [reservations])

  return {
    reservations,
    isLoading,
    error,
    stats,
    refetch:              fetchReservations,
    creerReservation,
    mettreAJour,
    mettreAJourStatut,
    supprimerReservation,
    verifierDisponibilite,
  }
}

// ── Hook pour une seule réservation ───────────────────────────────────────────
export function useReservation(id: string | null) {
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('reservations')
          .select(`
            *,
            bien:biens(id, nom, adresse, ville, tarif_nuit, est_meuble),
            locataire:locataires(id, nom, telephone, email)
          `)
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        setReservation(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'))
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [id])

  return { reservation, isLoading, error }
}

export default useReservations
