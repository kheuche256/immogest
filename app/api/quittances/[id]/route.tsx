import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuittancePDF } from '@/components/quittances/QuittancePDF'
import type { LignePaiement } from '@/components/quittances/QuittancePDF'

// ─── Noms de mois en français (sans accents pour encodage PDF) ────────────────
const MOIS_NOMS = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
]

// ─── Labels modes de paiement ─────────────────────────────────────────────────
const MODE_LABELS: Record<string, string> = {
  especes:   'Especes',
  wave:      'Wave',
  om:        'Orange Money',
  virement:  'Virement bancaire',
}

// ─── Route GET /api/quittances/[id] ──────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // ── 1. Paiement + relations ──────────────────────────────────────────────
    const { data: paiement, error: errPaiement } = await supabase
      .from('paiements')
      .select(`
        *,
        locataire:locataires(*),
        bien:biens(*)
      `)
      .eq('id', id)
      .single()

    if (errPaiement || !paiement) {
      return NextResponse.json({ error: 'Paiement non trouvé' }, { status: 404 })
    }

    // ── 2. Profil bailleur ───────────────────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id ?? '')
      .single()

    // ── 3. Formatage dates / numéro ──────────────────────────────────────────
    const [year, month] = (paiement.mois as string).split('-')
    const moisFormate   = `${MOIS_NOMS[parseInt(month) - 1]} ${year}`

    const dateEmission = new Date().toLocaleDateString('fr-FR')
    const datePaiement = paiement.date_paiement
      ? new Date(paiement.date_paiement).toLocaleDateString('fr-FR')
      : dateEmission

    const numero = `QIT-${year}${month}-${id.slice(0, 4).toUpperCase()}`

    // ── 4. Calcul lignes détaillées ──────────────────────────────────────────
    const loyer   = (paiement.bien?.loyer_mensuel as number) ?? paiement.montant
    const charges = (paiement.bien?.charges       as number) ?? 0
    const tva     = Math.round(loyer * 0.18)    // TVA 18 %
    const txOrd   = Math.round(loyer * 0.036)   // Taxe ordures 3,6 %

    const lignes: LignePaiement[] = [
      { date: datePaiement, libelle: `Loyer ${moisFormate}`,           montant: loyer  },
      { date: datePaiement, libelle: 'TVA 18% sur loyer',              montant: tva    },
      { date: datePaiement, libelle: 'Taxe ordures menageres 3,6%',    montant: txOrd  },
    ]

    if (charges > 0) {
      lignes.push({ date: datePaiement, libelle: `Charges ${moisFormate}`, montant: charges })
    }

    const totalMontant = lignes.reduce((s, l) => s + l.montant, 0)
    const estPaye      = paiement.statut === 'payé'
    const modePaiement = paiement.mode_paiement
      ? (MODE_LABELS[paiement.mode_paiement as string] ?? paiement.mode_paiement)
      : undefined

    // ── 5. Construction données PDF ──────────────────────────────────────────
    const data = {
      entreprise: {
        nom:              profile?.entreprise || profile?.nom || 'ImmoGest',
        adresse:          profile?.adresse           ?? undefined,
        telephone:        profile?.telephone         ?? undefined,
        email:            user?.email                ?? undefined,
        ninea:            profile?.ninea             ?? undefined,
        registreCommerce: profile?.registre_commerce ?? undefined,
        siteWeb:          profile?.site_web          ?? undefined,
        logoUrl:          profile?.logo_url          ?? undefined,
      },
      locataire: {
        nom: paiement.locataire
          ? `${(paiement.locataire.prenom as string) ?? ''} ${paiement.locataire.nom as string}`.trim()
          : 'Locataire',
        telephone: (paiement.locataire?.telephone as string) ?? undefined,
      },
      bien: {
        nom:     (paiement.bien?.nom     as string) ?? 'Bien',
        adresse: (paiement.bien?.adresse as string) ?? undefined,
      },
      numero,
      periode:      moisFormate,
      dateEmission,
      lignes,
      totalMontant,
      estPaye,
      datePaiement: estPaye ? datePaiement : undefined,
      modePaiement: estPaye ? modePaiement : undefined,
    }

    // ── 6. Génération PDF ────────────────────────────────────────────────────
    const pdfBuffer = await renderToBuffer(<QuittancePDF data={data} />)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="Quittance_${numero}.pdf"`,
        'Cache-Control':       'no-store',
      },
    })

  } catch (err) {
    console.error('[API quittances] Erreur génération PDF:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
