import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Paiement {
  id: string
  user_id: string
  locataire_id: string
  bien_id: string
  montant: number
  type: 'loyer' | 'charges' | 'depot' | 'autre'
  mois: string // format '2026-03'
  date_paiement: string | null
  date_echeance: string | null
  mode_paiement: 'especes' | 'wave' | 'om' | 'virement' | null
  reference: string | null
  statut: 'payé' | 'en_attente' | 'retard'
  notes: string | null
  created_at: string
  locataire?: any
  bien?: any
}

export interface PaiementFormData {
  locataire_id: string
  bien_id: string
  montant: number
  type?: string
  mois: string
  date_echeance?: string
  date_paiement?: string
  mode_paiement?: string
  reference?: string
  statut?: string
  notes?: string
}

export function usePaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  // Référence stable — évite de recréer le client à chaque render
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const fetchPaiements = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('paiements')
        .select('*, locataire:locataires(*), bien:biens(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPaiements(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchPaiements()
  }, [fetchPaiements])

  // Vérifier si un paiement existe déjà pour ce locataire/mois (ANTI-DOUBLON)
  const paiementExiste = async (locataireId: string, mois: string): Promise<boolean> => {
    const { data } = await supabase
      .from('paiements')
      .select('id')
      .eq('locataire_id', locataireId)
      .eq('mois', mois)
      .single()

    return !!data
  }

  const createPaiement = async (formData: PaiementFormData): Promise<Paiement> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    // ANTI-DOUBLON : Vérifier si paiement existe déjà
    const existe = await paiementExiste(formData.locataire_id, formData.mois)
    if (existe) {
      throw new Error(`Un paiement existe déjà pour ce locataire en ${formData.mois}`)
    }

    const { data, error } = await supabase
      .from('paiements')
      .insert([{
        ...formData,
        user_id: user.id,
        statut: formData.statut || 'en_attente',
        type: formData.type || 'loyer'
      }])
      .select('*, locataire:locataires(*), bien:biens(*)')
      .single()

    if (error) throw error
    await fetchPaiements()
    return data
  }

  const updatePaiement = async (id: string, formData: Partial<PaiementFormData>): Promise<Paiement> => {
    const { data, error } = await supabase
      .from('paiements')
      .update(formData)
      .eq('id', id)
      .select('*, locataire:locataires(*), bien:biens(*)')
      .single()

    if (error) throw error
    await fetchPaiements()
    return data
  }

  // Marquer comme payé
  const marquerPaye = async (id: string, mode: string, reference?: string): Promise<Paiement> => {
    const { data, error } = await supabase
      .from('paiements')
      .update({
        statut: 'payé',
        date_paiement: new Date().toISOString().split('T')[0],
        mode_paiement: mode,
        reference: reference || null
      })
      .eq('id', id)
      .select('*, locataire:locataires(*), bien:biens(*)')
      .single()

    if (error) throw error
    await fetchPaiements()
    return data
  }

  const deletePaiement = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('paiements')
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchPaiements()
  }

  // Générer les échéances du mois pour tous les locataires actifs
  const genererEcheancesMois = async (mois: string): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    // Récupérer tous les locataires actifs avec un bien
    const { data: locataires } = await supabase
      .from('locataires')
      .select('*, bien:biens(*)')
      .eq('user_id', user.id)
      .eq('statut', 'actif')
      .not('bien_id', 'is', null)

    if (!locataires || locataires.length === 0) return 0

    let count = 0
    for (const locataire of locataires) {
      // ANTI-DOUBLON : Vérifier si paiement existe déjà
      const existe = await paiementExiste(locataire.id, mois)
      if (!existe && locataire.bien) {
        const dateEcheance = `${mois}-05` // 5 du mois
        await supabase.from('paiements').insert([{
          user_id: user.id,
          locataire_id: locataire.id,
          bien_id: locataire.bien_id,
          montant: locataire.bien.loyer_mensuel + (locataire.bien.charges || 0),
          type: 'loyer',
          mois: mois,
          date_echeance: dateEcheance,
          statut: 'en_attente'
        }])
        count++
      }
    }

    await fetchPaiements()
    return count
  }

  // Détecter et marquer les retards
  const detecterRetards = async (): Promise<number> => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('paiements')
      .update({ statut: 'retard' })
      .eq('statut', 'en_attente')
      .lt('date_echeance', today)
      .select()

    if (error) throw error
    await fetchPaiements()
    return data?.length || 0
  }

  // Stats du mois
  const getStatsMois = (mois: string) => {
    const paiementsMois = paiements.filter(p => p.mois === mois)
    return {
      total: paiementsMois.length,
      totalMontant: paiementsMois.reduce((sum, p) => sum + p.montant, 0),
      payes: paiementsMois.filter(p => p.statut === 'payé').length,
      payesMontant: paiementsMois.filter(p => p.statut === 'payé').reduce((sum, p) => sum + p.montant, 0),
      enAttente: paiementsMois.filter(p => p.statut === 'en_attente').length,
      enAttenteMontant: paiementsMois.filter(p => p.statut === 'en_attente').reduce((sum, p) => sum + p.montant, 0),
      retards: paiementsMois.filter(p => p.statut === 'retard').length,
      retardsMontant: paiementsMois.filter(p => p.statut === 'retard').reduce((sum, p) => sum + p.montant, 0),
    }
  }

  // Stats globales
  const stats = {
    total: paiements.length,
    payes: paiements.filter(p => p.statut === 'payé').length,
    enAttente: paiements.filter(p => p.statut === 'en_attente').length,
    retards: paiements.filter(p => p.statut === 'retard').length,
    montantRetards: paiements.filter(p => p.statut === 'retard').reduce((sum, p) => sum + p.montant, 0),
  }

  return {
    paiements,
    isLoading,
    error,
    stats,
    createPaiement,
    updatePaiement,
    marquerPaye,
    deletePaiement,
    paiementExiste,
    genererEcheancesMois,
    detecterRetards,
    getStatsMois,
    refetch: fetchPaiements
  }
}
