import * as XLSX from 'xlsx'

// ─── Utilitaires ──────────────────────────────────────────────────────────────

const formatDate = (date: string | null): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatMontant = (montant: number): string => {
  return `${montant.toLocaleString('fr-FR')} FCFA`
}

const formatMois = (mois: string): string => {
  const [year, month] = mois.split('-')
  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ]
  return `${moisNoms[parseInt(month) - 1]} ${year}`
}

const getFileName = (prefix: string): string => {
  const date = new Date().toISOString().split('T')[0]
  return `ImmoGest_${prefix}_${date}.xlsx`
}

// ─── Export Biens ─────────────────────────────────────────────────────────────

export const exportBiensExcel = (biens: any[]): void => {
  const data = biens.map((bien) => ({
    'Nom':              bien.nom,
    'Type':             bien.type,
    'Adresse':          bien.adresse     || '—',
    'Quartier':         bien.quartier    || '—',
    'Ville':            bien.ville       || 'Dakar',
    'Loyer (FCFA)':     bien.loyer_mensuel,
    'Charges (FCFA)':   bien.charges     || 0,
    'Total (FCFA)':     bien.loyer_mensuel + (bien.charges || 0),
    'Statut':           bien.statut,
    'Nb Unités':        bien.nb_unites   || 1,
    'Locataire':        bien.locataires?.[0]?.nom || 'Vacant',
    'Date création':    formatDate(bien.created_at),
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Biens')

  ws['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
    { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 15 },
  ]

  XLSX.writeFile(wb, getFileName('Biens'))
}

// ─── Export Locataires ────────────────────────────────────────────────────────

export const exportLocatairesExcel = (locataires: any[]): void => {
  const data = locataires.map((loc) => ({
    'Nom':                    loc.nom,
    'Téléphone':              loc.telephone,
    'Email':                  loc.email       || '—',
    'CNI':                    loc.cni         || '—',
    'Profession':             loc.profession  || '—',
    'Bien':                   loc.bien?.nom   || 'Sans logement',
    'Adresse':                loc.bien?.adresse || '—',
    'Loyer (FCFA)':           loc.bien?.loyer_mensuel || '—',
    'Date entrée':            formatDate(loc.date_entree),
    'Fin contrat':            formatDate(loc.date_fin_contrat),
    'Dépôt garantie (FCFA)':  loc.depot_garantie || 0,
    'Statut':                 loc.statut,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Locataires')

  ws['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 18 },
    { wch: 18 }, { wch: 25 }, { wch: 25 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 },
  ]

  XLSX.writeFile(wb, getFileName('Locataires'))
}

// ─── Export Paiements ─────────────────────────────────────────────────────────

export const exportPaiementsExcel = (paiements: any[], mois?: string): void => {
  const data = paiements.map((p) => ({
    'Locataire':       p.locataire?.nom         || '—',
    'Téléphone':       p.locataire?.telephone   || '—',
    'Bien':            p.bien?.nom              || '—',
    'Mois':            formatMois(p.mois),
    'Montant (FCFA)':  p.montant,
    'Date échéance':   formatDate(p.date_echeance),
    'Date paiement':   formatDate(p.date_paiement),
    'Mode':            p.mode_paiement          || '—',
    'Référence':       p.reference              || '—',
    'Statut':          p.statut,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Paiements')

  ws['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
    { wch: 18 }, { wch: 12 },
  ]

  const fileName = mois
    ? `ImmoGest_Paiements_${mois}.xlsx`
    : getFileName('Paiements')

  XLSX.writeFile(wb, fileName)
}

// ─── Export Rapport complet ───────────────────────────────────────────────────

export interface RapportData {
  periode:    string
  biens:      any[]
  locataires: any[]
  paiements:  any[]
  stats: {
    attendu:   number
    encaisse:  number
    impayes:   number
    taux:      number
  }
}

export const exportRapportExcel = (data: RapportData): void => {
  const wb = XLSX.utils.book_new()

  // ── Feuille 1 : Résumé ──
  const resume = [
    ['RAPPORT IMMOGEST', '',  ''],
    ['Période',          data.periode, ''],
    ['', '', ''],
    ['RÉSUMÉ FINANCIER', '', ''],
    ['Revenus attendus',       formatMontant(data.stats.attendu),  ''],
    ['Revenus encaissés',      formatMontant(data.stats.encaisse), ''],
    ['Impayés',                formatMontant(data.stats.impayes),  ''],
    ['Taux de recouvrement',   `${data.stats.taux}%`,              ''],
    ['', '', ''],
    ['PARC IMMOBILIER', '', ''],
    ['Nombre de biens',        data.biens.length,                               ''],
    ['Locataires actifs',      data.locataires.filter((l: any) => l.statut === 'actif').length, ''],
  ]
  const wsResume = XLSX.utils.aoa_to_sheet(resume)
  wsResume['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé')

  // ── Feuille 2 : Revenus par bien ──
  const revenusParBien = data.biens.map((bien: any) => {
    const pb       = data.paiements.filter((p: any) => p.bien_id === bien.id)
    const encaisse = pb.filter((p: any) => p.statut === 'payé').reduce((s: number, p: any) => s + p.montant, 0)
    const impaye   = pb.filter((p: any) => p.statut !== 'payé').reduce((s: number, p: any) => s + p.montant, 0)
    const total    = encaisse + impaye
    return {
      'Bien':         bien.nom,
      'Loyer mensuel': bien.loyer_mensuel,
      'Encaissé':     encaisse,
      'Impayé':       impaye,
      'Total':        total,
      'Taux (%)':     total > 0 ? Math.round((encaisse / total) * 100) : 0,
    }
  })
  const wsRevenus = XLSX.utils.json_to_sheet(revenusParBien)
  wsRevenus['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
  ]
  XLSX.utils.book_append_sheet(wb, wsRevenus, 'Revenus par bien')

  // ── Feuille 3 : Impayés ──
  const impayes = data.paiements
    .filter((p: any) => p.statut === 'retard' || p.statut === 'en_attente')
    .map((p: any) => ({
      'Locataire':  p.locataire?.nom        || '—',
      'Téléphone':  p.locataire?.telephone  || '—',
      'Bien':       p.bien?.nom             || '—',
      'Mois':       formatMois(p.mois),
      'Montant':    p.montant,
      'Échéance':   formatDate(p.date_echeance),
      'Statut':     p.statut,
    }))
  const wsImpayes = XLSX.utils.json_to_sheet(impayes.length ? impayes : [{ Info: 'Aucun impayé sur cette période' }])
  wsImpayes['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
  ]
  XLSX.utils.book_append_sheet(wb, wsImpayes, 'Impayés')

  // ── Feuille 4 : Tous les paiements ──
  const tousPaiements = data.paiements.map((p: any) => ({
    'Locataire':      p.locataire?.nom      || '—',
    'Bien':           p.bien?.nom           || '—',
    'Mois':           formatMois(p.mois),
    'Montant':        p.montant,
    'Statut':         p.statut,
    'Date paiement':  formatDate(p.date_paiement),
    'Mode':           p.mode_paiement       || '—',
    'Référence':      p.reference           || '—',
  }))
  const wsPaiements = XLSX.utils.json_to_sheet(tousPaiements.length ? tousPaiements : [{ Info: 'Aucun paiement' }])
  wsPaiements['!cols'] = [
    { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 18 },
  ]
  XLSX.utils.book_append_sheet(wb, wsPaiements, 'Paiements')

  XLSX.writeFile(wb, `ImmoGest_Rapport_${data.periode.replace(/\s+/g, '_')}.xlsx`)
}

// ─── Export Alertes ───────────────────────────────────────────────────────────

export const exportAlertesExcel = (alertes: any[]): void => {
  const data = alertes.map((a) => ({
    'Type':      a.type,
    'Titre':     a.titre,
    'Message':   a.message    || '—',
    'Priorité':  a.priorite,
    'Locataire': a.locataire?.nom || '—',
    'Bien':      a.bien?.nom      || '—',
    'Statut':    a.lue ? 'Lue' : 'Non lue',
    'Date':      formatDate(a.created_at),
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Alertes')

  ws['!cols'] = [
    { wch: 20 }, { wch: 35 }, { wch: 45 }, { wch: 12 },
    { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 15 },
  ]

  XLSX.writeFile(wb, getFileName('Alertes'))
}
