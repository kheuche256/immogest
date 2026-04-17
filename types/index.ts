// ─── Profile utilisateur ────────────────────────────────────────────────────
// Correspond exactement aux colonnes Supabase : profiles
export interface Profile {
  id: string
  email: string           // depuis auth.users, pas stocké dans profiles
  nom: string
  telephone: string | null
  entreprise: string | null
  plan: 'starter' | 'pro' | 'business'
  // Personnalisation entreprise
  logo_url: string | null
  adresse: string | null
  ninea: string | null
  registre_commerce: string | null
  site_web: string | null
  couleur_principale: string
  created_at: string
}

// ─── Bien immobilier ─────────────────────────────────────────────────────────
export type TypeBien =
  | 'appartement'
  | 'maison'
  | 'villa'
  | 'studio'
  | 'bureau'
  | 'commerce'
  | 'local_commercial'
  | 'immeuble'
  | 'terrain'

export type StatutBien = 'disponible' | 'loue' | 'en_travaux' | 'vendu' | 'maintenance'

// Correspond exactement aux colonnes Supabase : biens
export interface Bien {
  id: string
  user_id: string
  nom: string
  type: TypeBien
  statut: StatutBien
  adresse: string
  ville: string
  quartier?: string
  nb_unites: number         // DEFAULT 1
  loyer_mensuel: number
  charges: number           // DEFAULT 0
  description?: string
  // Location meublée (courte durée)
  est_meuble?: boolean           // true = bien meublé
  tarif_nuit?: number | null     // tarif par nuitée (FCFA)
  tarif_semaine?: number | null  // tarif à la semaine (FCFA)
  tarif_mois?: number | null     // tarif mensuel meublé (FCFA)
  capacite_personnes?: number    // nombre max de personnes
  equipements?: string[]         // ex: ['wifi','piscine','climatisation']
  created_at: string
  updated_at: string
  // Relations
  locataires?: Locataire[]
}

export interface BienFormData {
  nom: string
  type: TypeBien | string
  adresse?: string
  ville?: string
  quartier?: string
  nb_unites?: number
  loyer_mensuel: number
  charges?: number
  description?: string
  statut?: StatutBien | string
  // Location meublée
  est_meuble?: boolean
  tarif_nuit?: number | null
  tarif_semaine?: number | null
  tarif_mois?: number | null
  capacite_personnes?: number
  equipements?: string[]
}

// ─── Locataire ───────────────────────────────────────────────────────────────
export type StatutLocataire =
  | 'actif'
  | 'inactif'
  | 'parti'          // locataire parti / fin de bail
  | 'en_attente'     // en attente d'entrée dans les lieux
  | 'en_retard'      // loyer en retard

// Correspond exactement aux colonnes Supabase : locataires
export interface Locataire {
  id: string
  user_id: string
  bien_id: string | null
  nom: string                     // prénom + nom stockés ensemble
  email?: string
  telephone: string
  cni?: string
  profession?: string
  date_entree: string
  date_fin_contrat?: string
  depot_garantie: number          // DEFAULT 0
  statut: StatutLocataire
  created_at: string
  updated_at: string
  // Relations
  bien?: Bien
  paiements?: Paiement[]
  // Champ UI calculé (pas en DB) — extrait de nom pour l'affichage
  prenom?: string
}

export interface LocataireFormData {
  nom: string
  prenom?: string                 // UI uniquement — fusionné dans nom avant envoi DB
  telephone: string
  email?: string
  cni?: string
  profession?: string
  bien_id?: string | null
  date_entree?: string
  date_fin_contrat?: string
  depot_garantie?: number
  statut?: StatutLocataire | string
}

// ─── Paiement ────────────────────────────────────────────────────────────────
export type StatutPaiement = 'paye' | 'en_attente' | 'en_retard' | 'partiel' | 'annule'
export type MethodePaiement = 'especes' | 'virement' | 'cheque' | 'wave' | 'orange_money' | 'free_money'

