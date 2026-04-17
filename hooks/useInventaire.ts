'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { InventaireArticle, InventaireArticleFormData } from '@/types'

// ── Stats ──────────────────────────────────────────────────────────────────────
export interface InventaireStats {
  total: number
  valeurTotale: number
  neuf: number
  bon: number
  use: number
  aRemplacer: number
  categories: number
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useInventaire(bienId?: string) {
  const [items,     setItems]     = useState<InventaireArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      let query = supabase
        .from('inventaire')
        .select('*, bien:biens(id, nom, adresse, ville)')
        .eq('user_id', user.id)
        .order('categorie', { ascending: true })
        .order('nom',       { ascending: true })

      if (bienId) query = query.eq('bien_id', bienId)

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setItems((data as InventaireArticle[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }, [bienId])

  useEffect(() => { fetchItems() }, [fetchItems])

  // ── Groupement par catégorie ──────────────────────────────────────────────────
  const parCategorie = items.reduce<Record<string, InventaireArticle[]>>((acc, item) => {
    const cat = item.categorie
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  // ── Stats calculées ──────────────────────────────────────────────────────────
  const stats: InventaireStats = {
    total:        items.length,
    valeurTotale: items.reduce((s, i) => s + (i.valeur ?? 0), 0),
    neuf:         items.filter(i => i.etat === 'neuf').length,
    bon:          items.filter(i => i.etat === 'bon').length,
    use:          items.filter(i => i.etat === 'use').length,
    aRemplacer:   items.filter(i => i.etat === 'a_remplacer').length,
    categories:   Object.keys(parCategorie).length,
  }

  // ── CRUD — { data, error } pour compatibilité avec les pages ─────────────────
  const createItem = async (formData: InventaireArticleFormData) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('inventaire')
        .insert({ ...formData, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      setItems(prev => [...prev, data as InventaireArticle]
        .sort((a, b) => a.categorie.localeCompare(b.categorie) || a.nom.localeCompare(b.nom))
      )
      return { data: data as InventaireArticle, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  const updateItem = async (id: string, formData: Partial<InventaireArticleFormData>) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('inventaire')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setItems(prev => prev.map(i => i.id === id ? data as InventaireArticle : i))
      return { data: data as InventaireArticle, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('inventaire').delete().eq('id', id)
      if (error) throw error
      setItems(prev => prev.filter(i => i.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Erreur' }
    }
  }

  return {
    items,
    parCategorie,
    isLoading,
    error,
    stats,
    refetch: fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
}

export default useInventaire
