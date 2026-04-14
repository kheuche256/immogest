'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Type Profile ─────────────────────────────────────────────────────────────

// Colonnes exactes de la table profiles dans Supabase
export interface Profile {
  id: string
  email: string           // depuis auth.users, non écrit en DB
  nom: string
  telephone: string | null
  entreprise: string | null
  plan: string
  logo_url: string | null
  adresse: string | null
  ninea: string | null
  registre_commerce: string | null
  site_web: string | null
  couleur_principale: string
  created_at: string
}

// Colonnes écrivables dans Supabase (jamais updated_at, prenom, ville, etc.)
const PROFILE_DB_COLUMNS = new Set([
  'nom', 'telephone', 'entreprise', 'plan',
  'logo_url', 'adresse', 'ninea', 'registre_commerce', 'site_web', 'couleur_principale',
])

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProfile() {
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError]       = useState<Error | null>(null)

  const supabaseRef = useRef(createClient())
  const supabase    = supabaseRef.current

  // ── Charger le profil depuis Supabase ──────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile({
        ...data,
        email:             user.email ?? '',
        couleur_principale: data?.couleur_principale ?? '#0066FF',
        logo_url:          data?.logo_url          ?? null,
        adresse:           data?.adresse           ?? null,
        ninea:             data?.ninea             ?? null,
        registre_commerce: data?.registre_commerce ?? null,
        site_web:          data?.site_web          ?? null,
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // ── Mettre à jour le profil ────────────────────────────────────────────────
  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<Profile> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    // Filtrer uniquement les colonnes qui existent dans Supabase
    const safeUpdates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (PROFILE_DB_COLUMNS.has(key) && value !== undefined) {
        safeUpdates[key] = value
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...safeUpdates })
      .select()
      .single()

    if (error) throw error

    const updated: Profile = {
      ...data,
      email: user.email ?? '',
      couleur_principale: data?.couleur_principale ?? '#0066FF',
      logo_url: data?.logo_url ?? null,
    }
    setProfile(updated)
    return updated
  }, [supabase])

  // ── Upload logo vers Supabase Storage ──────────────────────────────────────
  const uploadLogo = useCallback(async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    // Vérification taille (2 MB max)
    if (file.size > 2 * 1024 * 1024) throw new Error('Le logo doit faire moins de 2 MB')

    const ext      = file.name.split('.').pop() ?? 'png'
    const filePath = `logos/${user.id}-logo.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('entreprises')
      .upload(filePath, file, { upsert: true, contentType: file.type })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('entreprises')
      .getPublicUrl(filePath)

    // Mettre à jour le profil avec la nouvelle URL
    await updateProfile({ logo_url: publicUrl })

    return publicUrl
  }, [supabase, updateProfile])

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadLogo,
    refetch: fetchProfile,
  }
}