export interface Paiement {
  id: string
  user_id: string
  locataire_id: string
  bien_id: string
  montant: number
  montant_paye?: number
  mois: string           // format: 'YYYY-MM'
  date_echeance: string
  date_paiement?: string
  statut: StatutPaiement
  methode?: MethodePaiement
  reference?: string
  notes?: string
  created_at: string
  updated_at: string
  // Relations
  locataire?: Locataire
  bien?: Bien
}

// ─── Alerte / Notification ───────────────────────────────────────────────────
export type TypeAlerte = 'loyer_impaye' | 'contrat_expire' | 'contrat_bientot_expire' | 'travaux' | 'document' | 'autre'
export type PrioriteAlerte = 'faible' | 'moyenne' | 'haute' | 'urgente'

export interface Alerte {
  id: string
  user_id: string
  bien_id?: string
  locataire_id?: string
  paiement_id?: string
  type: TypeAlerte
  priorite: PrioriteAlerte
  titre: string
  message: string
  lue: boolean
  date_echeance?: string
  created_at: string
  // Relations
  bien?: Bien
  locataire?: Locataire
}

// ─── Statistiques Dashboard ──────────────────────────────────────────────────
export interface StatsDashboard {
  total_biens: number
  biens_loues: number
  biens_disponibles: number
  total_locataires: number
  locataires_actifs: number
  revenus_mois_courant: number
  revenus_mois_precedent: number
  taux_occupation: number
  paiements_en_retard: number
  montant_impaye: number
}

// ─── Quittance ───────────────────────────────────────────────────────────────
export interface Quittance {
  id: string
  user_id: string
  paiement_id: string
  locataire_id: string
  bien_id: string
  numero: string
  mois: string
  montant: number
  date_emission: string
  created_at: string
  // Relations
  paiement?: Paiement
  locataire?: Locataire
  bien?: Bien
}

// ─── Réservation ─────────────────────────────────────────────────────────────
export type StatutReservation =
  | 'en_attente'
  | 'confirmee'
  | 'en_cours'
  | 'terminee'
  | 'annulee'

export interface Reservation {
  id: string
  user_id: string
  bien_id: string
  // Client (locataire existant ou nouveau)
  locataire_id?: string | null
  client_nom: string
  client_telephone: string
  client_email?: string
  // Période
  date_debut: string          // ISO date YYYY-MM-DD
  date_fin: string            // ISO date YYYY-MM-DD
  // Tarification
  tarif_nuitee: number
  nb_nuits: number
  montant_total: number
  acompte: number             // DEFAULT 0
  montant_restant: number
  // Statut & meta
  statut: StatutReservation
  notes?: string
  created_at: string
  updated_at: string
  // Relations
  bien?: Bien
  locataire?: Locataire
}

export interface ReservationFormData {
  bien_id: string
  locataire_id?: string | null
  client_nom: string
  client_telephone: string
  client_email?: string
  date_debut: string
  date_fin: string
  tarif_nuitee: number
  acompte?: number
  notes?: string
  statut?: StatutReservation
}

// ─── Charge ───────────────────────────────────────────────────────────────────
export type TypeCharge =
  | 'electricite'
  | 'eau'
  | 'wifi'
  | 'menage'
  | 'gardiennage'
  | 'syndic'
  | 'ordures'
  | 'tv'
  | 'entretien'
  | 'internet'
  | 'reparation'
  | 'autre'

export type PeriodiciteCharge = 'mensuel' | 'trimestriel' | 'annuel' | 'ponctuel'

export interface Charge {
  id: string
  user_id: string
  bien_id: string
  // Champs principaux (table Supabase)
  type: TypeCharge | string
  nom: string
  montant: number
  periodicite: PeriodiciteCharge | string
  inclus_loyer: boolean
  notes?: string
  // Champs optionnels (liens avec d'autres entités)
  locataire_id?: string | null
  reservation_id?: string | null
  created_at: string
  updated_at?: string
  // Relations
  bien?: Bien
  locataire?: Locataire
}

