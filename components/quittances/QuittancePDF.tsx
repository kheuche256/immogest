import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// ─── Interfaces exportées ────────────────────────────────────────────────────

export interface LignePaiement {
  date: string
  libelle: string
  montant: number
}

export interface QuittanceData {
  entreprise: {
    nom: string
    adresse?: string
    telephone?: string
    email?: string
    ninea?: string
    registreCommerce?: string
    siteWeb?: string
    logoUrl?: string
  }
  locataire: {
    nom: string
    telephone?: string
  }
  bien: {
    nom: string
    adresse?: string
  }
  numero: string
  periode: string
  dateEmission: string
  lignes: LignePaiement[]
  totalMontant: number
  estPaye: boolean
  datePaiement?: string
  modePaiement?: string
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 90,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },

  // ── En-tête ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
    borderBottomStyle: 'solid',
  },
  headerLeft: {
    width: '35%',
    paddingRight: 15,
  },
  headerRight: {
    width: '65%',
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: '#cccccc',
    borderLeftStyle: 'solid',
  },
  logo: {
    width: 70,
    height: 70,
    objectFit: 'contain',
    marginBottom: 5,
  },
  logoPlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#999999',
  },
  entrepriseNom: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  entrepriseSousTitre: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 10,
    letterSpacing: 1,
  },
  entrepriseContact: {
    fontSize: 9,
    color: '#444444',
    marginBottom: 3,
  },
  entrepriseLegal: {
    fontSize: 8,
    color: '#888888',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    borderTopStyle: 'solid',
  },

  // ── Titre document ───────────────────────────────────────────────────────────
  titreSection: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  titre: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  reference: {
    fontSize: 9,
    color: '#cccccc',
    marginTop: 4,
    textAlign: 'center',
  },

  // ── Destinataire + Période ────────────────────────────────────────────────────
  destinataireSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  destinataireBox: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  destinataireLabel: {
    fontSize: 8,
    color: '#888888',
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  destinataireNom: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  destinataireInfo: {
    fontSize: 9,
    color: '#444444',
    marginBottom: 2,
  },
  periodeBox: {
    width: '48%',
    marginLeft: '4%',
    padding: 12,
    backgroundColor: '#e8f4f8',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#0066cc',
    borderLeftStyle: 'solid',
  },
  periodeLabel: {
    fontSize: 8,
    color: '#0066cc',
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  periodeValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#0066cc',
  },

  // ── Tableau ──────────────────────────────────────────────────────────────────
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    fontSize: 9,
    color: '#333333',
  },
  colDate:    { width: '15%' },
  colLibelle: { width: '45%' },
  colMontant: { width: '20%', textAlign: 'right' },
  colStatut:  { width: '20%', textAlign: 'right' },

  // ── Total ─────────────────────────────────────────────────────────────────────
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalBox: {
    width: '45%',
    padding: 14,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 9,
    color: '#aaaaaa',
  },
  totalValue: {
    fontSize: 9,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#444444',
    borderTopStyle: 'solid',
  },
  totalFinalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  totalFinalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#00cc66',
  },

  // ── Cachet PAYÉE ──────────────────────────────────────────────────────────────
  cachetWrap: {
    position: 'absolute',
    top: 340,
    right: 50,
  },
  cachet: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 3,
    borderColor: '#00aa55',
    borderStyle: 'solid',
    borderRadius: 4,
  },
  cachetText: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#00aa55',
    letterSpacing: 3,
  },

  // ── Footer absolu ─────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    borderTopStyle: 'solid',
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 2,
  },
})

// ─── Composant PDF ────────────────────────────────────────────────────────────

