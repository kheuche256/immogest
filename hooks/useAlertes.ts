import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Alerte {
  id: string
  user_id: string
  type: 'retard_paiement' | 'contrat_expire' | 'maintenance'
  titre: string
  message: string | null
  priorite: 'basse' | 'normale' | 'haute' | 'urgente'
  lue: boolean
  locataire_id: string | null
  bien_id: string | null
  created_at: string
  locataire?: any
  bien?: any
}

export interface AlerteFormData {
  type: string
  titre: string
  message?: string
  priorite?: string
  locataire_id?: string
  bien_id?: string
}

export function useAlertes() {
  const [alertes, setAlertes] = useState<Alerte[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchAlertes = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('alertes')
        .select('*, locataire:locataires(*), bien:biens(*)')
        .eq('user_id', user.id)
        .order('lue', { ascending: true })
        .order('priorite', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlertes(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAlertes()
  }, [fetchAlertes])

  // ANTI-DOUBLON : Vérifier si alerte similaire existe déjà
  const alerteExiste = async (type: string, locataireId?: string, bienId?: string, mois?: string): Promise<boolean> => {
    let query = supabase
      .from('alertes')
      .select('id')
      .eq('type', type)
      .eq('lue', false)

    if (locataireId) query = query.eq('locataire_id', locataireId)
    if (bienId) query = query.eq('bien_id', bienId)

    // Pour les alertes mensuelles, vérifier le mois dans le titre
    if (mois) query = query.like('titre', `%${mois}%`)

    const { data } = await query.limit(1)
    return !!(data && data.length > 0)
  }

  const createAlerte = async (formData: AlerteFormData): Promise<Alerte> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const { data, error } = await supabase
      .from('alertes')
      .insert([{
        ...formData,
        user_id: user.id,
        priorite: formData.priorite || 'normale',
        lue: false
      }])
      .select('*, locataire:locataires(*), bien:biens(*)')
      .single()

    if (error) throw error
    await fetchAlertes()
    return data
  }

  const marquerLue = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('alertes')
      .update({ lue: true })
      .eq('id', id)

    if (error) throw error
    await fetchAlertes()
  }

  const marquerToutesLues = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('alertes')
      .update({ lue: true })
      .eq('user_id', user.id)
      .eq('lue', false)

    if (error) throw error
    await fetchAlertes()
  }

  const deleteAlerte = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('alertes')
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchAlertes()
  }

  const supprimerLues = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('alertes')
      .delete()
      .eq('user_id', user.id)
      .eq('lue', true)

    if (error) throw error
    await fetchAlertes()
  }

  // Générer alertes pour les paiements en retard (ANTI-DOUBLON intégré)
  const genererAlertesRetards = async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    // Récupérer paiements en retard
    const { data: paiementsRetard } = await supabase
      .from('paiements')
      .select('*, locataire:locataires(*), bien:biens(*)')
      .eq('user_id', user.id)
      .eq('statut', 'retard')

    if (!paiementsRetard || paiementsRetard.length === 0) return 0

    let count = 0
    for (const paiement of paiementsRetard) {
      // ANTI-DOUBLON : Vérifier si alerte existe déjà
      const existe = await alerteExiste('retard_paiement', paiement.locataire_id, undefined, paiement.mois)

      if (!existe && paiement.locataire) {
        await createAlerte({
          type: 'retard_paiement',
          titre: `Loyer impayé - ${paiement.locataire.nom}`,
          message: `Retard de paiement pour ${paiement.mois}. Montant: ${paiement.montant.toLocaleString()} FCFA`,
          priorite: 'urgente',
          locataire_id: paiement.locataire_id,
          bien_id: paiement.bien_id
        })
        count++
      }
    }

    return count
  }

  // Générer alertes pour les contrats qui expirent bientôt (ANTI-DOUBLON intégré)
  const genererAlertesContrats = async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    const today = new Date()
    const dans30Jours = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]

    // Locataires dont le contrat expire dans 30 jours
    const { data: locataires } = await supabase
      .from('locataires')
      .select('*, bien:biens(*)')
      .eq('user_id', user.id)
      .eq('statut', 'actif')
      .lte('date_fin_contrat', dans30Jours)
      .gte('date_fin_contrat', today.toISOString().split('T')[0])

    if (!locataires || locataires.length === 0) return 0

    let count = 0
    for (const locataire of locataires) {
      // ANTI-DOUBLON
      const existe = await alerteExiste('contrat_expire', locataire.id)

      if (!existe) {
        const joursRestants = Math.ceil(
          (new Date(locataire.date_fin_contrat).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        await createAlerte({
          type: 'contrat_expire',
          titre: `Contrat expire bientôt - ${locataire.nom}`,
          message: `Le contrat expire dans ${joursRestants} jours (${locataire.date_fin_contrat})`,
          priorite: joursRestants <= 7 ? 'haute' : 'normale',
          locataire_id: locataire.id,
          bien_id: locataire.bien_id
        })
        count++
      }
    }

    return count
  }

  // Générer toutes les alertes
  const genererToutesAlertes = async (): Promise<{ retards: number; contrats: number }> => {
    const retards = await genererAlertesRetards()
    const contrats = await genererAlertesContrats()
    await fetchAlertes()
    return { retards, contrats }
  }

  // Stats
  const stats = {
    total: alertes.length,
    nonLues: alertes.filter(a => !a.lue).length,
    urgentes: alertes.filter(a => a.priorite === 'urgente' && !a.lue).length,
    retards: alertes.filter(a => a.type === 'retard_paiement' && !a.lue).length,
    contrats: alertes.filter(a => a.type === 'contrat_expire' && !a.lue).length,
  }

  return {
    alertes,
    isLoading,
    error,
    stats,
    createAlerte,
    marquerLue,
    marquerToutesLues,
    deleteAlerte,
    supprimerLues,
    genererAlertesRetards,
    genererAlertesContrats,
    genererToutesAlertes,
    refetch: fetchAlertes
  }
}
