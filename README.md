# ImmoGest — Gestion Immobilière SaaS

Plateforme de gestion immobilière conçue pour le marché sénégalais. Gérez vos biens, locataires, paiements et quittances en FCFA.

## Stack

- **Framework** : Next.js 16.2.1 (App Router, Turbopack)
- **Base de données** : Supabase (PostgreSQL + Auth + Storage)
- **UI** : Tailwind CSS v4
- **PDF** : @react-pdf/renderer
- **Langue** : TypeScript strict

## Fonctionnalités

- 🏠 Gestion des biens immobiliers (appartements, maisons, bureaux, terrains)
- 👥 Gestion des locataires et contrats
- 💰 Suivi des paiements en FCFA (espèces, Wave, Orange Money, virement)
- 📄 Génération de quittances PDF professionnelles avec taxes sénégalaises
- 📊 Tableau de bord et rapports financiers
- 🏢 Personnalisation entreprise (logo, couleurs, NINEA, RC)
- 🔔 Alertes de contrats expirants et impayés

## Installation

```bash
npm install
```

## Configuration

Copie le fichier d'exemple et renseigne tes variables :

```bash
cp .env.example .env.local
```

Variables requises dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Développement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Build de production

```bash
npm run build
npm start
```

## Structure

```
app/
  (dashboard)/        # Pages protégées (dashboard, biens, locataires...)
  (auth)/             # Pages login/register
  api/                # Routes API (génération PDF quittances)
components/           # Composants réutilisables
hooks/                # Hooks React (useBiens, useLocataires, usePaiements...)
lib/                  # Utilitaires (supabase, format, export)
types/                # Types TypeScript globaux
```

## Base de données Supabase

Tables principales : `profiles`, `biens`, `locataires`, `paiements`

Migration SQL de personnalisation entreprise :

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS adresse TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ninea TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registre_commerce TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS site_web TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS couleur_principale TEXT DEFAULT '#0066FF';

INSERT INTO storage.buckets (id, name, public)
VALUES ('entreprises', 'entreprises', true)
ON CONFLICT (id) DO NOTHING;
```