export const QuittancePDF = ({ data }: { data: QuittanceData }) => {
  const initiales = data.entreprise.nom.slice(0, 2).toUpperCase()

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── En-tête ── */}
        <View style={S.header}>
          <View style={S.headerLeft}>
            {data.entreprise.logoUrl ? (
              <Image src={data.entreprise.logoUrl} style={S.logo} />
            ) : (
              <View style={S.logoPlaceholder}>
                <Text style={S.logoPlaceholderText}>{initiales}</Text>
              </View>
            )}
          </View>

          <View style={S.headerRight}>
            <Text style={S.entrepriseNom}>{data.entreprise.nom}</Text>
            <Text style={S.entrepriseSousTitre}>GESTION IMMOBILIERE</Text>

            {data.entreprise.adresse     && <Text style={S.entrepriseContact}>{data.entreprise.adresse}</Text>}
            {data.entreprise.telephone   && <Text style={S.entrepriseContact}>Tel : {data.entreprise.telephone}</Text>}
            {data.entreprise.email       && <Text style={S.entrepriseContact}>Email : {data.entreprise.email}</Text>}
            {data.entreprise.siteWeb     && <Text style={S.entrepriseContact}>Web : {data.entreprise.siteWeb}</Text>}

            {(data.entreprise.ninea || data.entreprise.registreCommerce) && (
              <Text style={S.entrepriseLegal}>
                {data.entreprise.ninea ? `NINEA : ${data.entreprise.ninea}` : ''}
                {data.entreprise.ninea && data.entreprise.registreCommerce ? '   |   ' : ''}
                {data.entreprise.registreCommerce ? `RC : ${data.entreprise.registreCommerce}` : ''}
              </Text>
            )}
          </View>
        </View>

        {/* ── Titre ── */}
        <View style={S.titreSection}>
          <Text style={S.titre}>QUITTANCE DE LOYER</Text>
          <Text style={S.reference}>N° {data.numero}   •   Emis le {data.dateEmission}</Text>
        </View>

        {/* ── Destinataire + Période ── */}
        <View style={S.destinataireSection}>
          <View style={S.destinataireBox}>
            <Text style={S.destinataireLabel}>LOCATAIRE</Text>
            <Text style={S.destinataireNom}>{data.locataire.nom}</Text>
            {data.locataire.telephone && <Text style={S.destinataireInfo}>Tel : {data.locataire.telephone}</Text>}
            <Text style={S.destinataireInfo}>Bien : {data.bien.nom}</Text>
            {data.bien.adresse && <Text style={S.destinataireInfo}>{data.bien.adresse}</Text>}
          </View>

          <View style={S.periodeBox}>
            <Text style={S.periodeLabel}>PERIODE</Text>
            <Text style={S.periodeValue}>{data.periode}</Text>
          </View>
        </View>

        {/* ── Tableau ── */}
        <View style={S.table}>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderCell, S.colDate]}>DATE</Text>
            <Text style={[S.tableHeaderCell, S.colLibelle]}>DESIGNATION</Text>
            <Text style={[S.tableHeaderCell, S.colMontant]}>MONTANT</Text>
            <Text style={[S.tableHeaderCell, S.colStatut]}>STATUT</Text>
          </View>

          {data.lignes.map((ligne, i) => (
            <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
              <Text style={[S.tableCell, S.colDate]}>{ligne.date}</Text>
              <Text style={[S.tableCell, S.colLibelle]}>{ligne.libelle}</Text>
              <Text style={[S.tableCell, S.colMontant]}>{fmt(ligne.montant)}</Text>
              <Text style={[S.tableCell, S.colStatut]}>
                {data.estPaye ? 'Paye' : 'En attente'}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Total ── */}
        <View style={S.totalSection}>
          <View style={S.totalBox}>
            {data.modePaiement && (
              <View style={S.totalRow}>
                <Text style={S.totalLabel}>Mode de paiement</Text>
                <Text style={S.totalValue}>{data.modePaiement}</Text>
              </View>
            )}
            {data.datePaiement && (
              <View style={S.totalRow}>
                <Text style={S.totalLabel}>Date de paiement</Text>
                <Text style={S.totalValue}>{data.datePaiement}</Text>
              </View>
            )}
            <View style={S.totalFinal}>
              <Text style={S.totalFinalLabel}>TOTAL</Text>
              <Text style={S.totalFinalValue}>{fmt(data.totalMontant)}</Text>
            </View>
          </View>
        </View>

        {/* ── Cachet PAYEE ── */}
        {data.estPaye && (
          <View style={S.cachetWrap}>
            <View style={S.cachet}>
              <Text style={S.cachetText}>PAYEE</Text>
            </View>
          </View>
        )}

        {/* ── Footer absolu ── */}
        <View style={S.footer}>
          <Text style={S.footerText}>
            Document genere automatiquement — {data.entreprise.nom}
          </Text>
          {data.entreprise.adresse && (
            <Text style={S.footerText}>{data.entreprise.adresse}</Text>
          )}
        </View>

      </Page>
    </Document>
  )
}

export default QuittancePDF