export interface ChargeFormData {
  bien_id: string
  type: TypeCharge | string
  nom: string
  montant: number
  periodicite: PeriodiciteCharge | string
  inclus_loyer: boolean
  notes?: string
  locataire_id?: string | null
  reservation_id?: string | null
}

// ─── Inventaire (table standalone — meubles & équipements) ───────────────────
export type CategorieInventaire =
  | 'mobilier'
  | 'electromenager'
  | 'literie'
  | 'cuisine'
  | 'decoration'
  | 'equipement'
  | 'autre'

export type EtatInventaire = 'neuf' | 'bon' | 'use' | 'a_remplacer'

export interface InventaireArticle {
  id: string
  user_id: string
  bien_id: string
  categorie: CategorieInventaire | string
  nom: string
  quantite: number
  etat: EtatInventaire | string
  valeur?: number | null        // valeur estimée en FCFA
  date_achat?: string | null    // ISO date
  photo_url?: string | null     // URL Supabase Storage
  notes?: string
  created_at: string
  updated_at?: string
  // Relation
  bien?: Bien
}

export interface InventaireArticleFormData {
  bien_id: string
  categorie: CategorieInventaire | string
  nom: string
  quantite: number
  etat: EtatInventaire | string
  valeur?: number | null
  date_achat?: string | null
  photo_url?: string | null
  notes?: string
}

// ─── État des lieux ───────────────────────────────────────────────────────────
// InventaireItem — utilisé uniquement dans les anciens EtatLieux JSON (legacy)
export interface InventaireItem {
  id?: string
  nom: string
  quantite: number
  etat: 'bon' | 'moyen' | 'mauvais'
  notes?: string
}

export type EtatGeneral = 'excellent' | 'bon' | 'moyen' | 'mauvais'
export type PropreteLieux = 'impeccable' | 'propre' | 'a_nettoyer' | 'sale'

// Correspond à la table Supabase : etats_lieux
export interface EtatLieux {
  id: string
  user_id: string
  bien_id: string
  locataire_id?: string | null
  reservation_id?: string | null
  type: 'entree' | 'sortie'
  date_etat: string                       // date de l'état des lieux
  releve_electricite?: number | null      // index compteur électricité
  releve_eau?: number | null              // index compteur eau
  etat_general?: EtatGeneral | null
  proprete?: PropreteLieux | null
  photos?: string[]                       // URLs Supabase Storage
  observations?: string
  anomalies?: string
  signe_proprietaire: boolean
  signe_locataire: boolean
  date_signature?: string | null
  created_at: string
  updated_at?: string
  // Relations
  bien?: Bien
  locataire?: Locataire
  reservation?: { id: string; date_debut: string; date_fin: string }
}

export interface EtatLieuxFormData {
  bien_id: string
  locataire_id?: string | null
  reservation_id?: string | null
  type: 'entree' | 'sortie'
  date_etat: string
  releve_electricite?: number | null
  releve_eau?: number | null
  etat_general?: EtatGeneral | null
  proprete?: PropreteLieux | null
  observations?: string
  anomalies?: string
  signe_proprietaire?: boolean
  signe_locataire?: boolean
}

// ─── Helpers types ────────────────────────────────────────────────────────────
export interface SelectOption {
  value: string
  label: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// ─── Hook return types ────────────────────────────────────────────────────────
export interface UseCrudReturn<T, TForm> {
  items: T[]
  isLoading: boolean
  error: Error | null
  create: (data: TForm) => Promise<T>
  update: (id: string, data: Partial<TForm>) => Promise<T>
  remove: (id: string) => Promise<void>
  getById: (id: string) => Promise<T | null>
  refetch: () => Promise<void>
}
